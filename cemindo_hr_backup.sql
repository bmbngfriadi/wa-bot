--
-- PostgreSQL database dump
--

\restrict AWLhgbXyGCQY7cFXRjMz7o31o6r4dm34UfOIC3vj4YL7eBMd8pWvYHdvnFCfmyH

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: karyawan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.karyawan (
    id integer NOT NULL,
    nik character varying(50) NOT NULL,
    nama_lengkap character varying(100) NOT NULL,
    department character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'Aktif'::character varying,
    is_deleted smallint DEFAULT 0,
    nama_istri character varying(100),
    nama_anak_pertama character varying(100),
    nama_anak_kedua character varying(100),
    nama_anak_ketiga character varying(100),
    golongan character varying(10) DEFAULT '4A'::character varying,
    email character varying(255),
    bot_password character varying(50),
    jenis_kelamin character varying(20) DEFAULT 'Laki-laki'::character varying
);


ALTER TABLE public.karyawan OWNER TO postgres;

--
-- Name: karyawan_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.karyawan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.karyawan_id_seq OWNER TO postgres;

--
-- Name: karyawan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.karyawan_id_seq OWNED BY public.karyawan.id;


--
-- Name: medical_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_transactions (
    id integer NOT NULL,
    karyawan_id integer NOT NULL,
    kategori character varying(50) NOT NULL,
    nominal numeric(15,2) NOT NULL,
    deskripsi text,
    tanggal date NOT NULL,
    foto_bukti text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.medical_transactions OWNER TO postgres;

--
-- Name: medical_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_transactions_id_seq OWNER TO postgres;

--
-- Name: medical_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_transactions_id_seq OWNED BY public.medical_transactions.id;


--
-- Name: system_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(50) NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- Name: system_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_logs_id_seq OWNER TO postgres;

--
-- Name: system_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255),
    password character varying(255) NOT NULL,
    reset_token character varying(255),
    reset_token_expires timestamp without time zone,
    nama character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    permissions text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: karyawan id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.karyawan ALTER COLUMN id SET DEFAULT nextval('public.karyawan_id_seq'::regclass);


--
-- Name: medical_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_transactions ALTER COLUMN id SET DEFAULT nextval('public.medical_transactions_id_seq'::regclass);


