# Giai đoạn Build: Sử dụng Maven với Temurin 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .

# Tải dependencies
RUN mvn dependency:go-offline

COPY src ./src

# (4) Chạy build
RUN mvn clean package -DskipTests

# Giai đoạn Runtime: Sử dụng Temurin JRE 17 nhẹ hơn
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]