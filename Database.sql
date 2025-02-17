CREATE DATABASE pinterest_clone;

USE pinterest_clone;

-- Create users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    enabled BOOLEAN DEFAULT TRUE
);

-- Create roles table
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create user_roles table (many-to-many relationship between users and roles)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create pins table
CREATE TABLE pins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default roles
INSERT INTO roles (name) VALUES ('ROLE_USER'), ('ROLE_ADMIN');

-- Example user (password: 'password' hashed with BCrypt)
INSERT INTO users (username, password, email) VALUES ('admin', '$2a$10$7Q0QzYt.Yc8kJ3u4N9U6K.2Q2I2H4T1X6G49V9O6G7fYsF5F6F5F5', 'admin@example.com');

-- Assign roles to the example user
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1), (1, 2);

-- Insert sample pins
INSERT INTO pins (title, description, image_url, user_id) VALUES ('Sample Pin 1', 'Description for sample pin 1', 'https://example.com/image1.jpg', 1);
INSERT INTO pins (title, description, image_url, user_id) VALUES ('Sample Pin 2', 'Description for sample pin 2', 'https://example.com/image2.jpg', 1);