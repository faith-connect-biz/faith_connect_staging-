# Running Local Database with Docker Compose

This guide explains how to run the PostgreSQL database locally using Docker Compose.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed

## Quick Start

1. **Start the database:**
   ```bash
   docker-compose up -d
   ```

2. **Check if containers are running:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f postgres
   ```

## Configuration

### Default Connection Settings

- **Database:** `faith_connect`
- **User:** `postgres`
- **Password:** `postgres`
- **Host:** `localhost`
- **Port:** `5432`

### Environment Variables

You can customize the database configuration by creating a `.docker.env` file or overriding environment variables in your Django settings.

Update your `.env` file with these database settings:
```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=faith_connect
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

## Services

### PostgreSQL Database
- **Container:** `faith_connect_db`
- **Port:** 5432
- **Volume:** `postgres_data` (persists data between restarts)

### pgAdmin (Optional)
- **Container:** `faith_connect_pgadmin`
- **URL:** http://localhost:5050
- **Email:** admin@faithconnect.local
- **Password:** admin
- **Volume:** `pgadmin_data` (persists settings)

## Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes all data)
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f
```

### Execute commands in container
```bash
docker-compose exec postgres psql -U postgres -d faith_connect
```

### Backup database
```bash
docker-compose exec postgres pg_dump -U postgres faith_connect > backup.sql
```

### Restore database
```bash
docker-compose exec -T postgres psql -U postgres faith_connect < backup.sql
```

## Django Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run migrations:
   ```bash
   python manage.py migrate
   ```

3. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

4. Run development server:
   ```bash
   python manage.py runserver
   ```

## Troubleshooting

### Port already in use
If port 5432 is already in use, you can change it in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use port 5433 on host
```

### Reset database
```bash
docker-compose down -v
docker-compose up -d
python manage.py migrate
```

### Check database connection
```bash
docker-compose exec postgres psql -U postgres -d faith_connect -c "SELECT version();"
```

## Production Notes

⚠️ **This setup is for local development only.** For production:
- Use strong passwords
- Use environment-specific configuration
- Enable SSL/TLS
- Use proper volume management
- Consider managed database services (AWS RDS, Railway, etc.)
