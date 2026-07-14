# Contexto de build: a RAIZ do projeto cortecerto/ (veja docker-compose.yml).
# Assim conseguimos copiar tanto o front (frontend/) quanto a API (api-dotnet/).

# ---- Etapa 1: build do front-end (Svelte + Vite) ----
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Etapa 2: build da API .NET ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY api-dotnet/CorteCerto.Api/CorteCerto.Api.csproj CorteCerto.Api/
RUN dotnet restore CorteCerto.Api/CorteCerto.Api.csproj
COPY api-dotnet/CorteCerto.Api/ CorteCerto.Api/
RUN dotnet publish CorteCerto.Api/CorteCerto.Api.csproj -c Release -o /app/publicado

# ---- Etapa 3: imagem final (runtime + site em wwwroot) ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publicado .
COPY --from=frontend /app/dist ./wwwroot
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
CMD ["dotnet", "CorteCerto.Api.dll"]
