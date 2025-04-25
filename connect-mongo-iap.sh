#!/bin/bash

# CONFIGURE THESE
INSTANCE=mongodb-vm
ZONE=northamerica-northeast2-a
PROJECT=wired-episode-239400
LOCAL_PORT=27018
REMOTE_PORT=27017

echo "🔐 Starting IAP tunnel to MongoDB via $INSTANCE..."
gcloud compute start-iap-tunnel $INSTANCE $REMOTE_PORT \
  --local-host-port=localhost:$LOCAL_PORT \
  --zone=$ZONE \
  --project=$PROJECT \
  --verbosity=info
  