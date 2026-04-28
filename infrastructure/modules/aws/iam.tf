resource "aws_iam_role" "lambda_execution" {
  name_prefix = "${var.project_name}-lambda-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# ElastiCache policy
data "aws_iam_policy_document" "elasticache" {
  statement {
    sid    = "ElastiCacheAccess"
    effect = "Allow"

    actions = [
      "elasticache:*"
    ]

    resources = [
      aws_elasticache_replication_group.main.arn
    ]
  }
}

resource "aws_iam_policy" "elasticache" {
  name_prefix = "${var.project_name}-elasticache-"
  policy      = data.aws_iam_policy_document.elasticache.json

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_role_policy_attachment" "lambda_elasticache" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.elasticache.arn
}

# Bedrock policy attachment
resource "aws_iam_role_policy_attachment" "lambda_bedrock" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.bedrock.arn
}

# CloudWatch Logs policy
data "aws_iam_policy_document" "cloudwatch" {
  statement {
    sid    = "CloudWatchLogs"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]

    resources = [
      "arn:aws:logs:*:*:log-group:/aws/lambda/${var.project_name}-*"
    ]
  }
}

resource "aws_iam_policy" "cloudwatch" {
  name_prefix = "${var.project_name}-cloudwatch-"
  policy      = data.aws_iam_policy_document.cloudwatch.json

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_role_policy_attachment" "lambda_cloudwatch" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = aws_iam_policy.cloudwatch.arn
}
