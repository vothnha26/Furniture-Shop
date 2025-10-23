# Giai đoạn Build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Bỏ tiền tố
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Giai đoạn Runtime
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]