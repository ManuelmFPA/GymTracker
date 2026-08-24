CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    height DOUBLE PRECISION,
    target_weight DOUBLE PRECISION,
    profile_image_url VARCHAR(500),
    age INTEGER,
    goal VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE body_weight (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight DOUBLE PRECISION NOT NULL,
    date DATE NOT NULL,
    notes VARCHAR(500)
);
CREATE INDEX idx_body_weight_user ON body_weight(user_id, date);

CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    muscle_group VARCHAR(60) NOT NULL,
    primary_muscle VARCHAR(60),
    equipment VARCHAR(60),
    description TEXT,
    instructions TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);

CREATE TABLE workout_routines (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_routines_user ON workout_routines(user_id);

CREATE TABLE routine_exercises (
    id BIGSERIAL PRIMARY KEY,
    routine_id BIGINT NOT NULL REFERENCES workout_routines(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id),
    exercise_order INTEGER NOT NULL,
    target_sets INTEGER NOT NULL,
    target_reps_min INTEGER,
    target_reps_max INTEGER,
    rest_seconds INTEGER NOT NULL DEFAULT 90
);
CREATE INDEX idx_routine_exercises_routine ON routine_exercises(routine_id);

CREATE TABLE workouts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    routine_id BIGINT REFERENCES workout_routines(id) ON DELETE SET NULL,
    routine_name_snapshot VARCHAR(120),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration BIGINT,
    status VARCHAR(20) NOT NULL,
    notes TEXT
);
CREATE INDEX idx_workouts_user ON workouts(user_id, start_time);
CREATE INDEX idx_workouts_user_status ON workouts(user_id, status);

CREATE TABLE workout_exercises (
    id BIGSERIAL PRIMARY KEY,
    workout_id BIGINT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id BIGINT NOT NULL REFERENCES exercises(id),
    exercise_order INTEGER NOT NULL,
    routine_exercise_id BIGINT,
    target_sets INTEGER,
    target_reps_min INTEGER,
    target_reps_max INTEGER,
    rest_seconds INTEGER
);
CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise ON workout_exercises(exercise_id);

CREATE TABLE sets (
    id BIGSERIAL PRIMARY KEY,
    workout_exercise_id BIGINT NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight DOUBLE PRECISION,
    repetitions INTEGER,
    rpe DOUBLE PRECISION,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    completed_at TIMESTAMP,
    notes VARCHAR(500),
    CONSTRAINT uq_set_number_per_exercise UNIQUE (workout_exercise_id, set_number)
);
CREATE INDEX idx_sets_workout_exercise ON sets(workout_exercise_id);
