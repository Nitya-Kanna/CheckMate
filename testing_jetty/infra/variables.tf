variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "aws_access_key_id" {
  description = "AWS access key ID"
  type        = string
  sensitive   = true
}

variable "aws_secret_access_key" {
  description = "AWS secret access key"
  type        = string
  sensitive   = true
}

variable "aws_session_token" {
  description = "AWS session token (required for temporary credentials)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "alicloud_region" {
  description = "Alibaba Cloud region"
  type        = string
  default     = "ap-southeast-3"
}

variable "alicloud_access_key_id" {
  description = "Alibaba Cloud access key ID"
  type        = string
  sensitive   = true
}

variable "alicloud_access_key_secret" {
  description = "Alibaba Cloud access key secret"
  type        = string
  sensitive   = true
}

variable "aws_vpc_cidr" {
  description = "CIDR block for AWS VPC"
  type        = string
  default     = "10.10.0.0/16"
}

variable "alicloud_vpc_cidr" {
  description = "CIDR block for Alibaba Cloud VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
  default     = "ai-bill-splitter"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "cors_origins" {
  description = "Allowed CORS origins"
  type        = list(string)
  default     = ["http://localhost:5173", "http://localhost:3000"]
}

variable "bedrock_model_id" {
  description = "Bedrock model ID for OCR/NLP"
  type        = string
  default     = "anthropic.claude-3-5-sonnet-20241022-v2:0"
}
