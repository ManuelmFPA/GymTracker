-- PECHO
INSERT INTO exercises (name, muscle_group, primary_muscle, equipment, description, instructions, active) VALUES
('Press banca con barra', 'Pecho', 'Pectoral mayor', 'Barra', 'Ejercicio compuesto básico para el desarrollo del pecho.', 'Acuéstate en el banco, baja la barra controladamente al pecho y empuja hacia arriba.', TRUE),
('Press inclinado con barra', 'Pecho', 'Pectoral superior', 'Barra', 'Variante del press banca enfocada en la parte superior del pecho.', 'Banco inclinado 30-45°, baja la barra a la parte alta del pecho y empuja.', TRUE),
('Press inclinado con mancuernas', 'Pecho', 'Pectoral superior', 'Mancuernas', 'Mayor rango de movimiento que la barra.', 'Baja las mancuernas controladamente a los lados del pecho y empuja hacia arriba.', TRUE),
('Aperturas con mancuernas', 'Pecho', 'Pectoral mayor', 'Mancuernas', 'Ejercicio de aislamiento para el pecho.', 'Con los brazos semi-flexionados, baja las mancuernas en arco y regresa.', TRUE),
('Fondos', 'Pecho', 'Pectoral inferior / Tríceps', 'Paralelas', 'Ejercicio con peso corporal.', 'Baja el cuerpo flexionando los codos e inclinándote ligeramente hacia adelante, luego empuja.', TRUE);

-- ESPALDA
INSERT INTO exercises (name, muscle_group, primary_muscle, equipment, description, instructions, active) VALUES
('Dominadas', 'Espalda', 'Dorsal ancho', 'Barra de dominadas', 'Ejercicio con peso corporal para la espalda.', 'Cuelga de la barra y tira hacia arriba hasta que la barbilla pase la barra.', TRUE),
('Jalón al pecho', 'Espalda', 'Dorsal ancho', 'Máquina de poleas', 'Alternativa a las dominadas con carga ajustable.', 'Tira de la barra hacia el pecho manteniendo el torso erguido.', TRUE),
('Remo con barra', 'Espalda', 'Dorsal / Trapecio medio', 'Barra', 'Ejercicio compuesto para espalda media.', 'Inclina el torso, tira de la barra hacia el abdomen.', TRUE),
('Remo con mancuerna', 'Espalda', 'Dorsal ancho', 'Mancuerna', 'Trabajo unilateral de espalda.', 'Apoya una rodilla y mano en el banco, tira de la mancuerna hacia la cadera.', TRUE),
('Remo en máquina', 'Espalda', 'Dorsal / Trapecio', 'Máquina', 'Variante guiada del remo.', 'Tira de las agarraderas hacia el torso manteniendo la espalda recta.', TRUE);

-- PIERNAS
INSERT INTO exercises (name, muscle_group, primary_muscle, equipment, description, instructions, active) VALUES
('Sentadilla', 'Piernas', 'Cuádriceps / Glúteo', 'Barra', 'Ejercicio fundamental para tren inferior.', 'Baja flexionando cadera y rodillas manteniendo la espalda neutra, luego sube.', TRUE),
('Prensa', 'Piernas', 'Cuádriceps', 'Máquina de prensa', 'Alternativa guiada a la sentadilla.', 'Empuja la plataforma extendiendo las piernas sin bloquear las rodillas.', TRUE),
('Peso muerto', 'Piernas', 'Isquiotibiales / Glúteo / Espalda baja', 'Barra', 'Ejercicio compuesto de cadena posterior.', 'Levanta la barra del suelo manteniendo la espalda recta, empujando con las caderas.', TRUE),
('Peso muerto rumano', 'Piernas', 'Isquiotibiales', 'Barra', 'Variante enfocada en isquiotibiales.', 'Con piernas casi extendidas, baja la barra pegada a las piernas flexionando la cadera.', TRUE),
('Extensión de piernas', 'Piernas', 'Cuádriceps', 'Máquina', 'Ejercicio de aislamiento de cuádriceps.', 'Extiende las piernas contra la resistencia de la máquina.', TRUE),
('Curl femoral', 'Piernas', 'Isquiotibiales', 'Máquina', 'Ejercicio de aislamiento de isquiotibiales.', 'Flexiona las rodillas llevando los talones hacia los glúteos.', TRUE);

