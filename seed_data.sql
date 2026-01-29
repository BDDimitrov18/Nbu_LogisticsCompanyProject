-- PostgreSQL Seed Data for Logistics Company
-- ALL USERS PASSWORD: password123

-- Create enum types
DO $$ BEGIN
    CREATE TYPE employee_role AS ENUM ('Office', 'Courier', 'Admin');
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
    "ID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Name" VARCHAR(45),
    "Username" VARCHAR(45) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(45) NOT NULL,
    "email" VARCHAR(45) NOT NULL
);

-- Create Companies table
CREATE TABLE "Companies" (
    "ID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Name" VARCHAR(45) NOT NULL
);

-- Create Offices table
CREATE TABLE "Offices" (
    "ID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "CompanyID" INT NOT NULL,
    "Location" VARCHAR(255),
    CONSTRAINT fk_offices_companies FOREIGN KEY ("CompanyID") REFERENCES "Companies"("ID")
);

-- Create Company_Employees table
CREATE TABLE "Company_Employees" (
    "ID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserID" INT NOT NULL,
    "CompanyID" INT NOT NULL,
    "OfficeID" INT NOT NULL,
    "Role" VARCHAR(20) NOT NULL DEFAULT 'Office',
    CONSTRAINT fk_company_employees_users FOREIGN KEY ("UserID") REFERENCES "Users"("ID"),
    CONSTRAINT fk_company_employees_company FOREIGN KEY ("CompanyID") REFERENCES "Companies"("ID")
);

-- Create Clients table
CREATE TABLE "Clients" (
    "ID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserID" INT NOT NULL,
    "CompanyID" INT NOT NULL,
    CONSTRAINT fk_clients_users FOREIGN KEY ("UserID") REFERENCES "Users"("ID"),
    CONSTRAINT fk_clients_company FOREIGN KEY ("CompanyID") REFERENCES "Companies"("ID")
);

