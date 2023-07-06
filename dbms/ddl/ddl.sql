/* Schéma de données */
use projet_production;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL
);

CREATE TABLE admins (
  userId INT NOT NULL,
  password VARCHAR(255) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE students (
  userId INT NOT NULL,
  studentFirstName VARCHAR(255),
  studentLastName VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE class (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE student_class (
  userId INT NOT NULL,
  classId INT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (classId) REFERENCES class(id)
);

CREATE TABLE challenge_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  command VARCHAR(255),
  mistakeMsg TEXT,
  questionNumber INT NOT NULL,
  questionValue INT NOT NULL,
  challengeId INT NOT NULL,
  FOREIGN KEY (challengeId) REFERENCES challenges(id)
);

CREATE TABLE student_connections (
  connectionIp VARCHAR(255),
  connectionPort INT,
  connectionName VARCHAR(255),
  password VARCHAR(255),
  dbName VARCHAR(255),
  userId INT NOT NULL,
  challengeId INT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (challengeId) REFERENCES challenges(id)
);

CREATE TABLE scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  challengeId INT NOT NULL,
  FOREIGN KEY (studentId) REFERENCES students(userId),
  FOREIGN KEY (challengeId) REFERENCES challenges(id)
);

-- Script que l'admin lance à chaque fois que l'élève valide sa réponse
CREATE TABLE admin_inputs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  input TEXT,
  challenge_questionId INT NOT NULL,
  FOREIGN KEY (challenge_questionId) REFERENCES challenge_questions(id)
);

CREATE TABLE solutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  expectedResponse TEXT,
  expectedError TEXT,
  challenge_questionId INT NOT NULL,
  FOREIGN KEY (challenge_questionId) REFERENCES challenge_questions(id)
);

CREATE TABLE class_challenges (
  classId INT NOT NULL,
  challengeId INT NOT NULL,
  FOREIGN KEY (classId) REFERENCES class(id),
  FOREIGN KEY (challengeId) REFERENCES challenges(id)
);

CREATE TABLE user_questions (
  userId INT NOT NULL,
  challenge_questionId INT NOT NULL,
  response TEXT,
  score INT,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (challenge_questionId) REFERENCES challenge_questions(id)
);