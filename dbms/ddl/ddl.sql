/* Schéma de données */
use projet_production;

CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL
);

CREATE TABLE admin (
  userId INT NOT NULL,
  password VARCHAR(255) NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id)
);

CREATE TABLE student (
  userId INT NOT NULL,
  studentIp VARCHAR(255),
  studentUsername VARCHAR(255),
  studentGivenName VARCHAR(255),
  studentFamilyName VARCHAR(255),
  FOREIGN KEY (userId) REFERENCES user(id)
);

CREATE TABLE class (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE studentClass (
  userId INT NOT NULL,
  classId INT NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id),
  FOREIGN KEY (classId) REFERENCES classes(id)
);

CREATE TABLE challenge (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  command VARCHAR(255),
  mistakeMsg VARCHAR(255),
  challengeId INT NOT NULL,
  FOREIGN KEY (challengeId) REFERENCES challenge(id)
);

CREATE TABLE classChallenge (
  classId INT NOT NULL,
  challengeId INT NOT NULL,
  FOREIGN KEY (classId) REFERENCES Class(id),
  FOREIGN KEY (challengeId) REFERENCES challenge(id)
);