-- =====================================================
-- 33. feladat - Repülőjáratok (3 tábla, egy táblára két idegen kulcs)
-- Importálás: phpMyAdmin -> Importálás -> ez a fájl
-- Újra importálva visszaáll az eredeti állapot.
-- A menetrend kitalált. Egyszerűsítés: minden idő budapesti idő,
-- és egyik járat sem lépi át az éjfélt.
-- =====================================================

CREATE DATABASE IF NOT EXISTS `jaratok` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `jaratok`;

DROP TABLE IF EXISTS `jaratok`;
DROP TABLE IF EXISTS `legitarsasagok`;
DROP TABLE IF EXISTS `repuloterek`;

CREATE TABLE `repuloterek` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kod` char(3) NOT NULL COMMENT 'IATA-kód, pl. BUD',
  `nev` varchar(100) NOT NULL,
  `varos` varchar(50) NOT NULL,
  `orszag` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_repuloterek_kod` (`kod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `legitarsasagok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `kod` char(2) NOT NULL,
  `nev` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_legitarsasagok_kod` (`kod`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- Egy járat KÉT repülőtérre hivatkozik (honnan, hova) -> a lekérdezésben
-- a repuloterek táblát kétszer kell JOIN-olni, két különböző álnévvel.
CREATE TABLE `jaratok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jaratszam` varchar(10) NOT NULL,
  `legitarsasag_id` int(11) NOT NULL,
  `honnan_id` int(11) NOT NULL,
  `hova_id` int(11) NOT NULL,
  `indulas` time NOT NULL,
  `idotartam` smallint(5) UNSIGNED NOT NULL COMMENT 'perc',
  `ar` int(11) NOT NULL COMMENT 'Ft',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_jaratok_jaratszam` (`jaratszam`),
  KEY `fk_jaratok_legitarsasag` (`legitarsasag_id`),
  KEY `fk_jaratok_honnan` (`honnan_id`),
  KEY `fk_jaratok_hova` (`hova_id`),
  CONSTRAINT `fk_jaratok_legitarsasag` FOREIGN KEY (`legitarsasag_id`) REFERENCES `legitarsasagok` (`id`),
  CONSTRAINT `fk_jaratok_honnan` FOREIGN KEY (`honnan_id`) REFERENCES `repuloterek` (`id`),
  CONSTRAINT `fk_jaratok_hova` FOREIGN KEY (`hova_id`) REFERENCES `repuloterek` (`id`),
  CONSTRAINT `chk_jaratok_ket_repuloter` CHECK (`honnan_id` <> `hova_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

INSERT INTO `repuloterek` (`id`, `kod`, `nev`, `varos`, `orszag`) VALUES
(1, 'BUD', 'Liszt Ferenc nemzetközi repülőtér', 'Budapest', 'Magyarország'),
(2, 'VIE', 'Bécs-Schwechat', 'Bécs', 'Ausztria'),
(3, 'LHR', 'Heathrow', 'London', 'Egyesült Királyság'),
(4, 'CDG', 'Charles de Gaulle', 'Párizs', 'Franciaország'),
(5, 'FRA', 'Frankfurt am Main', 'Frankfurt', 'Németország'),
(6, 'FCO', 'Fiumicino', 'Róma', 'Olaszország'),
(7, 'JFK', 'John F. Kennedy', 'New York', 'Egyesült Államok'),
(8, 'DEB', 'Debreceni nemzetközi repülőtér', 'Debrecen', 'Magyarország');

INSERT INTO `legitarsasagok` (`id`, `kod`, `nev`) VALUES
(1, 'W6', 'Wizz Air'),
(2, 'LH', 'Lufthansa'),
(3, 'BA', 'British Airways'),
(4, 'AF', 'Air France'),
(5, 'OS', 'Austrian Airlines');

INSERT INTO `jaratok` (`id`, `jaratszam`, `legitarsasag_id`, `honnan_id`, `hova_id`, `indulas`, `idotartam`, `ar`) VALUES
(1, 'W62201', 1, 1, 3, '06:10:00', 170, 32000),
(2, 'W62202', 1, 3, 1, '10:30:00', 160, 35000),
(3, 'LH1341', 2, 1, 5, '07:00:00', 110, 58000),
(4, 'LH400', 2, 5, 7, '10:15:00', 520, 210000),
(5, 'BA865', 3, 1, 3, '12:40:00', 165, 74000),
(6, 'BA117', 3, 3, 7, '16:20:00', 485, 190000),
(7, 'AF1495', 4, 1, 4, '09:05:00', 145, 61000),
(8, 'AF6', 4, 4, 7, '13:30:00', 500, 230000),
(9, 'OS712', 5, 1, 2, '07:30:00', 45, 29000),
(10, 'OS87', 5, 2, 7, '09:50:00', 580, 205000),
(11, 'W62335', 1, 1, 6, '14:00:00', 110, 27000),
(12, 'W62336', 1, 6, 1, '17:10:00', 105, 29000),
(13, 'LH1342', 2, 5, 1, '18:30:00', 105, 56000),
(14, 'OS711', 5, 2, 1, '20:00:00', 45, 27000),
(15, 'W62203', 1, 1, 3, '18:45:00', 170, 41000),
(16, 'AF1494', 4, 4, 1, '18:00:00', 140, 63000);
