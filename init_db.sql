-- PostgreSQL Database Setup for Logistics Company

-- Create enum types
DO $$ BEGIN
    CREATE TYPE employee_role AS ENUM ('Office', 'Courier');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE cargo_status AS ENUM ('Created', 'Assigned', 'PickedUp', 'InTransit', 'Delivered', 'Cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE arrival_location_type AS ENUM ('Office', 'Address');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop tables if exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS "Cargo" CASCADE;
DROP TABLE IF EXISTS "Clients" CASCADE;
DROP TABLE IF EXISTS "Company_Employees" CASCADE;
DROP TABLE IF EXISTS "Offices" CASCADE;
DROP TABLE IF EXISTS "Companies" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- Create Users table
CREATE TABLE "Users" (
    "ID" SERIAL PRIMARY KEY,
    "Name" VARCHAR(45),
    "Username" VARCHAR(45) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(45) NOT NULL,
    "email" VARCHAR(45) NOT NULL
);

-- Create Companies table
CREATE TABLE "Companies" (
    "ID" SERIAL PRIMARY KEY,
    "Name" VARCHAR(45) NOT NULL
);

-- Create Offices table
CREATE TABLE "Offices" (
    "ID" SERIAL PRIMARY KEY,
    "CompanyID" INT NOT NULL,
    "Location" VARCHAR(255),
    CONSTRAINT fk_offices_companies FOREIGN KEY ("CompanyID") REFERENCES "Companies"("ID")
);

-- Create Company_Employees table
CREATE TABLE "Company_Employees" (
    "ID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL,
    "CompanyID" INT NOT NULL,
    "OfficeID" INT,
    "Role" VARCHAR(20) NOT NULL DEFAULT 'Office',
    CONSTRAINT fk_company_employees_users FOREIGN KEY ("UserID") REFERENCES "Users"("ID"),
    CONSTRAINT fk_company_employees_company FOREIGN KEY ("CompanyID") REFERENCES "Companies"("ID")
);

-- Create Clients table
CREATE TABLE "Clients" (
    "ID" SERIAL PRIMARY KEY,
    "UserID" INT NOT NULL,
    "CompanyID" INT NOT NULL,
    CONSTRAINT fk_clients_users FOREIGN KEY ("UserID") REFERENCES "Users"("ID"),
    CONSTRAINT fk_clients_company FOREIGN KEY ("CompanyID") REFERENCES "Companies"("ID")
);

-- Create Cargo table
CREATE TABLE "Cargo" (
    "ID" SERIAL PRIMARY KEY,
    "EmployeeID" INT NOT NULL,
    "SenderID" INT NOT NULL,
    "RecieverID" INT NOT NULL,
    "CompanyID" INT NOT NULL,
    "SenderAddress" VARCHAR(255),
    "RecieverAddress" VARCHAR(255),
    "CargoStatus" VARCHAR(20) NOT NULL DEFAULT 'Created',
    "Weight" DECIMAL(8,3),
    "Price" DECIMAL(10,2),
    "ArrivalDate" TIMESTAMP,
    "ArrivalLocationType" VARCHAR(20) NOT NULL DEFAULT 'Address',
    "OfficeDeliveredToID" INT,
    CONSTRAINT fk_cargo_employees FOREIGN KEY ("EmployeeID") REFERENCES "Company_Employees"("ID"),
    CONSTRAINT fk_cargosender_users FOREIGN KEY ("SenderID") REFERENCES "Users"("ID"),
    CONSTRAINT fk_cargoReciever_users FOREIGN KEY ("RecieverID") REFERENCES "Users"("ID"),
    CONSTRAINT fk_cargoCompany_company FOREIGN KEY ("CompanyID") REFERENCES "Companies"("ID"),
    CONSTRAINT fk_cargoOfficeDeliveredTo_offices FOREIGN KEY ("OfficeDeliveredToID") REFERENCES "Offices"("ID")
);

-- Insert seed data

-- Users (password hash for "password123" using BCrypt)
INSERT INTO "Users" ("Name", "Username", "password", "phone", "email") VALUES
('Администратор', 'admin', '$2a$11$rBNuWwR3gMxKM.CxEZWQs.z6X.5EX5W3qYxF5PJwT0jH5Y5gJqQzO', '+359888000001', 'admin@logistics.bg'),
('Иван Петров', 'ivan.petrov', '$2a$11$rBNuWwR3gMxKM.CxEZWQs.z6X.5EX5W3qYxF5PJwT0jH5Y5gJqQzO', '+359888000002', 'ivan.petrov@logistics.bg'),
('Мария Иванова', 'maria.ivanova', '$2a$11$rBNuWwR3gMxKM.CxEZWQs.z6X.5EX5W3qYxF5PJwT0jH5Y5gJqQzO', '+359888000003', 'maria.ivanova@logistics.bg'),
('Георги Георгиев', 'georgi.g', '$2a$11$rBNuWwR3gMxKM.CxEZWQs.z6X.5EX5W3qYxF5PJwT0jH5Y5gJqQzO', '+359888000004', 'georgi.g@logistics.bg'),
('Анна Василева', 'anna.v', '$2a$11$rBNuWwR3gMxKM.CxEZWQs.z6X.5EX5W3qYxF5PJwT0jH5Y5gJqQzO', '+359888000005', 'anna.v@mail.bg'),
('Петър Стоянов', 'petar.s', '$2a$11$rBNuWwR3gMxKM.CxEZWQs.z6X.5EX5W3qYxF5PJwT0jH5Y5gJqQzO', '+359888000006', 'petar.s@mail.bg');

-- Companies
INSERT INTO "Companies" ("Name") VALUES
('Спиди Логистикс'),
('Еконт Експрес'),
('Бърза Поща');

-- Offices
INSERT INTO "Offices" ("CompanyID", "Location") VALUES
(1, 'София, бул. България 102'),
(1, 'Пловдив, ул. Марица 15'),
(2, 'София, ул. Витоша 89'),
(2, 'Варна, бул. Приморски 45'),
(3, 'София, ул. Раковски 120'),
(3, 'Бургас, ул. Александровска 50');

-- Company Employees (user 2, 3, 4 are employees)
INSERT INTO "Company_Employees" ("UserID", "CompanyID", "OfficeID", "Role") VALUES
(2, 1, 1, 'Office'),
(3, 1, 2, 'Courier'),
(4, 2, 3, 'Office');

-- Clients (user 5, 6 are clients)
INSERT INTO "Clients" ("UserID", "CompanyID") VALUES
(5, 1),
(6, 2);

-- Sample Cargo
INSERT INTO "Cargo" ("EmployeeID", "SenderID", "RecieverID", "CompanyID", "SenderAddress", "RecieverAddress", "CargoStatus", "Weight", "Price", "ArrivalLocationType") VALUES
(1, 5, 6, 1, 'София, ул. Граф Игнатиев 25', 'Пловдив, ул. Княз Борис 10', 'Created', 2.500, 15.00, 'Address'),
(1, 5, 6, 1, 'София, ул. Славянска 8', 'Варна, бул. Княз Борис 100', 'InTransit', 5.000, 25.00, 'Address'),
(2, 6, 5, 1, 'Пловдив, ул. Иван Вазов 5', 'София, бул. Витоша 50', 'Delivered', 1.200, 12.00, 'Office');
