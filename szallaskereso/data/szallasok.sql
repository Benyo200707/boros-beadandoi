-- =====================================================
-- 30. feladat - Szálláskereső (2 tábla, 1:N kapcsolat)
-- Importálás: phpMyAdmin -> Importálás -> ez a fájl
-- Újra importálva visszaáll az eredeti állapot.
-- A szállások kitaláltak.
-- =====================================================

CREATE DATABASE IF NOT EXISTS `szallasok` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `szallasok`;

DROP TABLE IF EXISTS `szallasok`;
DROP TABLE IF EXISTS `varosok`;

CREATE TABLE `varosok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(50) NOT NULL,
  `orszag` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_varosok_nev` (`nev`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `szallasok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `varos_id` int(11) NOT NULL,
  `nev` varchar(100) NOT NULL,
  `csillag` tinyint(3) UNSIGNED NOT NULL,
  `ar` int(11) NOT NULL COMMENT 'Ft / fő / éj',
  `medence` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0 = nincs, 1 = van',
  `ertekeles` decimal(3,1) NOT NULL COMMENT '1.0 - 10.0',
  PRIMARY KEY (`id`),
  KEY `fk_szallasok_varos` (`varos_id`),
  CONSTRAINT `fk_szallasok_varos` FOREIGN KEY (`varos_id`) REFERENCES `varosok` (`id`),
  CONSTRAINT `chk_szallasok_csillag` CHECK (`csillag` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

INSERT INTO `varosok` (`id`, `nev`, `orszag`) VALUES
(1, 'Budapest', 'Magyarország'),
(2, 'Eger', 'Magyarország'),
(3, 'Siófok', 'Magyarország'),
(4, 'Bécs', 'Ausztria'),
(5, 'Prága', 'Csehország'),
(6, 'Debrecen', 'Magyarország'),
(7, 'Graz', 'Ausztria');

INSERT INTO `szallasok` (`id`, `varos_id`, `nev`, `csillag`, `ar`, `medence`, `ertekeles`) VALUES
(1, 1, 'Duna Panzió', 3, 18000, 0, 8.4),
(2, 1, 'Lánchíd Hotel', 5, 52000, 1, 9.3),
(3, 1, 'Városliget Hostel', 2, 9500, 0, 7.6),
(4, 2, 'Várkapu Vendégház', 3, 14500, 0, 8.9),
(5, 2, 'Termál Hotel Eger', 4, 26000, 1, 8.7),
(6, 3, 'Balaton Resort', 4, 31000, 1, 8.1),
(7, 3, 'Napfény Apartman', 2, 12000, 0, 7.9),
(8, 4, 'Schönbrunn Hotel', 4, 38000, 0, 8.8),
(9, 4, 'Prater Hostel', 2, 13500, 0, 7.2),
(10, 5, 'Moldva Hotel', 3, 21000, 0, 8.5),
(11, 5, 'Óváros Rezidencia', 5, 47000, 1, 9.1),
(12, 7, 'Grazi Vendégház', 3, 17500, 0, 8.0);
