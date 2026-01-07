--
-- PostgreSQL database dump
--

\restrict wvKab7iFHEyEgZrABLBdftASr99FiV6Hz32XhtTY2KF7hxbrNayPNBaGUMmESXk

-- Dumped from database version 15.15 (Homebrew)
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-08 00:54:53 EET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 848 (class 1247 OID 24691)
-- Name: arrival_location_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.arrival_location_type AS ENUM (
    'Office',
    'Address'
);


ALTER TYPE public.arrival_location_type OWNER TO postgres;

--
-- TOC entry 851 (class 1247 OID 24696)
-- Name: cargo_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cargo_status AS ENUM (
    'created',
    'assigned',
    'picked_up',
    'in_transit',
    'delivered',
    'cancelled'
);


ALTER TYPE public.cargo_status OWNER TO postgres;

--
-- TOC entry 854 (class 1247 OID 24710)
-- Name: employee_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.employee_role AS ENUM (
    'Office',
    'Courier'
);


ALTER TYPE public.employee_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 214 (class 1259 OID 24715)
-- Name: Cargo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cargo" (
    "ID" integer NOT NULL,
    "EmployeeID" integer NOT NULL,
    "SenderID" integer NOT NULL,
    "RecieverID" integer NOT NULL,
    "CompanyID" integer NOT NULL,
    "SenderAddress" character varying(255),
    "RecieverAddress" character varying(255),
    "Weight" numeric(8,3),
    "Price" numeric(10,2),
    "Status" public.cargo_status,
    "ArrivalDate" timestamp without time zone,
    "ArrivalLocationType" public.arrival_location_type,
    "OfficeDeliveredToID" integer
);


ALTER TABLE public."Cargo" OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 24720)
-- Name: Cargo_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Cargo" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Cargo_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 216 (class 1259 OID 24721)
-- Name: Clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Clients" (
    "ID" integer NOT NULL,
    "UserID" integer NOT NULL,
    "CompanyID" integer NOT NULL
);


ALTER TABLE public."Clients" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 24724)
-- Name: Clients_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Clients" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Clients_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 218 (class 1259 OID 24725)
-- Name: Companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Companies" (
    "ID" integer NOT NULL,
    "Name" character varying(45) NOT NULL
);


ALTER TABLE public."Companies" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24728)
-- Name: Companies_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Companies" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Companies_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 24729)
-- Name: Company_Employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Company_Employees" (
    "ID" integer NOT NULL,
    "UserID" integer NOT NULL,
    "CompanyID" integer NOT NULL,
    role public.employee_role NOT NULL,
    "OfficeID" integer NOT NULL
);


ALTER TABLE public."Company_Employees" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24732)
-- Name: Company_Employees_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Company_Employees" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Company_Employees_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 24733)
-- Name: Offices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Offices" (
    "ID" integer NOT NULL,
    "CompanyID" integer NOT NULL,
    "Location" character varying(255) NOT NULL
);


ALTER TABLE public."Offices" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24736)
-- Name: Offices_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Offices" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Offices_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 24737)
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    "ID" integer NOT NULL,
    "Name" character varying(45),
    "Username" character varying(45) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(45) NOT NULL,
    email character varying(45) NOT NULL
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24740)
-- Name: Users_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Users" ALTER COLUMN "ID" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Users_ID_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 3760 (class 0 OID 24715)
-- Dependencies: 214
-- Data for Name: Cargo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cargo" ("ID", "EmployeeID", "SenderID", "RecieverID", "CompanyID", "SenderAddress", "RecieverAddress", "Weight", "Price", "Status", "ArrivalDate", "ArrivalLocationType", "OfficeDeliveredToID") FROM stdin;
\.


--
-- TOC entry 3762 (class 0 OID 24721)
-- Dependencies: 216
-- Data for Name: Clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Clients" ("ID", "UserID", "CompanyID") FROM stdin;
\.


--
-- TOC entry 3764 (class 0 OID 24725)
-- Dependencies: 218
-- Data for Name: Companies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Companies" ("ID", "Name") FROM stdin;
\.


--
-- TOC entry 3766 (class 0 OID 24729)
-- Dependencies: 220
-- Data for Name: Company_Employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Company_Employees" ("ID", "UserID", "CompanyID", role, "OfficeID") FROM stdin;
\.


--
-- TOC entry 3768 (class 0 OID 24733)
-- Dependencies: 222
-- Data for Name: Offices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Offices" ("ID", "CompanyID", "Location") FROM stdin;
\.


--
-- TOC entry 3770 (class 0 OID 24737)
-- Dependencies: 224
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Users" ("ID", "Name", "Username", password, phone, email) FROM stdin;
\.


