# Giai đoạn Build: Sử dụng Maven với Temurin 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Vẫn giữ nguyên đường dẫn có tiền tố để đảm bảo tìm thấy tệp từ gốc repo
COPY quan-ly-noi-that-backend/pom.xml .
COPY quan-ly-noi-that-backend/src ./src
RUN mvn clean package -DskipTests

# Giai đoạn Runtime: Sử dụng Temurin JRE 17 nhẹ hơn
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","app.jar"]