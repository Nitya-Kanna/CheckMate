data "archive_file" "dummy_code" {
  type        = "zip"
  output_path = "${path.module}/dummy.zip"

  source {
    content  = "def handler(event, context):\n    return 'hello'\n"
    filename = "index.py"
  }
}

resource "alicloud_ram_role" "fc_role" {
  role_name                 = "${var.project_name}-fc-role-${var.environment}"
  assume_role_policy_document = <<EOF
  {
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Effect": "Allow",
        "Principal": {
          "Service": [
            "fc.aliyuncs.com"
          ]
        }
      }
    ],
    "Version": "1"
  }
  EOF
  tags = local.common_tags
}

resource "alicloud_ram_role_policy_attachment" "fc_oss" {
  policy_name = "AliyunOSSFullAccess"
  policy_type = "System"
  role_name   = alicloud_ram_role.fc_role.role_name
}

resource "alicloud_ram_role_policy_attachment" "fc_vpc" {
  policy_name = "AliyunVPCFullAccess"
  policy_type = "System"
  role_name   = alicloud_ram_role.fc_role.role_name
}

resource "alicloud_fc_service" "main" {
  name            = "${var.project_name}-split-svc"
  role            = alicloud_ram_role.fc_role.arn
  internet_access = false

  vpc_config {
    vswitch_ids = [
      alicloud_vswitch.private_a.id,
      alicloud_vswitch.private_b.id
    ]
    security_group_id = alicloud_security_group.fc_sg.id
  }

  tags = local.common_tags
}

resource "alicloud_fc_function" "nlp_split" {
  service = alicloud_fc_service.main.name
  name    = "nlp-split"
  runtime      = "python3.10"
  handler      = "index.handler"
  memory_size  = 512
  timeout      = 60

  environment_variables = {
    DASHSCOPE_MODEL_ID = "qwen-turbo"
    ENVIRONMENT        = var.environment
  }

  filename = data.archive_file.dummy_code.output_path
}

resource "alicloud_fc_trigger" "http" {
  service  = alicloud_fc_service.main.name
  function = alicloud_fc_function.nlp_split.name
  name          = "http-trigger"
  type          = "http"
  config        = <<EOF
  {
    "authType": "anonymous",
    "methods": ["POST"]
  }
  EOF
}
