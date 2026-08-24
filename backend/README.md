# Gym Tracker — Backend

API REST en Spring Boot 3 + Java 21 + PostgreSQL + JWT.

## Requisitos

- Java 21 (JDK)
- Maven 3.9+ (o usa el wrapper `./mvnw` si lo generas con `mvn -N wrapper:wrapper`)
- Docker (opcional, para levantar PostgreSQL fácilmente) o una instancia local de PostgreSQL 16

## 1. Levantar la base de datos

Con Docker (recomendado):

```bash
docker compose up -d
```

Esto crea una base `gym_tracker` en `localhost:5432` con usuario `postgres` / clave `postgres`.

Si prefieres una instalación local de PostgreSQL, crea la base manualmente:

```sql
CREATE DATABASE gym_tracker;
```

## 2. Variables de entorno

Copia `.env.example` a `.env` (o expórtalas en tu shell) y ajusta si es necesario:

```
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=cambia-esto-por-una-clave-secreta-de-al-menos-32-caracteres
```

## 3. Ejecutar la aplicación

```bash
mvn spring-boot:run
```

Por defecto corre con el perfil `dev` (`SPRING_PROFILES_ACTIVE=dev`), apuntando a `localhost:5432`.

Al arrancar, Flyway ejecuta automáticamente las migraciones (`V1__init_schema.sql`, `V2__seed_exercises.sql`), creando las tablas y cargando 30 ejercicios base.

La API queda disponible en `http://localhost:8080`.

## 4. Probar que funciona

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Manuel","email":"manuel@test.com","password":"123456"}'
```

Debe devolver un JSON con `token`, `userId`, `name`, `email`.

Luego:

```bash
curl http://localhost:8080/api/exercises \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

Debe devolver la lista de 30 ejercicios sembrados.

## Endpoints principales

Ver la especificación completa en el documento de arquitectura. Resumen:

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/exercises`
- `GET/POST/PUT/DELETE /api/routines`, `POST /api/routines/{id}/duplicate`
- `POST /api/workouts` (iniciar), `GET /api/workouts/active`, `GET /api/workouts`, `GET /api/workouts/{id}`
- `POST /api/workouts/{id}/exercises/{workoutExerciseId}/sets` (registrar/actualizar serie, incluye `completed:true` para marcarla)
- `PUT /api/workouts/{id}/finish`, `PUT /api/workouts/{id}/cancel`, `PUT /api/workouts/{id}/pause`
- `GET/POST/DELETE /api/body-weight`
- `GET /api/progress`, `GET /api/progress/exercises/{id}`

## Notas de arquitectura

- Cada endpoint (salvo `/api/auth/**`) exige `Authorization: Bearer <token>`.
- El `user_id` nunca se toma del cliente: siempre se resuelve desde el JWT (`CurrentUserService`).
- El volumen de entrenamiento y los PRs se calculan on-the-fly desde la tabla `sets`, no se guardan materializados.
