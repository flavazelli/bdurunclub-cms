provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_compute_network" "default" {
  name                     = "default"
  auto_create_subnetworks  = true
  description              = "Default network for the project"
  enable_ula_internal_ipv6 = false
}

resource "google_compute_firewall" "allow_mongo_exporter" {
  name    = "allow-mongo-exporter"
  network = google_compute_network.default.name

  allow {
    protocol = "tcp"
    ports    = ["9216"]
  }

  source_ranges = ["0.0.0.0/0"]  # You can restrict this to specific IP ranges
}


resource "google_compute_firewall" "allow_prometheus" {
  name    = "allow-prometheus"
  network = google_compute_network.default.name

  allow {
    protocol = "tcp"
    ports    = ["9090"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["mongo"]
}

resource "google_compute_firewall" "allow_grafana" {
  name    = "allow-grafana"
  network = google_compute_network.default.name

  allow {
    protocol = "tcp"
    ports    = ["3000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["mongo"]
}


resource "google_compute_firewall" "default_allow_icmp" {
  name    = "default-allow-icmp"
  network = google_compute_network.default.id

  allow {
    protocol = "icmp"
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_firewall" "allow_iap_mongo" {
  name    = "allow-iap-mongo"
  network = google_compute_network.default.name

  allow {
    protocol = "tcp"
    ports    = ["27017"]
  }

  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["mongo"]
}



resource "google_compute_firewall" "allow_mongo_from_cloudrun" {
  name    = "allow-mongo-from-cloudrun"
  network = google_compute_network.default.name

  allow {
    protocol = "tcp"
    ports    = ["27017"]
  }

  source_ranges = [var.vpc_connector_range]
  target_tags   = ["mongo"]
}

# Create the service account for VM and grant storage access
resource "google_service_account" "mongo_vm_sa" {
  account_id   = "mongo-vm-sa"
  display_name = "MongoDB VM Service Account"
}

resource "google_project_iam_member" "mongo_vm_sa_storage" {
  project = var.project_id 
  role   = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.mongo_vm_sa.email}"
}

resource "google_compute_disk" "mongo_data_disk" {
  name  = "mongo-data-disk"
  type  = "pd-standard"
  zone  = var.zone
  size  = 20 # adjust as needed

  lifecycle {
    prevent_destroy = true
  }
}


resource "google_compute_instance" "mongodb_vm" {
  name         = "mongodb-vm"
  machine_type = "e2-small"
  zone         = var.zone

  tags = ["mongo"]

  boot_disk {
    initialize_params {
      image = "ubuntu-2204-lts"
      size  = 10
    }
  }

  attached_disk {
    source      = google_compute_disk.mongo_data_disk.id
    device_name = "mongo-data-disk"
  }

  network_interface {
    network = google_compute_network.default.name
    access_config {}
  }

  metadata_startup_script = templatefile("${path.module}/scripts/mongo-prometheus-grafana-install.sh.tmpl", {
    mongo_password = var.mongo_password
    gcs_bucket = google_storage_bucket.mongo_backups.name
    grafana_password = var.grafana_password
  })

 service_account {
    email  = google_service_account.mongo_vm_sa.email
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }
}

resource "google_vpc_access_connector" "mongo_connector" {
  name    = "mongo-connector"
  region  = var.region
  network = google_compute_network.default.id

  min_instances = 2
  max_instances = 3

  ip_cidr_range = "10.8.0.0/28"
}

resource "google_cloud_run_service" "bdu_run_club" {
  name     = "bdu-run-club"
  location = var.region
  template {
    spec {
      containers {
        image       = "northamerica-northeast2-docker.pkg.dev/wired-episode-239400/cloud-run-source-deploy/bdurunclub/bdu-run-club:abba760a737d3cded85d0150900bc0c38628458b"
        env {
          name  = "VITE_BASE_API_URL"
          value = "https://backend.bdurunclub.com/api"
        }
        env {
          name  = "VITE_MAP_TILER_KEY"
          value = "nzUJrrPcUiGLNkhSGHpz"
        } 
        ports {
          container_port = 8080
          name           = "http1"
        }
        resources {
          limits   = {
              "cpu"    = "2000m"
              "memory" = "2Gi"
          }
          requests = {}
      }
      }
    }
  }
}

resource "google_cloud_run_service" "bdurunclub-cms" {
  name     = "bdurunclub-cms"
  location = var.region

  template {
    spec {
      containers {
        image = "northamerica-northeast2-docker.pkg.dev/wired-episode-239400/cloud-run-source-deploy/bdurunclub-cms/bdurunclub-cms@sha256:2a7ea30761e171073d99145e2529365ebad4216e4629505260ac8c58faf1fddc"
        env {
          name  = "DATABASE_URI"
          value = "mongodb://root:${var.mongo_password}@${google_compute_instance.mongodb_vm.network_interface.0.network_ip}:27017/${var.mongo_db}?authSource=admin"
        }
        env {
          name  = "CLIENT_URL" 
          value = "https://bdurunclub.com" 
        }
        env {
            name  = "CRON_SECRET" 
            value = "yie4t6RRqHvdcFixv0PNW5sV" 
        }
        env {
            name  = "DATABASE_NAME" 
            value = "bdurunclub" 
        }
        env {
            name  = "ENV" 
            value = "production" 
        }
        env {
            name  = "GCS_BUCKET" 
            value = "bdu-run-club" 
        }
        env {
            name  = "GCS_PROJECT_ID" 
            value = "wired-episode-239400" 
        }
        env {
            name  = "PAYLOAD_CONFIG_PATH" 
            value = "dist/payload.config.js" 
        }
        env {
            name  = "PAYLOAD_SECRET" 
            value = "cb4c78ede6f227fe8c3b0481" 
        }
        env {
            name  = "SENTRY_AUTH_TOKEN" 
            value = "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" 
        }
        env {
            name  = "SERVER_URL" 
            value = "https://backend.bdurunclub.com" 
        }
        env {
            name  = "SMTP_HOST" 
            value = "smtp.mailersend.net" 
        }
        env {
            name  = "SMTP_PASS" 
            value = "mssp.ey8FhG9.pxkjn41pj804z781.StIT0on" 
        }
        env {
            name  = "SMTP_PORT" 
            value = "587" 
        }
        env {
            name  = "SMTP_USER" 
            value = "MS_1PD4AI@test-xkjn41m2yk54z781.mlsender.net" 
        }
        env {
            name  = "TELEGRAM_BOT_API_TOKEN" 
            value = "7291702192:AAEFiAdT9Ck9pA5ZPjIo5Z4G-WIFkieG07E" 
        }
        env {
            name  = "TELEGRAM_CHAT_ID" 
            value = "-1002641469536" 
        }
      }
    }
    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.mongo_connector.name
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_project_service" "enable_services" {
  for_each = toset([
    "compute.googleapis.com",
    "run.googleapis.com",
    "vpcaccess.googleapis.com",
    "cloudbuild.googleapis.com",
    "storage.googleapis.com"
  ])
  service = each.key
}

resource "google_storage_bucket" "mongo_backups" {
  name     = "bdurunclub-mongo-backups"
  location = var.region

  # Define the lifecycle rule to delete backups older than 30 days
  lifecycle_rule {
    action {
      type = "Delete"
    }

    condition {
      age = 30
    }
  }
}
