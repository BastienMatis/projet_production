/*
Script de création de la base de données.
*/
create database IF NOT EXISTS projet_production;

/* Créer l'utilisateur API */
create user IF NOT EXISTS 'api-dev'@'%.%.%.%' identified by 'api-dev-password';
grant select, update, insert, delete on projet_production.* to 'api-dev'@'%.%.%.%';
flush privileges;