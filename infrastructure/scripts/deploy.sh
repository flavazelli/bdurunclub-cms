gcloud secrets versions access latest --secret=\"app_env\" > app_env.json
# Convert the fetched secret JSON to environment variable format
cat app_env.json | jq -r 'to_entries[] | "\(.key)=\(.value)"' > /opt/infra/docker-compose/.env
rm app_env.json
cd /opt/infra/docker-compose
docker-compose pull backend
docker-compose restart backend