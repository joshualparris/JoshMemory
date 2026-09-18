FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    JOSHMEMORY_BIND=0.0.0.0 \
    JOSHMEMORY_DB_PATH=/data/memory.sqlite

WORKDIR /app

COPY pyproject.toml README.md ./
COPY joshmemory ./joshmemory

RUN python -m pip install --no-cache-dir .

RUN mkdir -p /data

EXPOSE 8080

CMD ["/bin/sh", "-c", "exec joshmemory-central --host 0.0.0.0 --port ${PORT:-8080} --db ${JOSHMEMORY_DB_PATH:-/data/memory.sqlite}"]
