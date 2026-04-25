resource "alicloud_oss_bucket" "receipts" {
  bucket = "${var.project_name}-receipts-${var.environment}"

  server_side_encryption_rule {
    sse_algorithm = "AES256"
  }

  versioning {
    status = "Enabled"
  }

  lifecycle_rule {
    id      = "transition-to-ia"
    prefix  = ""
    enabled = true

    transitions {
      days          = 30
      storage_class = "IA"
    }

    expiration {
      days = 365
    }
  }

  cors_rule {
    allowed_origins = ["*"]
    allowed_methods = ["GET", "POST", "PUT"]
    allowed_headers = ["*"]
    max_age_seconds = 3000
  }

  tags = local.common_tags
}

resource "alicloud_oss_bucket_acl" "receipts" {
  bucket = alicloud_oss_bucket.receipts.bucket
  acl    = "private"
}
