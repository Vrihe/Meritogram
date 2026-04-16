FROM python:3.11-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Копируем и устанавливаем зависимости Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код бэкенда
COPY . .

# Открываем порт 8000
EXPOSE 8000

# Команда запуска (учитывая структуру на твоем скрине)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]