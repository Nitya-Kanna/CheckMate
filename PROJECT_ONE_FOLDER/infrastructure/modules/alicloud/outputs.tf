output "vpc_id" {
  description = "ID of the created VPC"
  value       = alicloud_vpc.main.id
}

output "oss_bucket_name" {
  description = "Name of the OSS bucket"
  value       = alicloud_oss_bucket.receipts.bucket
}

output "oss_bucket_endpoint" {
  description = "External endpoint of the OSS bucket"
  value       = alicloud_oss_bucket.receipts.extranet_endpoint
}

output "fc_service_name" {
  description = "Name of the Function Compute service"
  value       = alicloud_fc_service.main.name
}

output "fc_function_name" {
  description = "Name of the Function Compute function"
  value       = alicloud_fc_function.nlp_split.name
}

output "fc_trigger_url" {
  description = "URL of the FC HTTP trigger"
  value       = "https://${alicloud_fc_function.nlp_split.name}.${alicloud_fc_service.main.name}.ap-southeast-3.fc.aliyuncs.com/api/split/nlp"
}

output "private_vswitch_ids" {
  description = "IDs of the private vSwitches"
  value       = [alicloud_vswitch.private_a.id, alicloud_vswitch.private_b.id]
}
