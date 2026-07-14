# ---- Etapa 1: build com Maven (não precisa ter Maven instalado na máquina) ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Baixa as dependências primeiro para aproveitar o cache entre builds
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# ---- Etapa 2: imagem final só com o JRE e o jar ----
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/planify-1.0.0.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