-- Create Cargo table
CREATE TABLE "Cargo" (
    "ID" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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

-- =====================================================
-- INSERT SEED DATA
-- ALL PASSWORDS ARE: password123
-- =====================================================

-- Users (10 users)
-- ID 1: Admin user
-- ID 2-3: Office employees
-- ID 4-5: Courier employees
-- ID 6-10: Regular clients
INSERT INTO "Users" ("Name", "Username", "password", "phone", "email") VALUES
('Admin User', 'admin', '1FX+VCt7A4oadJbJGUP8xA==.etLKI0nK7p+lZlFjyb9/HNja7AALS4s2qNmV6W2xCqo=', '+359888000001', 'admin@logistics.bg'),
('Ivan Petrov', 'office1', 'Zyhv/VPI5yoDNNMNo03VTQ==.8v82RUYZq21soKZS0ssJMB2RvtIYIHvCyBScPOhOkJg=', '+359888000002', 'ivan.petrov@logistics.bg'),
('Maria Ivanova', 'office2', 'h4y4GW21jy5r+7pKIrM6Bw==.2Gde7/z/O1xcZsZqWh/2aEwJR4uraOBua2ibzx+s9X0=', '+359888000003', 'maria.ivanova@logistics.bg'),
('Georgi Georgiev', 'courier1', 'oHw5KnS4bOTDZG5H9eVo9g==.pca07d40mOkcIHFdPaA8jlKyOZBVV83P1nbrI8K4J34=', '+359888000004', 'georgi.g@logistics.bg'),
('Dimitar Dimitrov', 'courier2', '+q03Y/iV37fORkfgNJmisw==.+0Q2LdSbtSy5apigqYxZGcfrxyZzcXRkFNTfWHbqgDs=', '+359888000005', 'dimitar.d@logistics.bg'),
('Anna Vasileva', 'client1', 'IEg7O76h6msY7Xaiwc7xBA==.e/3tz5H2/oGLmKqCtzJHxt3uvfD/oGctxTV/SayKdL4=', '+359888000006', 'anna.v@mail.bg'),
('Petar Stoyanov', 'client2', 'MYq8i1Ec5VZBStitxY016Q==.tYwMxLxColqvtL9f9WGJS97V8fz8khocMQ8D8XN/RPY=', '+359888000007', 'petar.s@mail.bg'),
('Elena Todorova', 'client3', 'mGZxzKH456IW/yQTL0ZBEA==.UMrkNfvFgcOUO2ewJI3Sm65MHb0d5PGKwz4FVrfODQs=', '+359888000008', 'elena.t@mail.bg'),
('Nikolay Nikolov', 'client4', '9NnAPTDHT+oxGYtwfXbIsA==.71rd7vh3rmq9SwtYvmLBTxChpK+qnkxvgfmfdGiMvyo=', '+359888000009', 'nikolay.n@mail.bg'),
('Sofia Mladenova', 'client5', 'oX2kCn68ZNgdq3mU0FjkZg==.Z2NPblaBbGH4l2458PM4Z0/7IYtN8JPi/WHxcDvDMvc=', '+359888000010', 'sofia.m@mail.bg');

-- Companies (3 companies)
INSERT INTO "Companies" ("Name") VALUES
('Speedy Logistics'),
('Econt Express'),
('Fast Post');

-- Offices (6 offices, 2 per company)
INSERT INTO "Offices" ("CompanyID", "Location") VALUES
(1, 'Sofia, Bulgaria Blvd 102'),
(1, 'Plovdiv, Maritsa St 15'),
(2, 'Sofia, Vitosha St 89'),
(2, 'Varna, Primorski Blvd 45'),
(3, 'Sofia, Rakovski St 120'),
(3, 'Burgas, Aleksandrovska St 50');

-- Company Employees with ALL ROLES
-- Admin (ID 1), Office workers (ID 2,3), Couriers (ID 4,5)
INSERT INTO "Company_Employees" ("UserID", "CompanyID", "OfficeID", "Role") VALUES
(1, 1, 1, 'Admin'),      -- admin user is Admin at Speedy Logistics
(2, 1, 1, 'Office'),     -- office1 is Office worker at Speedy Logistics Sofia
(3, 2, 3, 'Office'),     -- office2 is Office worker at Econt Express Sofia
(4, 1, 1, 'Courier'),    -- courier1 is Courier at Speedy Logistics Sofia
(5, 2, 4, 'Courier');    -- courier2 is Courier at Econt Express Varna

-- Clients (users 6-10 are clients)
INSERT INTO "Clients" ("UserID", "CompanyID") VALUES
(6, 1),   -- client1 -> Speedy Logistics
(7, 1),   -- client2 -> Speedy Logistics
(8, 2),   -- client3 -> Econt Express
(9, 2),   -- client4 -> Econt Express
(10, 3);  -- client5 -> Fast Post

-- Cargo (various statuses)
INSERT INTO "Cargo" ("EmployeeID", "SenderID", "RecieverID", "CompanyID", "SenderAddress", "RecieverAddress", "CargoStatus", "Weight", "Price", "ArrivalDate", "ArrivalLocationType", "OfficeDeliveredToID") VALUES
-- Created cargos
(4, 6, 7, 1, 'Sofia, Graf Ignatiev St 25', 'Plovdiv, Knyaz Boris St 10', 'Created', 2.500, 15.00, NULL, 'Address', NULL),
(4, 7, 6, 1, 'Plovdiv, Ivan Vazov St 5', 'Sofia, Vitosha Blvd 50', 'Created', 1.800, 12.50, NULL, 'Address', NULL),

-- Assigned cargos
(4, 6, 8, 1, 'Sofia, Slavyanska St 8', 'Sofia, Vitosha St 89', 'Assigned', 3.200, 18.00, NULL, 'Office', 3),
(5, 8, 9, 2, 'Sofia, Rakovski St 45', 'Varna, Primorski Blvd 100', 'Assigned', 0.500, 8.00, NULL, 'Address', NULL),

-- PickedUp cargos
(4, 7, 10, 1, 'Plovdiv, Gladston St 12', 'Burgas, Aleksandrovska 20', 'PickedUp', 4.500, 28.00, NULL, 'Address', NULL),
(5, 9, 6, 2, 'Varna, Slivnitsa Blvd 50', 'Sofia, Bulgaria Blvd 102', 'PickedUp', 2.100, 16.00, NULL, 'Office', 1),

-- InTransit cargos
(4, 6, 9, 1, 'Sofia, Tsarigradsko Shose 115', 'Varna, Knyaz Boris 55', 'InTransit', 5.000, 32.00, NULL, 'Address', NULL),
(5, 8, 7, 2, 'Sofia, Cherni Vrah Blvd 25', 'Plovdiv, Maritsa St 15', 'InTransit', 1.200, 10.00, NULL, 'Office', 2),

-- Delivered cargos (with arrival dates)
(4, 7, 6, 1, 'Plovdiv, Kapitan Raycho 8', 'Sofia, Graf Ignatiev 30', 'Delivered', 0.800, 9.00, '2026-01-20 14:30:00', 'Address', NULL),
(4, 6, 7, 1, 'Sofia, Oborishte St 15', 'Plovdiv, Gladston 22', 'Delivered', 2.300, 14.00, '2026-01-21 10:15:00', 'Address', NULL),
(5, 9, 8, 2, 'Varna, Osmi Primorski 20', 'Sofia, Vitosha St 89', 'Delivered', 3.800, 22.00, '2026-01-22 16:45:00', 'Office', 3),
(5, 8, 10, 2, 'Sofia, James Boucher 50', 'Burgas, Aleksandrovska 50', 'Delivered', 1.500, 18.00, '2026-01-23 09:20:00', 'Office', 6),

-- Cancelled cargos
(4, 6, 7, 1, 'Sofia, Dondukov Blvd 5', 'Plovdiv, Hristo Botev 40', 'Cancelled', 6.000, 35.00, NULL, 'Address', NULL),
(5, 9, 6, 2, 'Varna, Maria Luiza 100', 'Sofia, Bulgaria Blvd 102', 'Cancelled', 0.300, 6.00, NULL, 'Office', 1);

-- Show summary
SELECT 'Users' as table_name, COUNT(*) as count FROM "Users"
UNION ALL
SELECT 'Companies', COUNT(*) FROM "Companies"
UNION ALL
SELECT 'Offices', COUNT(*) FROM "Offices"
UNION ALL
SELECT 'Employees', COUNT(*) FROM "Company_Employees"
UNION ALL
SELECT 'Clients', COUNT(*) FROM "Clients"
UNION ALL
SELECT 'Cargo', COUNT(*) FROM "Cargo";
