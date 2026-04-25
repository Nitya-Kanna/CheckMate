provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key_id
  secret_key = var.aws_secret_access_key
  token      = var.aws_session_token
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

provider "alicloud" {
  region     = var.alicloud_region
  access_key = var.alicloud_access_key_id
  secret_key = var.alicloud_access_key_secret
}

module "aws" {
  source = "./modules/aws"

  vpc_cidr                = var.aws_vpc_cidr
  project_name            = var.project_name
  environment             = var.environment
  bedrock_model_id        = var.bedrock_model_id
  cors_origins            = var.cors_origins
  alicloud_vpc_cidr       = var.alicloud_vpc_cidr
  oss_bucket_name         = module.alicloud.oss_bucket_name
  oss_endpoint            = "oss-ap-southeast-3.aliyuncs.com"
}

module "alicloud" {
  source = "./modules/alicloud"

  providers = {
    alicloud = alicloud
  }

  vpc_cidr           = var.alicloud_vpc_cidr
  project_name       = var.project_name
  environment        = var.environment
  aws_vpc_cidr       = var.aws_vpc_cidr
}
