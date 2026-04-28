#!/bin/bash

# Add new routes to existing API Gateway
# This adds the 3 new endpoints to your old API (tstxkw26v5)

set -e

echo "🚀 Adding routes to existing API Gateway..."

REGION="ap-southeast-1"
OLD_API_ID="fs05jjlase"  # The API we just found
ACCOUNT_ID="323146837282"

echo "📡 Using API Gateway: ${OLD_API_ID}"
echo ""

# Function to create integration
create_integration() {
    local function_name=$1
    local route_path=$2
    local method=$3
    
    echo "  Setting up ${method} ${route_path} → ${function_name}"
    
    # Create integration
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
        --api-id ${OLD_API_ID} \
        --integration-type AWS_PROXY \
        --integration-uri arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${function_name} \
        --payload-format-version 2.0 \
        --region ${REGION} \
        --query 'IntegrationId' \
        --output text)
    
    # Create route
    aws apigatewayv2 create-route \
        --api-id ${OLD_API_ID} \
        --route-key "${method} ${route_path}" \
        --target integrations/${INTEGRATION_ID} \
        --region ${REGION} \
        --no-cli-pager > /dev/null
    
    # Add Lambda permission
    aws lambda add-permission \
        --function-name ${function_name} \
        --statement-id apigateway-${function_name}-$(date +%s) \
        --action lambda:InvokeFunction \
        --principal apigateway.amazonaws.com \
        --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${OLD_API_ID}/*/*" \
        --region ${REGION} \
        --no-cli-pager > /dev/null 2>&1 || true
    
    echo "  ✅ ${method} ${route_path} configured"
}

echo "🔗 Creating Lambda integrations..."
create_integration "parse-bill" "/ai/parse-bill" "POST"
create_integration "create-split-session" "/split-sessions" "POST"
create_integration "create-payment-requests" "/payment-requests" "POST"

# Get API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api --api-id ${OLD_API_ID} --region ${REGION} --query 'ApiEndpoint' --output text)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Routes added to existing API Gateway!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📡 API Endpoint: ${API_ENDPOINT}"
echo ""
echo "🔗 New endpoints available:"
echo "  POST ${API_ENDPOINT}/ai/parse-bill"
echo "  POST ${API_ENDPOINT}/split-sessions"
echo "  POST ${API_ENDPOINT}/payment-requests"
echo ""
echo "✅ Your frontend is already using this API!"
echo ""

