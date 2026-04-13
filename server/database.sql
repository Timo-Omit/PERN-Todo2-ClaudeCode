CREATE DATABASE perntodo;

CREATE TABLE todo(
    todo_id SERIAL PRIMARY KEY,
    description VARCHAR(255)
);

-- Migration: add completed flag
-- Run this once against your existing database (skip if column already exists):
ALTER TABLE todo ADD COLUMN completed BOOLEAN DEFAULT FALSE;