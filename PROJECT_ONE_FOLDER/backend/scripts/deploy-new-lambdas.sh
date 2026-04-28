#!/bin/bash

# Deploy new Lambda functions for bill splitting
# Run this script from the backend directory

set -e  # Exit on error

echo "🚀 Deploying new Lambda functions..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# AWS Region
REGION="ap-southeast-1"

# Lambda function names
PARSE_BILL_FUNCTION="parse-bill"
CREATE_SPLIT_SESSION_FUNCTION="create-split-session"
CREATE_PAYMENT_REQUESTS_FUNCTION="create-payment-requests"

# Create deployment packages
echo -e "${BLUE}📦 Creating deployment packages...${NC}"

# Function to create Lambda package
create_package() {
    local handler_file=$1
    local function_name=$2
    local zip_file="${function_name}.zip"
    
    echo "  Creating package for ${function_name}..."
    
    # Create temp directory
    mkdir -p temp_${function_name}
    
    # Copy handler and dependencies
    cp handlers/${handler_file} temp_${function_name}/lambda_function.py
    cp utils.py temp_${function_name}/
    cp db.py temp_${function_name}/
    cp models.py temp_${function_name}/ 2>/dev/null || true
    
    # Create zip
    cd temp_${function_name}
    zip -r ../${zip_file} . > /dev/null
    cd ..
    
    # Cleanup
    rm -rf temp_${function_name}
    
    echo -e "  ${GREEN}✓${NC} Created ${zip_file}"
}

# Create packages for all 3 functions
create_package "parse_bill.py" "${PARSE_BILL_FUNCTION}"
create_package "create_split_session.py" "${CREATE_SPLIT_SESSION_FUNCTION}"
create_package "create_payment_requests.py" "${CREATE_PAYMENT_REQUESTS_FUNCTION}"

echo ""
echo -e "${BLUE}☁️  Deploying to AWS Lambda...${NC}"

# Function to deploy Lambda
deploy_lambda() {
    local function_name=$1
    local zip_file="${function_name}.zip"
    
    echo "  Deploying ${function_name}..."
    
    # Check if function exists
    if aws lambda get-function --function-name ${function_name} --region ${REGION} > /dev/null 2>&1; then
        # Update existing function
        aws lambda update-function-code \
            --function-name ${function_name} \
            --zip-file fileb://${zip_file} \
            --region ${REGION} \
            --no-cli-pager > /dev/null
        echo -e "  ${GREEN}✓${NC} Updated ${function_name}"
    else
        # Create new function
        aws lambda create-function \
            --function-name ${function_name} \
            --runtime python3.11 \
            --role arn:aws:iam::323146837282:role/bill-splitter-lambda-exec-role \
            --handler lambda_function.lambda_handler \
            --zip-file fileb://${zip_file} \
            --timeout 30 \
            --memory-size 256 \
            --region ${REGION} \
            --no-cli-pager > /dev/null
        echo -e "  ${GREEN}✓${NC} Created ${function_name}"
    fi
}

# Deploy all 3 functions
deploy_lambda "${PARSE_BILL_FUNCTION}"
deploy_lambda "${CREATE_SPLIT_SESSION_FUNCTION}"
deploy_lambda "${CREATE_PAYMENT_REQUESTS_FUNCTION}"

echo ""
echo -e "${GREEN}✅ All Lambda functions deployed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "  1. Add these functions to API Gateway:"
echo "     - POST /ai/parse-bill → ${PARSE_BILL_FUNCTION}"
echo "     - POST /split-sessions → ${CREATE_SPLIT_SESSION_FUNCTION}"
echo "     - POST /payment-requests → ${CREATE_PAYMENT_REQUESTS_FUNCTION}"
echo ""
echo "  2. Test the endpoints with Postman or curl"
echo ""
echo "  3. Update frontend API service to use new endpoints"

# Cleanup zip files
echo ""
read -p "Clean up zip files? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f ${PARSE_BILL_FUNCTION}.zip
    rm -f ${CREATE_SPLIT_SESSION_FUNCTION}.zip
    rm -f ${CREATE_PAYMENT_REQUESTS_FUNCTION}.zip
    echo -e "${GREEN}✓${NC} Cleaned up zip files"
fi

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"

# Made with Bob
