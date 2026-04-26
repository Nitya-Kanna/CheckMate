#!/bin/bash

# Setup API Gateway for new Lambda functions
# This script creates API Gateway routes and integrations

set -e

echo "🚀 Setting up API Gateway..."

REGION="ap-southeast-1"
API_NAME="bill-splitter-api"
ACCOUNT_ID="323146837282"

# Check if API Gateway exists
echo "📡 Checking for existing API Gateway..."
API_ID=$(aws apigatewayv2 get-apis --region ${REGION} --query "Items[?Name=='${API_NAME}'].ApiId" --output text 2>/dev/null || echo "")

if [ -z "$API_ID" ]; then
    echo "Creating new HTTP API Gateway..."
    API_ID=$(aws apigatewayv2 create-api \
        --name ${API_NAME} \
        --protocol-type HTTP \
        --cors-configuration AllowOrigins='*',AllowMethods='GET,POST,PUT,DELETE,OPTIONS',AllowHeaders='*' \
        --region ${REGION} \
        --query 'ApiId' \
        --output text)
    echo "✅ Created API Gateway: ${API_ID}"
else
    echo "✅ Found existing API Gateway: ${API_ID}"
fi

# Create integrations for each Lambda function
echo ""
echo "🔗 Creating Lambda integrations..."

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

# Create routes for new Lambda functions
create_integration "parse-bill" "/ai/parse-bill" "POST"
create_integration "create-split-session" "/split-sessions" "POST"
create_integration "create-payment-requests" "/payment-requests" "POST"

# Create or update stage
echo ""
echo "🎭 Setting up stage..."
aws apigatewayv2 create-stage \
    --api-id ${API_ID} \
    --stage-name prod \
    --auto-deploy \
    --region ${REGION} \
    --no-cli-pager > /dev/null 2>&1 || \
aws apigatewayv2 update-stage \
    --api-id ${API_ID} \
    --stage-name prod \
    --auto-deploy \
    --region ${REGION} \
    --no-cli-pager > /dev/null

echo "✅ Stage configured"

# Get API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api --api-id ${API_ID} --region ${REGION} --query 'ApiEndpoint' --output text)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ API Gateway setup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📡 API Endpoint: ${API_ENDPOINT}"
echo ""
echo "🔗 Available endpoints:"
echo "  POST ${API_ENDPOINT}/ai/parse-bill"
echo "  POST ${API_ENDPOINT}/split-sessions"
echo "  POST ${API_ENDPOINT}/payment-requests"
echo ""
echo "📝 Update your frontend API_BASE_URL to:"
echo "  ${API_ENDPOINT}"
echo ""

# Made with Bob
