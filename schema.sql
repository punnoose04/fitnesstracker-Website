CREATE DATABASE signin_information;

USE signin_information;

CREATE TABLE users (
	id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    pass VARCHAR(100) NOT NULL
);

INSERT INTO users (email, pass)
VALUES
("test@gmail.com", "testpassword123");

INSERT INTO users (email, pass)
VALUES
("test", "test");

CREATE TABLE workouts (
    workout_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    date DATE,
    workout_type VARCHAR(255),
    weight DECIMAL(5,2), -- Assuming weight might need decimal points
    sets INT,
    reps INT,
    FOREIGN KEY (user_id) REFERENCES users(id) 
);

CREATE TABLE reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    reminder_date DATE,
    reminder_time TIME,
    message VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
