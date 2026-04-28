output "api_gateway_url" {
  description = "AWS API Gateway URL"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "vpc_id" {
  description = "AWS VPC ID"
  value       = aws_vpc.main.id
}

output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

output "lambda_sg_id" {
  description = "Lambda security group ID"
  value       = aws_security_group.lambda.id
}

