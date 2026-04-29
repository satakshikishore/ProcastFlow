# Use official Python image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements first (for caching)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files
COPY . .

# Expose port
EXPOSE 5000

# Start the app with gunicorn
CMD ["gunicorn", "app:create_app()", "--bind", "0.0.0.0:5000"]