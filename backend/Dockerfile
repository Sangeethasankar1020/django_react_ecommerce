FROM python:3.13.5-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create static and media directories
RUN mkdir -p static media

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000