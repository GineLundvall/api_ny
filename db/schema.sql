CREATE DATABASE IF NOT EXISTS myapi;
USE myapi;

CREATE TABLE IF NOT EXISTS users (
    id          INTEGER     PRIMARY KEY AUTO_INCREMENT,
    username    VARCHAR(50) NOT NULL UNIQUE,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,   
    role        VARCHAR(50) NOT NULL DEFAULT 'user',  
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
    id          INTEGER      PRIMARY KEY AUTO_INCREMENT,
    user_id     INTEGER      NOT NULL,
    heading     VARCHAR(255) NOT NULL,
    text        VARCHAR(3000) NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (username, email, password, role) VALUES
('admin',    'admin@example.com',  'PLACEHOLDER', 'administrator'),
('editor1',  'editor@example.com', 'PLACEHOLDER', 'editor'),
('user1',    'user1@example.com',  'PLACEHOLDER', 'user');

INSERT INTO topics (user_id, heading, text) VALUES
(1, 'Välkommen till forumet!',        'Det här är ett testämne skapat av admin.'),
(1, 'API-dokumentation',              'Här kan du läsa mer om hur API:et fungerar.'),
(2, 'Tips för redaktörer',            'Som editor kan du publicera och redigera innehåll.'),
(3, 'Min första fråga',               'Hur gör man för att registrera sig?');
