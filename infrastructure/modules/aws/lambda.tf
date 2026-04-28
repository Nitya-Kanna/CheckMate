locals {
  lambda_functions = {
    ocr = {
      timeout = 60
      memory  = 512
    }
    manual-split = {
      timeout = 30
      memory  = 256
    }
    message = {
      timeout = 30
      memory  = 256
    }
  }
}

# Create a dummy handler for initial deployment
data "archive_file" "dummy_lambda" {
  type        = "zip"
  output_path = "${path.module}/dummy_lambda.zip"

  source {
    content  = "def handler(event, context):\n    return {\"statusCode\": 200, \"body\": \"OK\"}\n"
    filename = "app.py"
  }
}

resource "aws_lambda_function" "functions" {
  for_each = local.lambda_functions

  function_name = "${var.project_name}-${each.key}-${var.environment}"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "app.handler"
  runtime       = "python3.12"
  timeout       = each.value.timeout
  memory_size   = each.value.memory

  filename         = data.archive_file.dummy_lambda.output_path
  source_code_hash = data.archive_file.dummy_lambda.output_base64sha256

  vpc_config {
    subnet_ids         = [aws_subnet.private_a.id, aws_subnet.private_b.id]
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      BEDROCK_MODEL_ID = var.bedrock_model_id
      OSS_BUCKET       = var.oss_bucket_name
      OSS_ENDPOINT     = var.oss_endpoint
      REDIS_URL        = "redis://${aws_elasticache_replication_group.main.primary_endpoint_address}:6379"
      ENVIRONMENT      = var.environment
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  depends_on = [aws_iam_role_policy_attachment.lambda_vpc_access]
}