--
-- Name: system_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: karyawan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.karyawan (id, nik, nama_lengkap, department, status, is_deleted, nama_istri, nama_anak_pertama, nama_anak_kedua, nama_anak_ketiga, golongan, email, bot_password, jenis_kelamin) FROM stdin;
411	04119120077	Abdul Radjab	Production	Aktif	0	Rosmawati 	Muhammad Rifqi Alqaddri Rajab	Muhammad Rafly Alfarisi Rajab	Muhammad Rheza Arsenio Rajab	6 (A-B)	\N	Batam!234	Laki-laki
412	04119120064	Ading Syahrizal Rama Saputra	Quality Control	Aktif	0	Indah Luthfiana	Naura Syauqiya Mecca	 	 	4A	\N	04119120064	Laki-laki
413	04122010027	Aditya Wande	Quality Control	Aktif	0	Dewi Riyanti	Nuril Resyakila	Ariendra Husnul Ceisya	 	4A	\N	04122010027	Laki-laki
414	04126010123	Agus Jatmiko Utomo	Finance	Aktif	0	Esa Ghaniyyu Almas	Narendra Kenzo Utomo	 	 	4A	\N	04126010123	Laki-laki
415	04119120034	Agus Purnomo	Maintenance	Aktif	0	Erna Widyawati	Muhammad Daffa Ernando 	Muhammad Daffi Ernanto 	 	4A	\N	04119120034	Laki-laki
416	04119120001	Ahmad Arifin	Production	Aktif	0	Sumarni Sl 	Athiyah Alifa Ahmad 	Alif Athar Ahmad 	 	4A	\N	04119120001	Laki-laki
417	04119120073	Ahmad Sobirin	Maintenance	Aktif	0	Sri Lestari	Farhan Nafis Ramadhan	Fadlan Elfahmy	 	4A	\N	04119120073	Laki-laki
418	04120070015	Ahmad Yani	Production	Aktif	0	Rina Paramida	Zeeya Nadhifa Ahmad	El Zyco Ramadhansyah	 	4A	\N	04120070015	Laki-laki
419	04119120058	Alamun	Production	Aktif	0	Ami Juliami	Izyan Taqie Abdillah	Nu'Aima Almi Nabdillah	Hanan Athaillah	4A	\N	04119120058	Laki-laki
420	04119120078	Ali Akbar	Quality Control	Aktif	0	Rosdiana 	Aaisyah 	Ahmad Ubay	Afaf Muthmainnah	4A	\N	04119120078	Laki-laki
421	04119120002	Almunar Rasyid	Production	Aktif	0	Ernawati 	Al Fariz Rifki	Dennis Aditya	 	4A	\N	04119120002	Laki-laki
422	04119120061	Andi Thommi S	Port & Dispatch	Aktif	0	Ditya Ismaya	Afiqah Salsabila Tawa	Athirah Sakinah Yancing	 	4A	\N	04119120061	Laki-laki
423	04122010029	Andrie Ronald Supriyadi Defretes	Port & Dispatch	Aktif	0	Sri Mulyani	Adzka Daryl	 	 	4A	\N	04122010029	Laki-laki
424	04120100006	Antal Azhar Siregar	Port & Dispatch	Aktif	0	Fitriani Hasibuan	Shafiyah Zahra Siregar	Kenzie Hamizan Siregar	Rayyan Haziq Siregar	4A	\N	04120100006	Laki-laki
425	04122050005	Anton Papilaya	Production	Aktif	0	Novarianti 	Aulya Rizky Ramadani 	Nasya Azzahra 	 	4A	\N	04122050005	Laki-laki
426	04119120071	Ari Wijanarko	Maintenance	Aktif	0	Sari Mulyati	Mysha Sybilla	 	 	4A	\N	04119120071	Laki-laki
427	04119120042	Asrussani	Production	Aktif	0	Nor Rani	Firman Sani	Afif Nur Firdaus	Azzam Kholif A	4A	\N	04119120042	Laki-laki
428	04120100001	Aulia Rahmi	Port & Dispatch	Aktif	0	 	 	 	 	4A	\N	04120100001	Laki-laki
430	04126010193	Bernandus Fernando Saputra	HRGA & Supporting	Aktif	0	Mentari Yunita Sidauruk	Mikhayla Callista Jasmine Silalahi	 	 	4A	\N	04126010193	Laki-laki
431	04119120015	Chandra Eka Putra	Production	Aktif	0	 	 	 	 	4A	\N	04119120015	Laki-laki
432	04120070018	Dadang Mahrudi	Port & Dispatch	Aktif	0	Wira Lestari 	Nazwa Aqilla Octa Danra 	Nayla Adreena Danra 	Nazira Anasya Danra 	4A	\N	04120070018	Laki-laki
433	04125050703	Dani Pathurrahman	Port & Dispatch	Aktif	0	Sherly Dwi Yolanda	Sheqif Rayyan Ibrahim	 	 	4A	\N	04125050703	Laki-laki
434	04122010028	Dedi Rosadi	Quality Control	Aktif	0	 	 	 	 	4A	\N	04122010028	Laki-laki
435	04119120025	Dedy S.	Maintenance	Aktif	0	Nuri Afrida	Dentora Arsyabirawa	Den Althaf Abizar	Dewi Febrianti	4A	\N	04119120025	Laki-laki
436	04119120036	Dehwan Setyo	Production	Aktif	0	Deska Darmiza	Dzakira Adzratunnisa	Muhammad Alby Attaqi 	Nuaira Aftani 	4A	\N	04119120036	Laki-laki
437	04119120004	Deni Opika	Maintenance	Aktif	0	 	 	 	 	4A	\N	04119120004	Laki-laki
438	04116020045	Dhandy Parindo	SHE	Aktif	0	Ade Betri	 	 	 	4A	\N	04116020045	Laki-laki
439	04119120067	Dika Achyariau Ansyah	Maintenance	Aktif	0	Lya Rofika	Arfan Zian Ahyari	Khalid Ibrahim Ahyari	Lashira Annisa Ahyari	4A	\N	04119120067	Laki-laki
440	04125050705	Doni	Production	Aktif	0	Sri Nurhayana	Suci Rahmadani	Muhammad Ridwan	Adzkiya Naila Taleetha 	4A	\N	04125050705	Laki-laki
441	04119120032	Edi Mustopa	Port & Dispatch	Aktif	0	Misisriyenti 	Mutia Sindie Kriclin	Dwi Rasti Ananda Kriiclin	Bunga Adisti	4A	\N	04119120032	Laki-laki
442	04125050837	Erwin Herianto	Production	Aktif	0	 	 	 	 	4A	\N	04125050837	Laki-laki
443	04119120047	Fendra Sagita	Quality Control	Aktif	0	Dina Syahdiana	Louna Ryzkie Indah Larasati	Muhammad Ryzkie Al Hafeezy	Shafyna Ryzkie Radhyyah	4A	\N	04119120047	Laki-laki
444	04119120007	Firman	Warehouse	Aktif	0	 	 	 	 	4A	\N	04119120007	Laki-laki
445	04119120024	Hamidun	Purchasing	Aktif	0	Ressy Bella Putri	Rehaqi Nadim Wahab	Rehaqa Nazam Malik	 	4A	\N	04119120024	Laki-laki
446	04119120045	Hamka	Port & Dispatch	Aktif	0	Warisasih 	Maysha Chintya Wulansari 	Shifa Anggreni Putri 	Nadhira Nur Maulida 	4A	\N	04119120045	Laki-laki
447	04119120019	Hamzah	Maintenance	Aktif	0	Ermawati 	 	Annisa Hamzah Annisa	 	4A	\N	04119120019	Laki-laki
448	04119120046	Herman Syahputra	Quality Control	Aktif	0	Elyza 	Bayu Ramadhan Saputra	Nadine Anggrainy	Nazihah Afiya Putri. H	4A	\N	04119120046	Laki-laki
449	04119120068	Heru Kurniawan	Plant Head	Aktif	0	Mirra Andriani	Hanna Miftahul Jannah	Nadim Raziq Anaqi	 	4A	\N	04119120068	Laki-laki
450	04119120010	Hotmatua Siregar	Maintenance	Aktif	0	Jahrona Sitompul Jahrona	Ilmira Yunsaini Hotjah Siregar	Asnan Affandi Hotjah Siregar	Asaatidz Affwan Hotjah Siregar	4A	\N	04119120010	Laki-laki
451	04121110025	Ilyas Mochtar	Port & Dispatch	Aktif	0	Husmy Achmad	Emilia Hafidzah Mochtar	Elvira Latifah Mochtar	 	4A	\N	04121110025	Laki-laki
452	04122040028	Imaduddin	Port & Dispatch	Aktif	0	Felisa Fadhillah	Muhammad Iman Alfatih	 	 	4A	\N	04122040028	Laki-laki
453	04121110024	Irfan Werdinansah	Port & Dispatch	Aktif	0	Resa Dwi Anita	Shaktian Rafa Putra Werdinansah	Restian Rayya Cinta Werdinansah	 	4A	\N	04121110024	Laki-laki
454	04119120011	Ismaili	Maintenance	Aktif	0	Wahyu Widya  Ningsi 	David Arfiansa 	Muhammad Denis Alviansah 	Yumna Ashifa Ismi	4A	\N	04119120011	Laki-laki
455	04122050049	Julandi	Production	Aktif	0	Dahlia Lia	Hafidzah Kanza Asyifa	Ananda Cahya Hafizhah	Fildzah Dzakira Aftani	4A	\N	04122050049	Laki-laki
456	04119120044	Kamran	Production	Aktif	0	 	 	 	 	4A	\N	04119120044	Laki-laki
457	04119120013	Kariyun	Production	Aktif	0	Nengsih 	Ahwaty Nurul Sholehah	 	 	4A	\N	04119120013	Laki-laki
458	04120070013	Leolin Azlin Siregar	Port & Dispatch	Aktif	0	Masra Pane	Adeeva Suci Rafanda Siregar	Bilal Ziyech Siregar	Daania Khanza Siregar	4A	\N	04120070013	Laki-laki
459	04119120076	Mario Putra	Purchasing	Aktif	0	Dian Septi Ningsih	Zaura Anindita Maziya	Lutfiatul Zahratul Jannah	Zaim Arfan Putra	4A	\N	04119120076	Laki-laki
460	04119120020	Masrin	Warehouse	Aktif	0	Solbiah 	Muhammad Rozhak Nur Ramadhan	Ainul Mardhiah Masrin 	 	4A	\N	04119120020	Laki-laki
461	04119120040	Mochammad Asrori	Production	Aktif	0	Jamilun 	 	 	 	4A	\N	04119120040	Laki-laki
462	04119120065	Moneindro	Quality Control	Aktif	0	Nurmilawati 	Ghaziyah Lyrabella	 	 	4A	\N	04119120065	Laki-laki
463	04122050006	Muh Wahyuddin	Production	Aktif	0	Sulfiana 	Muhammad Farez Aditya	 	 	4A	\N	04122050006	Laki-laki
464	04125050706	Muhammad Ali	Maintenance	Aktif	0	Fauziah 	Hifza Khairiyah	 	 	4A	\N	04125050706	Laki-laki
465	04119120035	Muhammad Morah	Quality Control	Aktif	0	Tiur Mida. S	Azra Amalia	Sarah Fitria. S	Muhammad Arfa. S	4A	\N	04119120035	Laki-laki
466	04125050769	Mus Mulyadi	Maintenance	Aktif	0	Rinawati 	Muhammad Ghaffar Nuzaimi 	 	 	4A	\N	04125050769	Laki-laki
467	04122110044	Mustaqim	Maintenance	Aktif	0	Esy Juli Suryani Harahap	Muhammad Zayn Mussy Al Hanafi 	Alkhalif Zikri Almussy 	 	4A	\N	04122110044	Laki-laki
468	04119120043	Nelson Gultom	Production	Aktif	0	Ratna Kamalia	Agustina Berliana Gultom	Abel Isroni Julianus Gultom	Joni Andrean Gultom	4A	\N	04119120043	Laki-laki
469	04122010026	Ponding Sitorus	Port & Dispatch	Aktif	0	Ratna Kasiani Girsang Kasiani	Dea Lavenia Sitorus Lavenia	Annabella Sitorus	Erik Hartanto Sitorus Hartanto	4A	\N	04122010026	Laki-laki
470	04119120017	Rahim Bao	Production	Aktif	0	Syamsiah Kasim	Hafizh Al Mubarak	Nurul Fadhilah Rahim	Wilda Zakiyah Rahim	4A	\N	04119120017	Laki-laki
471	04119120009	Ramil Saleh Siregar	HRGA & Supporting	Aktif	0	 	 	 	 	4A	\N	04119120009	Laki-laki
472	04125050704	Renaldi Ramjaya	Port & Dispatch	Aktif	0	 	 	 	 	4A	\N	04125050704	Laki-laki
473	04120100007	Rikhardi	Production	Aktif	0	Bernike Hernawati 	Alifa Naufalin Fikria 	Azzahra Rabbani	 	4A	\N	04120100007	Laki-laki
474	04122120002	Riky	Maintenance	Aktif	0	Riri Ratna Anggraini 	Ray Naufal Alhanan	Rania Rihanna Zahira	 	4A	\N	04122120002	Laki-laki
475	04119120075	Rio Eka Saputra	Production	Aktif	0	Dewi Yanna	Omar Kareem Alkhalifi	Elhan Nadhif Alfatih	 	4A	\N	04119120075	Laki-laki
476	04120040010	Rusdin	Finance	Aktif	0	Rismayanti Ismail	Rafindra Atharrazka Muhammad Simantang	Rafassya Faheel Muhammad Simantang	 	4A	\N	04120040010	Laki-laki
477	04119120021	Ruslan	Port & Dispatch	Aktif	0	Rahma Dini	M. Daffa Alfakhry	Nasywa Shafiyya Azzahra	 	4A	\N	04119120021	Laki-laki
478	04119120030	Samri	Maintenance	Aktif	0	Sumiati 	Muh. Alfahrizi Putra Syam 	Muhammad Al Fadhil Pratama 	 	4A	\N	04119120030	Laki-laki
479	04119120039	Suhafid Dg. Bali	SHE	Aktif	0	 	 	 	 	4A	\N	04119120039	Laki-laki
480	04119120066	Suprapto	Quality Control	Aktif	0	Dwi Sutanti	Yussy Furiansyah	Syu'Aib Dwi Wiguna	 	4A	\N	04119120066	Laki-laki
481	04119120081	Suriandi	Quality Control	Aktif	0	Siska Fadhilah	Faizah Siti Fadhilah	 	 	4A	\N	04119120081	Laki-laki
482	04120070017	Syamsuri	HRGA & Supporting	Aktif	0	Haslinda Sari	 	 	 	4A	\N	04120070017	Laki-laki
483	04119120014	Takdir	Maintenance	Aktif	0	Fatmawati 	Nurul Mauliana	Muh Irza Naufal Maulana	 	4A	\N	04119120014	Laki-laki
484	04120070016	Thomas Indra	Port & Dispatch	Aktif	0	Nurhayati 	Akifah Nailah Metha 	 	 	4A	\N	04120070016	Laki-laki
485	04119120005	Triswandi	PPIC	Aktif	0	Nona Salfiana	Arisha Triswandi	Arvino Keenan Triswandi	 	4A	\N	04119120005	Laki-laki
486	04119120041	Umar Ramadhan	Production	Aktif	0	 	 	 	 	4A	\N	04119120041	Laki-laki
487	04119120037	Wikri	Port & Dispatch	Aktif	0	Hartati 	Ryan Maretski Mintarisha 	 	 	4A	\N	04119120037	Laki-laki
488	04120100008	Wityo Basuki	Maintenance	Aktif	0	Ika Widyawaty	Nazira Karunia	Muhammad Luthfi	 	4A	\N	04120100008	Laki-laki
489	04120010019	Yanti Natasari	Finance	Aktif	0	 	Nicolas Gavriel	 	 	4A	\N	04120010019	Laki-laki
490	04119120069	Yanti Prima Sari	SHE	Aktif	0	 	 	 	 	4A	\N	04119120069	Laki-laki
491	04121110026	Yoga Maskur Aslani	Maintenance	Aktif	0	Dwi Arsera	Mhaslan Fadhil Algaisan	 	 	4A	\N	04121110026	Laki-laki
492	04119120038	Yusrizal	Warehouse	Aktif	0	Husmarliza Husmarliza	Altaf Danish Alfatih	Aisyah Silmi Afiqa	 	4A	\N	04119120038	Laki-laki
493	99999999999	TEST	HRGA & Supporting	Aktif	0	TEST2	TEST3	TEST4	TEST5	10 (A-B)	\N	99999999999	Laki-laki
429	04119120012	Bambang Friadi	HRGA & Supporting	Aktif	0	Aulia Rahmi	Isvara Dirandra Arsyakayla	 	 	3 (A-B)	\N	04119120012	Laki-laki
\.


