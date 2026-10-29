FROM eclipse-temurin:25-jdk AS build

WORKDIR /workspace
COPY backend/album_boxd_api/mvnw backend/album_boxd_api/mvnw.cmd ./backend/album_boxd_api/
COPY backend/album_boxd_api/.mvn ./backend/album_boxd_api/.mvn
COPY backend/album_boxd_api/pom.xml ./backend/album_boxd_api/
RUN chmod +x backend/album_boxd_api/mvnw
RUN cd backend/album_boxd_api && ./mvnw dependency:go-offline -B

COPY backend/album_boxd_api/src ./backend/album_boxd_api/src
RUN cd backend/album_boxd_api && ./mvnw clean package -DskipTests -B

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=build /workspace/backend/album_boxd_api/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
