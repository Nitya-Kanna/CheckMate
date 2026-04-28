variable "vpc_cidr" {
  description = "CIDR block for AWS VPC"
  type        = string
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "bedrock_model_id" {
  description = "Bedrock model ID"
  type        = string
}

variable "cors_origins" {
  description = "Allowed CORS origins"
  type        = list(string)
}

variable "alicloud_vpc_cidr" {
  description = "CIDR block for Alibaba Cloud VPC (for VPN routing)"
  type        = string
}

variable "oss_bucket_name" {
  description = "Alibaba Cloud OSS bucket name for receipt storage"
  type        = string
  default     = ""
}

variable "oss_endpoint" {
  description = "Alibaba Cloud OSS endpoint"
  type        = string
  default     = "oss-ap-southeast-3.aliyuncs.com"
}
