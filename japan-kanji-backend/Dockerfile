# ===== Stage 1: Build JAR voi Maven =====
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
# Chuyen doi line-ending CRLF (Windows) sang LF (Linux) va cap quyen thuc thi cho mvnw
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ===== Stage 2: Run JAR voi JRE nhe =====
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
# Gioi han RAM cho JVM de chay muot tren may EC2 t3.micro / t3.small
ENTRYPOINT ["java", "-Xmx512m", "-jar", "app.jar"]

