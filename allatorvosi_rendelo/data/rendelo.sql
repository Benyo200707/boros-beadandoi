-- =====================================================
-- 37. feladat - Állatorvosi rendelő (3 tábla: gazda -> állat -> kezelés)
-- Importálás: phpMyAdmin -> Importálás -> ez a fájl
-- Újra importálva visszaáll az eredeti állapot.
-- Az adatok kitaláltak.
-- =====================================================

CREATE DATABASE IF NOT EXISTS `rendelo` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `rendelo`;

DROP TABLE IF EXISTS `kezelesek`;
DROP TABLE IF EXISTS `allatok`;
DROP TABLE IF EXISTS `gazdak`;

CREATE TABLE `gazdak` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `telefon` varchar(20) NOT NULL,
  `varos` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `allatok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gazda_id` int(11) NOT NULL,
  `nev` varchar(50) NOT NULL,
  `faj` varchar(20) NOT NULL,
  `szuletes` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_allatok_gazda` (`gazda_id`),
  CONSTRAINT `fk_allatok_gazda` FOREIGN KEY (`gazda_id`) REFERENCES `gazdak` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `kezelesek` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `allat_id` int(11) NOT NULL,
  `datum` date NOT NULL,
  `leiras` varchar(100) NOT NULL,
  `dij` int(11) NOT NULL COMMENT 'Ft',
  PRIMARY KEY (`id`),
  KEY `fk_kezelesek_allat` (`allat_id`),
  CONSTRAINT `fk_kezelesek_allat` FOREIGN KEY (`allat_id`) REFERENCES `allatok` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_kezelesek_dij` CHECK (`dij` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

INSERT INTO `gazdak` (`id`, `nev`, `telefon`, `varos`) VALUES
(1, 'Kovács Éva', '+36 30 111 2233', 'Budapest'),
(2, 'Szabó Tamás', '+36 20 222 3344', 'Budapest'),
(3, 'Tóth Judit', '+36 70 333 4455', 'Érd'),
(4, 'Nagy Ádám', '+36 30 444 5566', 'Budaörs'),
(5, 'Molnár Petra', '+36 20 555 6677', 'Érd');

INSERT INTO `allatok` (`id`, `gazda_id`, `nev`, `faj`, `szuletes`) VALUES
(1, 1, 'Bodri', 'kutya', '2018-04-12'),
(2, 1, 'Cirmi', 'macska', '2020-06-01'),
(3, 2, 'Morzsa', 'kutya', '2015-09-23'),
(4, 3, 'Pamacs', 'nyúl', '2022-03-15'),
(5, 3, 'Csőrike', 'papagáj', '2019-11-30'),
(6, 4, 'Vakarcs', 'macska', '2021-01-08'),
(7, 4, 'Rex', 'kutya', '2023-05-20');

INSERT INTO `kezelesek` (`id`, `allat_id`, `datum`, `leiras`, `dij`) VALUES
(1, 1, '2026-01-14', 'Éves oltás', 12000),
(2, 1, '2026-03-02', 'Fogkőeltávolítás', 25000),
(3, 2, '2026-02-10', 'Ivartalanítás', 30000),
(4, 3, '2026-01-20', 'Ízületi vizsgálat', 15000),
(5, 3, '2026-04-05', 'Röntgen', 18000),
(6, 3, '2026-06-18', 'Kontrollvizsgálat', 8000),
(7, 4, '2026-02-25', 'Karomvágás', 3000),
(8, 5, '2026-05-12', 'Tollvizsgálat', 6000),
(9, 6, '2026-03-30', 'Éves oltás', 12000),
(10, 6, '2026-09-14', 'Bőrgyógyászati vizsgálat', 14000),
(11, 2, '2026-10-06', 'Éves oltás', 12000),
(12, 1, '2026-10-21', 'Kontrollvizsgálat', 8000);
