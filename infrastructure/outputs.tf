output "mongodb_internal_ip" {
  value = google_compute_instance.mongodb_vm.network_interface[0].network_ip
}

# output "cloud_run_url" {
#   value = google_cloud_run_service.nextjs_app.status[0].url
# }

output "backup_bucket_url" {
  value = google_storage_bucket.mongo_backups.url
}
