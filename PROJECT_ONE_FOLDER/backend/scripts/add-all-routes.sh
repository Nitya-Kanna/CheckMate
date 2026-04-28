#!/bin/bash

# Add ALL routes to the new API Gateway (fs05jjlase)
# This consolidates everything into one API

set -e

echo "🚀 Adding all routes to bill-splitter-api..."

REGION="ap-southeast-1"
API_ID="fs05jjlase"
ACCOUNT_ID="323146837282"

echo "📡 Using API Gateway: ${API_ID}"
echo ""

# Function to create integration
create_integration() {
    local function_name=$1
    local route_path=$2
    local method=$3
    
    echo "  Setting up ${method} ${route_path} → ${function_name}"
    
    # Create integration
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
        --api-id ${API_ID} \
        --integration-type AWS_PROXY \
        --integration-uri arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${function_name} \
        --payload-format-version 2.0 \
        --region ${REGION} \
        --query 'IntegrationId' \
        --output text)
    
    # Create route
    aws apigatewayv2 create-route \
        --api-id ${API_ID} \
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
        --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" \
        --region ${REGION} \
        --no-cli-pager > /dev/null 2>&1 || true
    
    echo "  ✅ ${method} ${route_path} configured"
}

echo "🔗 Adding existing endpoints..."
create_integration "get-receipts-function" "/receipts" "GET"
create_integration "get-contacts-function" "/contacts" "GET"

echo ""
echo "🔗 Bill splitting endpoints already added:"
echo "  ✅ POST /ai/parse-bill"
echo "  ✅ POST /split-sessions"
echo "  ✅ POST /payment-requests"

# Get API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api --api-id ${API_ID} --region ${REGION} --query 'ApiEndpoint' --output text)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All routes consolidated in one API Gateway!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📡 API Endpoint: ${API_ENDPOINT}"
echo ""
echo "🔗 All available endpoints:"
echo "  GET  ${API_ENDPOINT}/receipts"
echo "  GET  ${API_ENDPOINT}/contacts"
echo "  POST ${API_ENDPOINT}/ai/parse-bill"
echo "  POST ${API_ENDPOINT}/split-sessions"
echo "  POST ${API_ENDPOINT}/payment-requests"
echo ""
echo "📝 Update your frontend API_BASE_URL to:"
echo "  ${API_ENDPOINT}"
echo ""

# Made with Bob
