-- =====================================================
-- 31. feladat - Szakkörök (3 tábla, N:M kapcsolat kapcsolótáblával)
-- Importálás: phpMyAdmin -> Importálás -> ez a fájl
-- Újra importálva visszaáll az eredeti állapot.
-- =====================================================

CREATE DATABASE IF NOT EXISTS `szakkorok` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE `szakkorok`;

DROP TABLE IF EXISTS `jelentkezesek`;
DROP TABLE IF EXISTS `szakkorok`;
DROP TABLE IF EXISTS `diakok`;

CREATE TABLE `diakok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `osztaly` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `szakkorok` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nev` varchar(100) NOT NULL,
  `tanar` varchar(100) NOT NULL,
  -- ENUM: az ORDER BY nap a felsorolás sorrendjében rendez (hétfő, kedd, ...), nem ábécé szerint!
  `nap` enum('hétfő','kedd','szerda','csütörtök','péntek') NOT NULL,
  `max_letszam` tinyint(3) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- Kapcsolótábla: melyik diák melyik szakkörre jár.
-- Az összetett elsődleges kulcs miatt egy diák egy szakkörre csak egyszer jelentkezhet.
CREATE TABLE `jelentkezesek` (
  `diak_id` int(11) NOT NULL,
  `szakkor_id` int(11) NOT NULL,
  `datum` date NOT NULL,
  PRIMARY KEY (`diak_id`, `szakkor_id`),
  KEY `fk_jelentkezesek_szakkor` (`szakkor_id`),
  CONSTRAINT `fk_jelentkezesek_diak` FOREIGN KEY (`diak_id`) REFERENCES `diakok` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jelentkezesek_szakkor` FOREIGN KEY (`szakkor_id`) REFERENCES `szakkorok` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

INSERT INTO `diakok` (`id`, `nev`, `osztaly`) VALUES
(1, 'Kiss Anna', '10.A'),
(2, 'Nagy Bence', '10.A'),
(3, 'Tóth Csilla', '10.B'),
(4, 'Szabó Dávid', '10.B'),
(5, 'Horváth Eszter', '11.A'),
(6, 'Varga Ferenc', '11.A'),
(7, 'Kovács Gréta', '11.B'),
(8, 'Molnár Hunor', '11.B'),
(9, 'Balogh Ilona', '12.A'),
(10, 'Farkas János', '12.A'),
(11, 'Papp Kata', '12.B'),
(12, 'Lakatos Levente', '12.B'),
(13, 'Simon Míra', '9.A');

INSERT INTO `szakkorok` (`id`, `nev`, `tanar`, `nap`, `max_letszam`) VALUES
(1, 'Robotika', 'Kovács Péter', 'kedd', 6),
(2, 'Kosárlabda', 'Nagy Éva', 'hétfő', 10),
(3, 'Színjátszó', 'Tóth Anna', 'szerda', 8),
(4, 'Sakk', 'Szabó Gábor', 'kedd', 4),
(5, 'Fotó', 'Varga Zsolt', 'csütörtök', 5),
(6, 'Webfejlesztés', 'Kiss Márton', 'szerda', 6);

INSERT INTO `jelentkezesek` (`diak_id`, `szakkor_id`, `datum`) VALUES
(2, 1, '2026-09-08'), (4, 1, '2026-09-08'), (6, 1, '2026-09-09'), (8, 1, '2026-09-10'), (10, 1, '2026-09-12'),
(1, 2, '2026-09-07'), (2, 2, '2026-09-07'), (5, 2, '2026-09-08'), (6, 2, '2026-09-08'),
(9, 2, '2026-09-09'), (10, 2, '2026-09-11'), (11, 2, '2026-09-14'),
(1, 3, '2026-09-09'), (3, 3, '2026-09-09'), (5, 3, '2026-09-10'), (7, 3, '2026-09-15'),
(3, 4, '2026-09-07'), (6, 4, '2026-09-08'), (8, 4, '2026-09-08'), (11, 4, '2026-09-10'),
(1, 5, '2026-09-11'), (7, 5, '2026-09-11'), (9, 5, '2026-09-16');
