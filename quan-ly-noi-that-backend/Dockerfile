FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Sửa: Thêm "quan-ly-noi-that-backend/" vào đường dẫn nguồn (source path)
COPY quan-ly-noi-that-backend/pom.xml .
COPY quan-ly-noi-that-backend/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]