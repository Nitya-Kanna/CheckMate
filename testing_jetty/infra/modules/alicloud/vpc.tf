data "alicloud_zones" "available" {
  available_resource_creation = "VSwitch"
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "alicloud_vpc" "main" {
  vpc_name   = "${local.name_prefix}-vpc"
  cidr_block = var.vpc_cidr
  tags       = local.common_tags
}

resource "alicloud_vswitch" "public_a" {
  vswitch_name = "${local.name_prefix}-public-a"
  vpc_id       = alicloud_vpc.main.id
  cidr_block   = "10.20.1.0/24"
  zone_id      = data.alicloud_zones.available.zones[0].id
  tags         = local.common_tags
}

resource "alicloud_vswitch" "public_b" {
  vswitch_name = "${local.name_prefix}-public-b"
  vpc_id       = alicloud_vpc.main.id
  cidr_block   = "10.20.2.0/24"
  zone_id      = data.alicloud_zones.available.zones[1].id
  tags         = local.common_tags
}

resource "alicloud_vswitch" "private_a" {
  vswitch_name = "${local.name_prefix}-private-a"
  vpc_id       = alicloud_vpc.main.id
  cidr_block   = "10.20.10.0/24"
  zone_id      = data.alicloud_zones.available.zones[0].id
  tags         = local.common_tags
}

resource "alicloud_vswitch" "private_b" {
  vswitch_name = "${local.name_prefix}-private-b"
  vpc_id       = alicloud_vpc.main.id
  cidr_block   = "10.20.11.0/24"
  zone_id      = data.alicloud_zones.available.zones[1].id
  tags         = local.common_tags
}

resource "alicloud_nat_gateway" "main" {
  vpc_id               = alicloud_vpc.main.id
  nat_gateway_name     = "${local.name_prefix}-nat"
  vswitch_id           = alicloud_vswitch.public_a.id
  nat_type             = "Enhanced"
  payment_type = "PayAsYouGo"
  tags                 = local.common_tags
}

resource "alicloud_eip_address" "nat" {
  address_name = "${local.name_prefix}-nat-eip"
  isp          = "BGP"
  bandwidth    = "10"
  payment_type = "PayAsYouGo"
  internet_charge_type = "PayByBandwidth"
  tags                 = local.common_tags
}

resource "alicloud_eip_association" "nat" {
  allocation_id = alicloud_eip_address.nat.id
  instance_id   = alicloud_nat_gateway.main.id
}

resource "alicloud_snat_entry" "private_a" {
  snat_table_id     = split(",", alicloud_nat_gateway.main.snat_table_ids)[0]
  source_vswitch_id = alicloud_vswitch.private_a.id
  snat_ip           = alicloud_eip_address.nat.ip_address
  depends_on        = [alicloud_eip_association.nat]
}

resource "alicloud_snat_entry" "private_b" {
  snat_table_id     = split(",", alicloud_nat_gateway.main.snat_table_ids)[0]
  source_vswitch_id = alicloud_vswitch.private_b.id
  snat_ip           = alicloud_eip_address.nat.ip_address
  depends_on        = [alicloud_eip_association.nat]
}

resource "alicloud_security_group" "fc_sg" {
  security_group_name = "${local.name_prefix}-fc-sg"
  vpc_id              = alicloud_vpc.main.id
  tags   = local.common_tags
}

resource "alicloud_security_group_rule" "fc_sg_ingress" {
  type              = "ingress"
  ip_protocol       = "tcp"
  nic_type          = "intranet"
  policy            = "accept"
  port_range        = "443/443"
  priority          = 1
  security_group_id = alicloud_security_group.fc_sg.id
  cidr_ip           = var.vpc_cidr
}

resource "alicloud_security_group_rule" "fc_sg_egress" {
  type              = "egress"
  ip_protocol       = "all"
  nic_type          = "intranet"
  policy            = "accept"
  port_range        = "-1/-1"
  priority          = 1
  security_group_id = alicloud_security_group.fc_sg.id
  cidr_ip           = "0.0.0.0/0"
}

resource "alicloud_route_table" "private" {
  vpc_id           = alicloud_vpc.main.id
  route_table_name = "${local.name_prefix}-private-rt"
  tags             = local.common_tags
}

resource "alicloud_route_table_attachment" "private_a" {
  route_table_id = alicloud_route_table.private.id
  vswitch_id     = alicloud_vswitch.private_a.id
}

resource "alicloud_route_table_attachment" "private_b" {
  route_table_id = alicloud_route_table.private.id
  vswitch_id     = alicloud_vswitch.private_b.id
}
