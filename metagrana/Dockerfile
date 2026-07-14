# ---- Etapa 1: build do front-end (Vue 3 + Vite) ----
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Etapa 2: API Python + front compilado ----
FROM python:3.12-slim

WORKDIR /app

# Instala as dependências primeiro (aproveita o cache do Docker entre builds)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY --from=frontend /app/dist ./static

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
