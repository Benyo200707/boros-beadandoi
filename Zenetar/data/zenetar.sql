-- =====================================================
-- 29. feladat - Zenetár (2 tábla, 1:N kapcsolat)
-- Importálás: phpMyAdmin -> Importálás -> ez a fájl
-- Újra importálva visszaáll az eredeti állapot.
-- Az adatok gyakorláshoz készültek, nem pontos diszkográfiák.
-- =====================================================

CREATE DATABASE IF NOT EXISTS `zenetar` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `zenetar`;

DROP TABLE IF EXISTS `albumok`;
DROP TABLE IF EXISTS `eloadok`;

CREATE TABLE `eloadok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `orszag` varchar(50) NOT NULL,
  `alapitas` smallint(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `albumok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eloado_id` int(11) NOT NULL,
  `cim` varchar(150) NOT NULL,
  `ev` smallint(6) NOT NULL,
  `mufaj` varchar(30) NOT NULL,
  `hossz` smallint(6) NOT NULL COMMENT 'perc',
  PRIMARY KEY (`id`),
  KEY `fk_albumok_eloado` (`eloado_id`),
  CONSTRAINT `fk_albumok_eloado` FOREIGN KEY (`eloado_id`) REFERENCES `eloadok` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

INSERT INTO `eloadok` (`id`, `nev`, `orszag`, `alapitas`) VALUES
(1, 'Omega', 'Magyarország', 1962),
(2, 'Queen', 'Egyesült Királyság', 1970),
(3, 'Quimby', 'Magyarország', 1991),
(4, 'ABBA', 'Svédország', 1972),
(5, 'Tankcsapda', 'Magyarország', 1989),
(6, 'Coldplay', 'Egyesült Királyság', 1997),
(7, 'Carson Coma', 'Magyarország', 2016),
(8, 'Roxette', 'Svédország', 1986);

INSERT INTO `albumok` (`id`, `eloado_id`, `cim`, `ev`, `mufaj`, `hossz`) VALUES
(1, 1, '10000 lépés', 1969, 'rock', 47),
(2, 1, 'Gammapolis', 1979, 'rock', 38),
(3, 2, 'A Night at the Opera', 1975, 'rock', 43),
(4, 2, 'The Game', 1980, 'rock', 35),
(5, 3, 'Kilégzés', 2002, 'alternatív', 56),
(6, 4, 'Waterloo', 1974, 'pop', 38),
(7, 4, 'Arrival', 1976, 'pop', 33),
(8, 5, 'Agyarország', 2000, 'rock', 45),
(9, 6, 'Parachutes', 2000, 'alternatív', 41),
(10, 6, 'A Rush of Blood to the Head', 2002, 'alternatív', 54),
(11, 6, 'Viva la Vida', 2008, 'pop', 46),
(12, 8, 'Look Sharp!', 1988, 'pop', 49),
(13, 8, 'Joyride', 1991, 'pop', 55);