--
-- Data for Name: medical_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_transactions (id, karyawan_id, kategori, nominal, deskripsi, tanggal, foto_bukti, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_logs (id, user_id, action, description, created_at) FROM stdin;
1	6	LOGIN	User user berhasil login	2026-08-18 14:20:17
2	6	LOGIN	User user berhasil login	2026-08-18 14:20:34
3	1	LOGIN	User admin berhasil login	2026-08-18 14:21:24
4	6	LOGIN	User user berhasil login	2026-08-18 14:21:35
5	1	LOGIN	User admin berhasil login	2026-08-18 14:23:47
6	1	LOGOUT	User admin berhasil logout	2026-08-18 14:23:56
7	1	LOGIN	User admin berhasil login	2026-08-18 14:24:00
8	6	LOGIN	User user berhasil login	2026-08-18 14:24:18
9	6	LOGOUT	User user berhasil logout	2026-08-18 14:24:28
10	1	UPDATE_USER	Memperbarui data user ID 6 (user)	2026-08-18 14:24:43
11	6	LOGIN	User user berhasil login	2026-08-18 14:24:49
12	1	UPDATE_KARYAWAN	Memperbarui data karyawan ID 430 (Bernandus Fernando Saputra)	2026-08-18 14:28:29
13	1	UPDATE_KARYAWAN	Memperbarui data karyawan ID 429 (Bambang Friadi)	2026-08-18 14:29:33
14	1	LOGOUT	User admin berhasil logout	2026-08-18 14:42:59
15	1	LOGIN	User admin berhasil login	2026-08-18 14:43:17
16	2	LOGIN	User bernandus.saputra berhasil login	2026-08-18 14:56:04
17	1	LOGOUT	User admin berhasil logout	2026-08-18 15:03:25
18	6	LOGIN	User user berhasil login	2026-08-18 15:03:31
19	6	LOGOUT	User user berhasil logout	2026-08-18 15:03:35
20	2	LOGIN	User bernandus.saputra berhasil login	2026-08-18 15:03:52
21	2	LOGOUT	User bernandus.saputra berhasil logout	2026-08-18 15:04:42
22	1	LOGIN	User admin berhasil login	2026-08-18 15:05:11
23	1	LOGOUT	User admin berhasil logout	2026-08-18 15:15:03
24	1	LOGIN	User admin berhasil login	2026-08-18 15:41:54
25	1	UPDATE_USER	Memperbarui data user ID 6 (user)	2026-08-18 15:45:27
26	1	LOGOUT	User admin berhasil logout	2026-08-18 15:45:34
27	6	LOGIN	User user berhasil login	2026-08-18 15:45:38
28	6	LOGOUT	User user berhasil logout	2026-08-18 15:45:50
29	2	LOGIN	User bernandus.saputra berhasil login	2026-08-18 15:46:02
30	2	LOGOUT	User bernandus.saputra berhasil logout	2026-08-18 15:46:12
31	1	LOGIN	User admin berhasil login	2026-08-18 15:46:16
32	1	LOGOUT	User admin berhasil logout	2026-08-18 16:01:35
33	1	LOGIN	User admin berhasil login	2026-09-09 17:27:44
34	1	LOGOUT	User admin berhasil logout	2026-09-09 17:29:50
35	1	LOGIN	User admin berhasil login	2026-09-10 09:01:41
36	1	LOGOUT	User admin berhasil logout	2026-09-10 09:10:29
37	1	LOGIN	User admin berhasil login	2026-09-10 09:10:42
38	1	UPDATE_KARYAWAN	Memperbarui data karyawan ID 411 (Abdul Radjab)	2026-09-10 09:12:53
39	1	LOGOUT	User admin berhasil logout	2026-09-10 09:24:41
40	1	LOGIN	User admin berhasil login	2026-09-10 09:49:09
41	1	UPDATE_KARYAWAN	Memperbarui data karyawan ID 411 (Abdul Radjab)	2026-09-10 09:49:26
42	1	RESET_BOT_PASSWORD	Reset bot password karyawan Abdul Radjab	2026-09-10 09:52:20
43	1	UPDATE_KARYAWAN	Memperbarui data karyawan ID 411 (Abdul Radjab)	2026-09-10 09:58:14
44	1	UPDATE_KARYAWAN	Memperbarui data karyawan ID 429 (Bambang Friadi)	2026-09-10 09:59:08
45	1	UPDATE_KARYAWAN	Memperbarui data karyawan ID 429 (Bambang Friadi)	2026-09-10 09:59:11
46	1	MEDICAL_DEDUCT	Memotong plafond Rawat Jalan sebesar 500000 untuk karyawan ID 411	2026-09-10 10:07:46
47	1	RESET_BUDGET	Reset manual budget medical karyawan Abdul Radjab untuk tahun ini	2026-09-10 10:08:04
48	1	RESET_BUDGET	Reset manual budget medical karyawan Abdul Radjab untuk tahun ini	2026-09-10 10:08:07
49	1	LOGOUT	User admin berhasil logout	2026-09-10 10:19:18
50	1	LOGIN	User admin berhasil login	2026-09-10 10:26:18
51	1	RESET_BUDGET	Reset manual budget medical karyawan Abdul Radjab untuk tahun ini	2026-09-10 10:26:40
52	1	LOGOUT	User admin berhasil logout	2026-09-10 10:40:41
53	1	LOGIN	User admin berhasil login	2026-09-10 10:57:37
54	1	MEDICAL_DEDUCT	Memotong plafond Rawat Jalan sebesar 2500000 untuk karyawan ID 411	2026-09-10 11:13:07
55	1	RESET_BUDGET	Reset manual budget medical karyawan Abdul Radjab untuk tahun ini	2026-09-10 11:17:56
56	1	RESET_PASSWORD	Meriset password untuk user ID 3 (syam.suri)	2026-09-10 11:29:48
57	1	LOGOUT	User admin berhasil logout	2026-09-10 11:29:51
58	3	LOGIN	User syam.suri berhasil login	2026-09-10 11:29:58
59	3	LOGOUT	User syam.suri berhasil logout	2026-09-10 11:30:26
60	1	LOGIN	User admin berhasil login	2026-09-10 11:30:31
61	1	MEDICAL_DEDUCT	Memotong plafond Rawat Jalan sebesar 5000000 untuk karyawan ID 411	2026-09-10 11:32:25
62	1	UPDATE_USER	Memperbarui data user ID 1 (admin)	2026-09-10 11:34:52
63	1	LOGOUT	User admin berhasil logout	2026-09-10 11:35:00
64	3	LOGIN	User syam.suri berhasil login	2026-09-10 11:35:06
65	3	LOGOUT	User syam.suri berhasil logout	2026-09-10 11:35:19
66	1	LOGIN	User admin berhasil login	2026-09-10 11:35:23
67	1	EDIT_MED_HISTORY	Edit transaksi medical karyawan Abdul Radjab	2026-09-10 11:48:51
68	1	DELETE_MED_HISTORY	Hapus transaksi medical karyawan Abdul Radjab	2026-09-10 11:49:14
69	1	LOGOUT	User admin berhasil logout	2026-09-10 12:37:49
70	1	LOGIN	User admin berhasil login	2026-09-10 12:38:05
71	1	LOGOUT	User admin berhasil logout	2026-09-10 12:49:41
72	1	LOGIN	User admin berhasil login	2026-09-10 12:53:13
73	1	LOGOUT	User admin berhasil logout	2026-09-10 13:08:29
74	1	LOGIN	User admin berhasil login	2026-09-10 13:09:56
75	1	LOGOUT	User admin berhasil logout	2026-09-10 13:17:40
76	3	LOGIN	User syam.suri berhasil login	2026-09-10 13:17:47
77	3	LOGOUT	User syam.suri berhasil logout	2026-09-10 13:18:04
78	1	LOGIN	User admin berhasil login	2026-09-10 13:18:13
79	1	LOGOUT	User admin berhasil logout	2026-09-10 13:46:41
80	1	LOGIN	User admin berhasil login	2026-09-10 16:03:58
81	1	UPDATE_USER	Memperbarui data user ID 1 (admin)	2026-09-10 16:04:20
82	1	LOGOUT	User admin berhasil logout	2026-09-10 16:04:23
83	1	LOGIN	User admin berhasil login	2026-09-10 16:04:35
84	1	UPDATE_USER	Memperbarui data user ID 1 (admin)	2026-09-10 16:04:45
85	1	LOGOUT	User admin berhasil logout	2026-09-10 16:04:47
86	1	FORGOT_PASSWORD	User requesting password reset via email	2026-09-10 16:10:42
87	1	FORGOT_PASSWORD	User requesting password reset via email	2026-09-10 16:16:46
88	1	LOGIN	User admin berhasil login	2026-09-10 16:53:15
89	1	RESET_BOT_PASSWORD	Reset bot password karyawan Bambang Friadi ke default (NIK)	2026-09-10 16:59:13
90	1	UPDATE_KARYAWAN	Memperbarui data karyawan ID 429 (Bambang Friadi)	2026-09-10 17:08:25
91	1	CREATE_KARYAWAN	Menambahkan karyawan baru: TEST (NIK: 99999999999)	2026-09-10 17:10:16
92	1	LOGOUT	User admin berhasil logout	2026-09-11 07:59:39
93	1	LOGIN	User admin berhasil login	2026-09-11 08:05:37
94	1	UPDATE_USER	Memperbarui data user ID 1 (admin)	2026-09-11 08:05:50
95	1	LOGOUT	User admin berhasil logout	2026-09-11 08:05:55
96	1	LOGIN	User admin berhasil login	2026-09-11 12:50:15.573824
97	1	UPDATE_USER	Memperbarui data user ID 1 (admin)	2026-09-11 13:02:32.740203
98	1	BULK_RESET_BUDGET	Melakukan bulk reset manual budget medical untuk seluruh karyawan (tahun ini)	2026-09-11 13:19:50.322427
99	1	UPDATE_USER	Memperbarui data user ID 1 (admin)	2026-09-11 13:30:29.370036
100	1	LOGOUT	User admin berhasil logout	2026-09-11 13:35:56.105394
101	1	LOGIN	User admin berhasil login	2026-09-11 13:38:59.508127
102	1	LOGOUT	User admin berhasil logout	2026-09-11 13:46:46.725768
103	1	FORGOT_PASSWORD	User requesting password reset via email	2026-09-11 13:46:55.565846
104	1	LOGIN	User admin berhasil login	2026-09-11 13:47:10.491067
105	1	RESET_PASSWORD	User successfully reset their password	2026-09-11 13:47:38.76025
106	1	LOGOUT	User admin berhasil logout	2026-09-11 13:48:48.667238
107	1	LOGIN	User admin berhasil login	2026-09-11 13:48:52.709945
108	1	LOGOUT	User admin berhasil logout	2026-09-11 13:51:48.137117
109	1	FORGOT_PASSWORD	User requesting password reset via email	2026-09-11 13:52:09.070865
110	1	LOGIN	User admin berhasil login	2026-09-11 13:53:05.781143
111	1	LOGOUT	User admin berhasil logout	2026-09-11 13:55:44.078532
112	1	LOGIN	User admin berhasil login	2026-09-11 13:55:56.518961
113	1	LOGOUT	User admin berhasil logout	2026-09-11 14:10:29.466153
114	1	LOGIN	User admin berhasil login	2026-09-11 14:10:37.051015
115	1	LOGOUT	User admin berhasil logout	2026-09-11 14:10:47.54889
116	1	LOGIN	User admin berhasil login	2026-09-11 14:12:29.126082
117	1	LOGOUT	User admin berhasil logout	2026-09-11 14:23:36.880131
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, reset_token, reset_token_expires, nama, role, permissions, created_at) FROM stdin;
2	bernandus.saputra	\N	$2b$10$iAK7cyOlrlI5Q2vKgYpMku.4okR2itddKDEMYFQO39G5SL0QMGGzi	\N	\N	Bernandus Fernando Saputra	hrga_section_head	{"view":true,"add":true,"edit":true,"delete":true,"export":true,"manage_users":false}	2026-08-13 10:25:34
3	syam.suri	\N	$2b$10$Px0limVlswRrDPdyo2KwauhV2amH/Fj8dBQ0xsIF6eHyYRTJxcvrG	\N	\N	Leader HRGA	hrga_leader	{"view":true,"add":true,"edit":true,"delete":true,"export":true,"manage_users":false}	2026-08-13 10:25:34
4	sectionhead	\N	$2b$10$ESilMkR50Ea88zbAeHFs3O9Ou71tzuISqUD1Viu/GanqVc/fxa8v2	\N	\N	Section Head HRGA	hrga_section_head	{"view":true,"add":true,"edit":true,"delete":true,"export":true,"manage_users":false}	2026-08-14 11:59:31
5	leader	\N	$2b$10$kW5HxAt4oDnozVIA23ZcruO3PDQsYiiiADTEUk4U7Le.d4SnHbIPG	\N	\N	Leader HRGA	hrga_leader	{"view":true,"add":true,"edit":true,"delete":false,"export":true,"manage_users":false}	2026-08-14 11:59:31
6	user	\N	$2b$10$3NJ/04L2ffxhgduGUdJyJevN8wjFrC07ezGPkRmaMQT4WWo7C2yDC	\N	\N	Users	user_basic	{"view":true,"add":false,"edit":false,"delete":false,"export":false,"manage_users":false}	2026-08-18 13:58:06
1	admin	bambang.friadi@cemindo.com	$2b$10$Q086wQfAZubQLnbQZhCXYu086DpR4PrT3z6/ckshJesaf.OR3vmZO	8793fc04e142caf2423463a021ed5b39837461277edd01a010a04df73235444d	2026-09-11 14:52:03.559	Dev Administrator	administrator	{"view":true,"add":true,"edit":true,"delete":true,"export":true,"manage_users":true,"reset_pass_bot":true,"reset_password":true,"delete_medical_history":true,"edit_medical_history":true,"export_medical_history":true,"bulk_reset_budget":true}	2026-08-13 10:25:34
\.


--
-- Name: karyawan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.karyawan_id_seq', 494, false);


--
-- Name: medical_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_transactions_id_seq', 1, false);


--
-- Name: system_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_logs_id_seq', 117, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, false);


--
-- Name: karyawan karyawan_nik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.karyawan
    ADD CONSTRAINT karyawan_nik_key UNIQUE (nik);


--
-- Name: karyawan karyawan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.karyawan
    ADD CONSTRAINT karyawan_pkey PRIMARY KEY (id);


--
-- Name: medical_transactions medical_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_transactions
    ADD CONSTRAINT medical_transactions_pkey PRIMARY KEY (id);


--
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: medical_transactions medical_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_transactions
    ADD CONSTRAINT medical_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: medical_transactions medical_transactions_karyawan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_transactions
    ADD CONSTRAINT medical_transactions_karyawan_id_fkey FOREIGN KEY (karyawan_id) REFERENCES public.karyawan(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict AWLhgbXyGCQY7cFXRjMz7o31o6r4dm34UfOIC3vj4YL7eBMd8pWvYHdvnFCfmyH

