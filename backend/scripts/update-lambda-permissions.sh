#!/bin/bash

# Script to update Lambda IAM permissions for DynamoDB access
# This attaches the DynamoDB policy to existing Lambda execution roles

set -e

echo "============================================================"
echo "UPDATING LAMBDA IAM PERMISSIONS"
echo "============================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Policy name
POLICY_NAME="BillSplitter-Lambda-DynamoDB-Policy"

# Get AWS account ID
echo "Getting AWS account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $ACCOUNT_ID"
echo ""

# Create or update the IAM policy
echo "Creating/updating IAM policy: $POLICY_NAME"
POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"

# Check if policy exists
if aws iam get-policy --policy-arn "$POLICY_ARN" 2>/dev/null; then
    echo -e "${YELLOW}Policy already exists. Creating new version...${NC}"
    
    # Delete old versions if there are too many (max 5 versions allowed)
    VERSIONS=$(aws iam list-policy-versions --policy-arn "$POLICY_ARN" --query 'Versions[?IsDefaultVersion==`false`].VersionId' --output text)
    for VERSION in $VERSIONS; do
        echo "Deleting old policy version: $VERSION"
        aws iam delete-policy-version --policy-arn "$POLICY_ARN" --version-id "$VERSION" 2>/dev/null || true
    done
    
    # Create new version
    aws iam create-policy-version \
        --policy-arn "$POLICY_ARN" \
        --policy-document file://lambda-dynamodb-policy.json \
        --set-as-default
    echo -e "${GREEN}✓ Policy updated${NC}"
else
    echo "Creating new policy..."
    aws iam create-policy \
        --policy-name "$POLICY_NAME" \
        --policy-document file://lambda-dynamodb-policy.json \
        --description "Allows Lambda functions to access BillSplitter DynamoDB tables"
    echo -e "${GREEN}✓ Policy created${NC}"
fi
echo ""

# List of Lambda function names
FUNCTIONS=(
    "get-receipts-function"
    "get-contacts-function"
)

# Attach policy to each Lambda's execution role
for FUNCTION_NAME in "${FUNCTIONS[@]}"; do
    echo "Processing function: $FUNCTION_NAME"
    
    # Get the Lambda function's role ARN
    ROLE_ARN=$(aws lambda get-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --query Role --output text 2>/dev/null || echo "")
    
    if [ -z "$ROLE_ARN" ]; then
        echo -e "${RED}✗ Function $FUNCTION_NAME not found${NC}"
        continue
    fi
    
    # Extract role name from ARN
    ROLE_NAME=$(echo "$ROLE_ARN" | awk -F'/' '{print $NF}')
    echo "  Role: $ROLE_NAME"
    
    # Attach the policy to the role
    if aws iam attach-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-arn "$POLICY_ARN" 2>/dev/null; then
        echo -e "${GREEN}  ✓ Policy attached to $ROLE_NAME${NC}"
    else
        echo -e "${YELLOW}  ⚠ Policy may already be attached to $ROLE_NAME${NC}"
    fi
    echo ""
done

echo "============================================================"
echo -e "${GREEN}✅ PERMISSIONS UPDATE COMPLETE!${NC}"
echo "============================================================"
echo ""
echo "Next steps:"
echo "1. Package and deploy updated Lambda functions"
echo "2. Test the endpoints with real DynamoDB data"
echo ""

