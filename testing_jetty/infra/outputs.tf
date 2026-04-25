output "aws_api_gateway_url" {
  description = "AWS API Gateway URL"
  value       = module.aws.api_gateway_url
}

output "alicloud_fc_trigger_url" {
  description = "Alibaba Cloud FC HTTP trigger URL"
  value       = module.alicloud.fc_trigger_url
}

output "aws_vpc_id" {
  description = "AWS VPC ID"
  value       = module.aws.vpc_id
}

output "alicloud_vpc_id" {
  description = "Alibaba Cloud VPC ID"
  value       = module.alicloud.vpc_id
}

output "oss_bucket_name" {
  description = "Alibaba Cloud OSS bucket name"
  value       = module.alicloud.oss_bucket_name
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = module.aws.redis_endpoint
}
