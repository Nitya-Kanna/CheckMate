variable "vpc_cidr" {
  description = "CIDR block for Alibaba Cloud VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, staging, prod)"
  type        = string
}

variable "aws_vpc_cidr" {
  description = "AWS VPC CIDR for VPN routing"
  type        = string
  default     = "10.10.0.0/16"
}

