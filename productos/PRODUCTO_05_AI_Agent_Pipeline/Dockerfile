FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY config.yml ./

ENV PYTHONPATH=/app/src
ENV PIPELINE_CONFIG_PATH=/app/config.yml

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