--
-- TOC entry 3777 (class 0 OID 0)
-- Dependencies: 215
-- Name: Cargo_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Cargo_ID_seq"', 1, false);


--
-- TOC entry 3778 (class 0 OID 0)
-- Dependencies: 217
-- Name: Clients_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Clients_ID_seq"', 1, false);


--
-- TOC entry 3779 (class 0 OID 0)
-- Dependencies: 219
-- Name: Companies_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Companies_ID_seq"', 1, false);


--
-- TOC entry 3780 (class 0 OID 0)
-- Dependencies: 221
-- Name: Company_Employees_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Company_Employees_ID_seq"', 1, false);


--
-- TOC entry 3781 (class 0 OID 0)
-- Dependencies: 223
-- Name: Offices_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Offices_ID_seq"', 1, false);


--
-- TOC entry 3782 (class 0 OID 0)
-- Dependencies: 225
-- Name: Users_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Users_ID_seq"', 1, false);


--
-- TOC entry 3597 (class 2606 OID 24742)
-- Name: Cargo Cargo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cargo"
    ADD CONSTRAINT "Cargo_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3599 (class 2606 OID 24744)
-- Name: Clients Clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Clients"
    ADD CONSTRAINT "Clients_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3601 (class 2606 OID 24746)
-- Name: Companies Companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Companies"
    ADD CONSTRAINT "Companies_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3603 (class 2606 OID 24748)
-- Name: Company_Employees Company_Employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company_Employees"
    ADD CONSTRAINT "Company_Employees_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3605 (class 2606 OID 24750)
-- Name: Offices Offices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Offices"
    ADD CONSTRAINT "Offices_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3607 (class 2606 OID 24752)
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 3608 (class 2606 OID 24753)
-- Name: Cargo fk_cargoCompany_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cargo"
    ADD CONSTRAINT "fk_cargoCompany_company" FOREIGN KEY ("CompanyID") REFERENCES public."Companies"("ID") NOT VALID;


--
-- TOC entry 3609 (class 2606 OID 24758)
-- Name: Cargo fk_cargoOfficeDeliveredTo_offices; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cargo"
    ADD CONSTRAINT "fk_cargoOfficeDeliveredTo_offices" FOREIGN KEY ("OfficeDeliveredToID") REFERENCES public."Offices"("ID") NOT VALID;


--
-- TOC entry 3610 (class 2606 OID 24763)
-- Name: Cargo fk_cargoReciever_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cargo"
    ADD CONSTRAINT "fk_cargoReciever_users" FOREIGN KEY ("RecieverID") REFERENCES public."Users"("ID") NOT VALID;


--
-- TOC entry 3611 (class 2606 OID 24768)
-- Name: Cargo fk_cargo_employees; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cargo"
    ADD CONSTRAINT fk_cargo_employees FOREIGN KEY ("EmployeeID") REFERENCES public."Company_Employees"("ID") NOT VALID;


--
-- TOC entry 3612 (class 2606 OID 24773)
-- Name: Cargo fk_cargosender_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cargo"
    ADD CONSTRAINT fk_cargosender_users FOREIGN KEY ("SenderID") REFERENCES public."Users"("ID") NOT VALID;


--
-- TOC entry 3613 (class 2606 OID 24778)
-- Name: Clients fk_clients_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Clients"
    ADD CONSTRAINT fk_clients_company FOREIGN KEY ("CompanyID") REFERENCES public."Companies"("ID") NOT VALID;


--
-- TOC entry 3614 (class 2606 OID 24783)
-- Name: Clients fk_clients_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Clients"
    ADD CONSTRAINT fk_clients_users FOREIGN KEY ("UserID") REFERENCES public."Users"("ID") NOT VALID;


--
-- TOC entry 3615 (class 2606 OID 24788)
-- Name: Company_Employees fk_company_employees_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company_Employees"
    ADD CONSTRAINT fk_company_employees_company FOREIGN KEY ("CompanyID") REFERENCES public."Companies"("ID") NOT VALID;


--
-- TOC entry 3616 (class 2606 OID 24793)
-- Name: Company_Employees fk_company_employees_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company_Employees"
    ADD CONSTRAINT fk_company_employees_users FOREIGN KEY ("UserID") REFERENCES public."Users"("ID") NOT VALID;


--
-- TOC entry 3617 (class 2606 OID 24798)
-- Name: Offices fk_offices_companies; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Offices"
    ADD CONSTRAINT fk_offices_companies FOREIGN KEY ("CompanyID") REFERENCES public."Companies"("ID") NOT VALID;


-- Completed on 2026-01-08 00:54:53 EET

--
-- PostgreSQL database dump complete
--

\unrestrict wvKab7iFHEyEgZrABLBdftASr99FiV6Hz32XhtTY2KF7hxbrNayPNBaGUMmESXk

