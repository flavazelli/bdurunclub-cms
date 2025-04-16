provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_compute_instance" "mongodb" {
  name         = "mongodb-vm"
  machine_type = var.machine_type
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = 20
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  metadata_startup_script = templatefile("${path.module}/scripts/startup-script.tpl.sh", {
    admin_password = var.admin_password
    project_id     = var.project_id
    client_public_key = var.client_public_key
  })

  tags = ["mongodb"]

  service_account {
    email  = google_service_account.mongodb_sa.email
    scopes = ["https://www.googleapis.com/auth/devstorage.read_write"]
  }
}

resource "google_service_account" "mongodb_sa" {
  account_id   = "mongodb-sa"
  display_name = "MongoDB VM Service Account"
}

resource "google_project_iam_member" "gcs_writer" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.mongodb_sa.email}"
}

resource "google_storage_bucket" "mongo_backups" {
  name     = "${var.project_id}-mongo-backups"
  location = var.region
  force_destroy = true
}

resource "google_compute_firewall" "allow-ssh" {
  name    = "allow-ssh"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "deny-mongodb-port" {
  name    = "deny-mongodb"
  network = "default"

  deny {
    protocol = "tcp"
    ports    = ["27017"]
  }

  source_ranges = ["0.0.0.0/0"]
}

output "vm_ip" {
  value = google_compute_instance.mongodb.network_interface[0].access_config[0].nat_ip
} 

# variables.tf additions

variable "client_public_key" {
  description = "WireGuard public key of the client"
  type        = string
}

