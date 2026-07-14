# ---- Etapa 1: build do front-end (Angular 17) ----
FROM node:20-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Etapa 2: build do back-end com Maven ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Baixa as dependências primeiro para aproveitar o cache entre builds
RUN mvn dependency:go-offline -q
COPY src ./src
# O Angular compilado vira o conteúdo estático servido pelo Spring Boot
COPY --from=frontend /app/dist/browser ./src/main/resources/static
RUN mvn package -DskipTests -q

# ---- Etapa 3: imagem final só com o JRE e o jar ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/planify-1.0.0.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
