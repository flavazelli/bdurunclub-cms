variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  default = "us-central1"
}

variable "zone" {
  default = "us-central1-a"
}

variable "machine_type" {
  default = "e2-micro"
}

variable "admin_password" {
  description = "MongoDB admin password"
  type        = string
  sensitive   = true
}

