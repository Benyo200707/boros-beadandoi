-- =====================================================
-- 40. feladat - Mozi (film -> vetítés <- terem, vetítés -> foglalás)
-- Importálás: phpMyAdmin -> Importálás -> ez a fájl
-- Újra importálva visszaáll az eredeti állapot.
-- Az adatok kitaláltak.
-- =====================================================

SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS `mozi` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `mozi`;

DROP TABLE IF EXISTS `foglalasok`;
DROP TABLE IF EXISTS `vetitesek`;
DROP TABLE IF EXISTS `termek`;
DROP TABLE IF EXISTS `filmek`;

CREATE TABLE `filmek` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cim` varchar(100) NOT NULL,
  `hossz` int(11) NOT NULL COMMENT 'perc',
  `korhatar` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `termek` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(50) NOT NULL,
  `sorok` int(11) NOT NULL,
  `szekek` int(11) NOT NULL COMMENT 'szék / sor',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `vetitesek` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `film_id` int(11) NOT NULL,
  `terem_id` int(11) NOT NULL,
  `kezdes` datetime NOT NULL,
  `jegyar` int(11) NOT NULL COMMENT 'Ft',
  PRIMARY KEY (`id`),
  KEY `fk_vetitesek_film` (`film_id`),
  KEY `fk_vetitesek_terem` (`terem_id`),
  CONSTRAINT `fk_vetitesek_film` FOREIGN KEY (`film_id`) REFERENCES `filmek` (`id`),
  CONSTRAINT `fk_vetitesek_terem` FOREIGN KEY (`terem_id`) REFERENCES `termek` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `foglalasok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vetites_id` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `sor` int(11) NOT NULL,
  `szek` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_foglalasok_hely` (`vetites_id`, `sor`, `szek`),
  CONSTRAINT `fk_foglalasok_vetites` FOREIGN KEY (`vetites_id`) REFERENCES `vetitesek` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

INSERT INTO `filmek` (`id`, `cim`, `hossz`, `korhatar`) VALUES
(1, 'A Pál utcai fiúk', 110, 6),
(2, 'Kincsem', 120, 12),
(3, 'Saul fia', 107, 16),
(4, 'Testről és lélekről', 116, 16),
(5, 'Az ember tragédiája', 160, 12);

INSERT INTO `termek` (`id`, `nev`, `sorok`, `szekek`) VALUES
(1, 'Nagyterem', 8, 12),
(2, 'Kisterem', 5, 8),
(3, 'Klubterem', 2, 4);

INSERT INTO `vetitesek` (`id`, `film_id`, `terem_id`, `kezdes`, `jegyar`) VALUES
(1, 1, 1, '2026-11-20 15:00:00', 2200),
(2, 2, 2, '2026-11-20 16:30:00', 1900),
(3, 3, 3, '2026-11-20 18:00:00', 1800),
(4, 1, 1, '2026-11-20 19:00:00', 2400),
(5, 4, 2, '2026-11-20 20:15:00', 2000),
(6, 2, 1, '2026-11-21 14:00:00', 1900),
(7, 3, 3, '2026-11-21 20:00:00', 1800);

INSERT INTO `foglalasok` (`id`, `vetites_id`, `nev`, `sor`, `szek`) VALUES
(1, 1, 'Kovács Péter', 4, 6),
(2, 1, 'Kovács Péter', 4, 7),
(3, 1, 'Szabó Anna', 5, 1),
(4, 1, 'Szabó Anna', 5, 2),
(5, 1, 'Szabó Anna', 5, 3),
(6, 1, 'Tóth Gábor', 8, 12),
(7, 2, 'Nagy Eszter', 3, 4),
(8, 2, 'Nagy Eszter', 3, 5),
(9, 2, 'Varga Imre', 1, 1),
(10, 3, 'Fekete Lili', 1, 2),
(11, 3, 'Fekete Lili', 1, 3),
(12, 3, 'Balogh Ádám', 2, 1),
(13, 3, 'Balogh Ádám', 2, 2),
(14, 3, 'Molnár Kata', 2, 4),
(15, 4, 'Kiss Dóra', 6, 6),
(16, 4, 'Kiss Dóra', 6, 7),
(17, 4, 'Horváth Bence', 1, 1),
(18, 4, 'Horváth Bence', 1, 2),
(19, 6, 'Lakatos Réka', 3, 3),
(20, 6, 'Lakatos Réka', 3, 4),
(21, 7, 'Simon Márk', 1, 1),
(22, 7, 'Simon Márk', 1, 2),
(23, 7, 'Papp Nóra', 1, 3),
(24, 7, 'Papp Nóra', 1, 4),
(25, 7, 'Farkas Dénes', 2, 1),
(26, 7, 'Farkas Dénes', 2, 2),
(27, 7, 'Jakab Emma', 2, 3),
(28, 7, 'Jakab Emma', 2, 4);