-- HOMBROS
INSERT INTO exercises (name, muscle_group, primary_muscle, equipment, description, instructions, active) VALUES
('Press militar', 'Hombros', 'Deltoides', 'Barra', 'Ejercicio compuesto para hombros.', 'Empuja la barra desde los hombros hasta la extensión completa de brazos.', TRUE),
('Elevaciones laterales', 'Hombros', 'Deltoides lateral', 'Mancuernas', 'Ejercicio de aislamiento para deltoides lateral.', 'Eleva las mancuernas a los lados hasta la altura de los hombros.', TRUE),
('Elevaciones frontales', 'Hombros', 'Deltoides anterior', 'Mancuernas', 'Ejercicio de aislamiento para deltoides anterior.', 'Eleva las mancuernas al frente hasta la altura de los hombros.', TRUE),
('Pájaros', 'Hombros', 'Deltoides posterior', 'Mancuernas', 'Ejercicio de aislamiento para deltoides posterior.', 'Inclinado hacia adelante, eleva las mancuernas hacia los lados.', TRUE);

-- BÍCEPS
INSERT INTO exercises (name, muscle_group, primary_muscle, equipment, description, instructions, active) VALUES
('Curl con barra', 'Bíceps', 'Bíceps braquial', 'Barra', 'Ejercicio básico de bíceps.', 'Flexiona los codos llevando la barra hacia los hombros.', TRUE),
('Curl con mancuernas', 'Bíceps', 'Bíceps braquial', 'Mancuernas', 'Permite trabajo unilateral y supinación.', 'Flexiona los codos llevando las mancuernas hacia los hombros.', TRUE),
('Curl martillo', 'Bíceps', 'Braquial / Bíceps', 'Mancuernas', 'Variante con agarre neutro.', 'Flexiona los codos con las palmas enfrentadas.', TRUE);

-- TRÍCEPS
INSERT INTO exercises (name, muscle_group, primary_muscle, equipment, description, instructions, active) VALUES
('Extensión en polea', 'Tríceps', 'Tríceps braquial', 'Polea', 'Ejercicio de aislamiento de tríceps.', 'Extiende los codos empujando la cuerda o barra hacia abajo.', TRUE),
('Press francés', 'Tríceps', 'Tríceps braquial', 'Barra / Mancuernas', 'Ejercicio de aislamiento acostado.', 'Baja el peso hacia la frente flexionando solo los codos y extiende.', TRUE),
('Fondos en banco', 'Tríceps', 'Tríceps braquial', 'Banco', 'Variante de fondos con peso corporal.', 'Apoya las manos en el banco detrás de ti y baja flexionando los codos.', TRUE);

-- CORE / ABDOMEN (extra para llegar a 30+ y cubrir más grupos)
INSERT INTO exercises (name, muscle_group, primary_muscle, equipment, description, instructions, active) VALUES
('Plancha', 'Core', 'Recto abdominal / Transverso', 'Peso corporal', 'Ejercicio isométrico de core.', 'Mantén el cuerpo recto apoyado en antebrazos y pies.', TRUE),
('Crunch abdominal', 'Core', 'Recto abdominal', 'Peso corporal', 'Ejercicio básico de abdomen.', 'Flexiona el torso hacia las rodillas contrayendo el abdomen.', TRUE),
('Elevación de piernas', 'Core', 'Abdomen inferior', 'Barra de dominadas / Peso corporal', 'Ejercicio para abdomen inferior.', 'Colgado de la barra, eleva las piernas rectas hacia el frente.', TRUE),
('Rueda abdominal', 'Core', 'Recto abdominal / Core', 'Rueda abdominal', 'Ejercicio avanzado de core.', 'Desde rodillas, rueda hacia adelante y regresa contrayendo el abdomen.', TRUE);
