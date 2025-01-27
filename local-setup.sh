#!/bin/bash

# Function to compare versions as there is node version condition to run nestjs 11
version_greater_equal() {
  printf '%s\n%s' "$2" "$1" | sort -C -V
}

# Check Node.js version and update if necessary
echo "Checking Node.js version..."
node_version=$(node -v | grep -oP '\d+\.\d+\.\d+')
min_version1="20.11.0"
min_version2="22.0.0"

if version_greater_equal $node_version $min_version1 || version_greater_equal $node_version $min_version2; then
  echo "Node.js version is $node_version, no update needed."
else
  echo "Node.js version is $node_version, updating Node.js..."
  # Use n package to update Node.js
  npm install -g n
  n stable
  node_version=$(node -v | grep -oP '\d+\.\d+\.\d+')
  echo "Node.js updated to version: $node_version"
fi

if [[ -z "$POSTGRES_PASSWORD" ]]; then
  echo "Error: Please set the POSTGRES_PASSWORD environment variable."
fi

read -s -p "Enter PostgreSQL password: " POSTGRES_PASSWORD
# Export the PGPASSWORD for the postgres user
export PGPASSWORD=$POSTGRES_PASSWORD
echo ""

# PostgreSQL database details, may change for yourself as needed
DB_NAME="MOTOR_INSURANCE_WEBSITE"
DB_USER="pgadmin"
DB_PASSWORD="P@ssw0rd"
TABLE_NAME="PRODUCT"
PSQL="psql -h localhost -U postgres"

# Check if PostgreSQL is installed
echo "Checking PostgreSQL database availability, you may exit and manually setup db and table..."
if ! command -v psql > /dev/null; then
  echo "PostgreSQL is not installed. Please install it and try again."
  exit 1
fi

# Create database
echo "Creating PostgreSQL database, new user and products table..."
$PSQL -c "CREATE DATABASE \"$DB_NAME\";"
$PSQL -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
$PSQL -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Export the PGPASSWORD for the new user
export PGPASSWORD=$DB_PASSWORD

# Insert data
echo "Inserting data into products table..."
psql -h localhost -U $DB_USER -d $DB_NAME -f setup.sql

echo "Pre-setup completed successfully."
echo "You may now start the application using 'npm run start' or 'npm run start:dev'."
read -p "Do you want to start the application? (yes/no): " start_app

if [ "$start_app" == "yes" ]; then
  echo "Starting application - zurich-nestjs..."
  npm install
  npm run start:dev
else
  echo "You can start the application later by running 'npm install' and 'npm run start:dev'."
fi