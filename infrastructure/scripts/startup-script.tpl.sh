# scripts/startup-script.tpl.sh

# This script installs MongoDB, WireGuard, and sets up the VPN tunnel

#!/bin/bash

# Install MongoDB and dependencies
apt update
apt install -y gnupg curl wireguard ufw

# MongoDB install
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

systemctl enable mongod
systemctl start mongod

# Setup MongoDB admin user
mongosh <<EOF
use admin
db.createUser({user: "admin", pwd: "${admin_password}", roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]})
EOF

# Enable auth and bind to localhost
sed -i '/#security:/a\security:\n  authorization: enabled' /etc/mongod.conf
sed -i 's/bindIp: .*/bindIp: 127.0.0.1/' /etc/mongod.conf
systemctl restart mongod

# WireGuard Setup
mkdir -p /etc/wireguard
cd /etc/wireguard

# Generate server keys
wg genkey | tee server_private.key | wg pubkey > server_public.key
chmod 600 server_private.key

# Read generated keys
SERVER_PRIVATE_KEY=$(cat server_private.key)

# Create wg0.conf
cat <<EOF > /etc/wireguard/wg0.conf
[Interface]
PrivateKey = \$SERVER_PRIVATE_KEY
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = ${client_public_key}
AllowedIPs = 10.0.0.2/32
EOF

ufw allow 51820/udp

# Enable IP forwarding
sysctl -w net.ipv4.ip_forward=1

# Start WireGuard
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

# End of startup script