#!/bin/bash

# Script to package and deploy Lambda functions with updated backend code
# This creates deployment packages and updates existing Lambda functions

set -e

echo "============================================================"
echo "DEPLOYING LAMBDA FUNCTIONS"
echo "============================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create deployment directory
DEPLOY_DIR="deploy"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

echo "Installing dependencies..."
# Activate virtual environment if it exists
if [ -f "../.venv/bin/activate" ]; then
    source ../.venv/bin/activate
fi
pip3 install -q boto3 -t "$DEPLOY_DIR/"
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Copy shared modules
echo "Copying shared modules..."
cp utils.py "$DEPLOY_DIR/"
cp models.py "$DEPLOY_DIR/"
cp db.py "$DEPLOY_DIR/"
echo -e "${GREEN}✓ Shared modules copied${NC}"
echo ""

# Function to deploy a Lambda
deploy_lambda() {
    local FUNCTION_NAME=$1
    local HANDLER_FILE=$2
    local HANDLER_NAME=$3
    
    echo "============================================================"
    echo "Deploying: $FUNCTION_NAME"
    echo "============================================================"
    
    # Create function-specific directory
    FUNCTION_DIR="${DEPLOY_DIR}/${FUNCTION_NAME}"
    mkdir -p "$FUNCTION_DIR"
    
    # Copy all files to function directory
    cp -r "${DEPLOY_DIR}"/*.py "$FUNCTION_DIR/" 2>/dev/null || true
    cp -r "${DEPLOY_DIR}"/boto* "$FUNCTION_DIR/" 2>/dev/null || true
    cp "handlers/${HANDLER_FILE}" "$FUNCTION_DIR/lambda_function.py"
    
    # Create deployment package
    cd "$FUNCTION_DIR"
    ZIP_FILE="../${FUNCTION_NAME}.zip"
    zip -q -r "$ZIP_FILE" .
    cd - > /dev/null
    
    echo "  Package created: ${FUNCTION_NAME}.zip"
    
    # Update Lambda function
    echo "  Updating Lambda function..."
    if aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file "fileb://${DEPLOY_DIR}/${FUNCTION_NAME}.zip" \
        --region ap-southeast-1 > /dev/null; then
        echo -e "${GREEN}  ✓ Function updated successfully${NC}"
    else
        echo -e "${RED}  ✗ Failed to update function${NC}"
        return 1
    fi
    
    # Wait for update to complete
    echo "  Waiting for update to complete..."
    aws lambda wait function-updated \
        --function-name "$FUNCTION_NAME" \
        --region ap-southeast-1
    echo -e "${GREEN}  ✓ Update complete${NC}"
    echo ""
}

# Deploy each Lambda function
deploy_lambda "get-receipts-function" "get_receipts.py" "lambda_handler"
deploy_lambda "get-contacts-function" "get_contacts.py" "lambda_handler"

echo "============================================================"
echo -e "${GREEN}✅ ALL LAMBDA FUNCTIONS DEPLOYED!${NC}"
echo "============================================================"
echo ""
echo "Deployed functions:"
echo "  - get-receipts-function (GET /receipts)"
echo "  - get-contacts-function (GET /contacts)"
echo ""
echo "Next steps:"
echo "1. Deploy get-history-function (new)"
echo "2. Add GET /history route to API Gateway"
echo "3. Test endpoints with real DynamoDB data"
echo ""

# Cleanup
echo "Cleaning up deployment files..."
rm -rf "$DEPLOY_DIR"
echo -e "${GREEN}✓ Cleanup complete${NC}"

# Made with Bob
