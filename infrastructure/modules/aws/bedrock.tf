data "aws_iam_policy_document" "bedrock" {
  statement {
    sid    = "BedrockInvokeModel"
    effect = "Allow"

    actions = [
      "bedrock:InvokeModel",
      "bedrock:InvokeModelWithResponseStream"
    ]

    resources = [
      "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-5-sonnet-*"
    ]
  }
}

resource "aws_iam_policy" "bedrock" {
  name_prefix = "${var.project_name}-bedrock-"
  policy      = data.aws_iam_policy_document.bedrock.json

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
