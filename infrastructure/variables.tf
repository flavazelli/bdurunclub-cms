variable "project_id" {}
variable "region" { default = "us-central1" }
variable "zone" { default = "us-central1-a" }

variable "vpc_connector_range" {
  default = "10.8.0.0/28"
}

variable "mongo_password" {
  description = "MongoDB root password"
  sensitive   = true
}

variable "mongo_db" {
  default = "mydb"
}

variable "backup_bucket" {
  default = "your-mongo-backups"
}

variable "grafana_password" {
  default = "password"
  sensitive = true
}
