#!/bin/bash

# MongoDB + Backup + Secure Setup Script

ADMIN_USER="admin"
ADMIN_PASS="${admin_password}"
PROJECT_ID="${project_id}"

# Install dependencies
apt-get update
apt-get install -y gnupg curl tar cron unzip google-cloud-sdk

# Add MongoDB repo and install
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-6.0.list

apt-get update
apt-get install -y mongodb-org

# Enable MongoDB
systemctl start mongod
systemctl enable mongod

# Create admin user
mongosh <<EOF
use admin
db.createUser({user: "$ADMIN_USER", pwd: "$ADMIN_PASS", roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]})
EOF

# Enable auth
sed -i '/#security:/a\security:\n  authorization: enabled' /etc/mongod.conf

# Bind only to localhost
sed -i 's/bindIp: .*/bindIp: 127.0.0.1/' /etc/mongod.conf

systemctl restart mongod

# Create backup script
cat <<EOB > /usr/local/bin/mongo-backup.sh
#!/bin/bash
TIMESTAMP=\$(date +%F-%H%M)
BACKUP_DIR="/tmp/mongo-backup-\$TIMESTAMP"
mkdir \$BACKUP_DIR
mongodump --username admin --password '$ADMIN_PASS' --authenticationDatabase admin --out \$BACKUP_DIR
tar -czf /tmp/mongo-\$TIMESTAMP.tar.gz -C /tmp mongo-backup-\$TIMESTAMP
gsutil cp /tmp/mongo-\$TIMESTAMP.tar.gz gs://$PROJECT_ID-mongo-backups/
rm -rf \$BACKUP_DIR /tmp/mongo-\$TIMESTAMP.tar.gz
EOB

chmod +x /usr/local/bin/mongo-backup.sh

# Add daily cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/mongo-backup.sh") | crontab -
