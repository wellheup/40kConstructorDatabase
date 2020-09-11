-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: classmysql.engr.oregonstate.edu:3306
-- Generation Time: Mar 19, 2020 at 01:15 PM
-- Server version: 10.4.11-MariaDB-log
-- PHP Version: 7.0.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cs340_wellheup`
--

-- --------------------------------------------------------

--
-- Table structure for table `armylists`
--

CREATE TABLE `armylists` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `point_total` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `armylists`
--

INSERT INTO `armylists` (`id`, `name`, `point_total`) VALUES
(1, 'Strike Team Zero', '771'),
(2, 'Strike Team Five', '118'),
(4, 'Sidewinder Galoro', '216');

-- --------------------------------------------------------

--
-- Table structure for table `armylists_assaultsquads`
--

CREATE TABLE `armylists_assaultsquads` (
  `armylistid` int(11) NOT NULL,
  `assaultsquadid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `armylists_assaultsquads`
--

INSERT INTO `armylists_assaultsquads` (`armylistid`, `assaultsquadid`) VALUES
(1, 1),
(1, 2),
(2, 6),
(4, 8);

-- --------------------------------------------------------

--
-- Table structure for table `assaultsquads`
--

CREATE TABLE `assaultsquads` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `space_marines_count` int(11) NOT NULL DEFAULT 0,
  `has_sergeant` tinyint(1) NOT NULL DEFAULT 0,
  `has_jumppacks` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `assaultsquads`
--

INSERT INTO `assaultsquads` (`id`, `name`, `space_marines_count`, `has_sergeant`, `has_jumppacks`) VALUES
(1, 'Squad Jupiter', 4, 1, 1),
(2, 'Squad Side-Winder', 6, 1, 1),
(6, 'Noodle Squad', 0, 0, 0),
(8, 'SquadsRUS', 0, 0, 1),
(9, 'Armyless Squad', 0, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `assaultsquads_spacemarines`
--

CREATE TABLE `assaultsquads_spacemarines` (
  `assaultsquadid` int(11) NOT NULL,
  `spacemarineid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `assaultsquads_spacemarines`
--

INSERT INTO `assaultsquads_spacemarines` (`assaultsquadid`, `spacemarineid`) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 5),
(2, 6),
(2, 7),
(2, 8),
(2, 9),
(2, 10),
(2, 14),
(1, 15),
(2, 16),
(8, 18),
(8, 19),
(8, 20),
(6, 21),
(6, 22);

-- --------------------------------------------------------

--
-- Table structure for table `equipments`
--

CREATE TABLE `equipments` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_sergeant_weapon` tinyint(1) NOT NULL DEFAULT 0,
  `is_special_weapon` tinyint(1) NOT NULL DEFAULT 0,
  `point_cost` int(11) NOT NULL DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `equipments`
--

INSERT INTO `equipments` (`id`, `name`, `is_sergeant_weapon`, `is_special_weapon`, `point_cost`) VALUES
(1, 'Flamer', 0, 0, 10),
(2, 'Plasma Pistol', 0, 0, 10),
(3, 'Evicserator', 0, 0, 10),
(4, 'Combat Shield', 1, 1, 10),
(5, 'Melta Bomb', 1, 1, 10),
(7, 'Power Sword', 1, 0, 10),
(8, 'Very Special Test', 0, 1, 11),
(11, 'Baby Geosephats', 0, 0, 37),
(12, 'SwordieMaGordie', 0, 1, 20),
(28, 'Chainsword', 0, 0, 5),
(29, 'Bolt Pistol', 0, 0, 5),
(30, 'Black Tar', 0, 1, 12),
(31, 'Juneberries', 0, 1, 5);

-- --------------------------------------------------------

--
-- Table structure for table `sergeants`
--

CREATE TABLE `sergeants` (
  `id` int(11) NOT NULL,
  `assaultsquadid` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `base_point_cost` int(11) NOT NULL DEFAULT 15
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `sergeants`
--

INSERT INTO `sergeants` (`id`, `assaultsquadid`, `name`, `base_point_cost`) VALUES
(21, 1, 'Ringo', 15),
(22, 2, 'Jeremiah', 15),
(26, 1, 'Kraken', 20),
(27, 8, 'Peter', 15),
(28, 6, 'Noodle1', 15),
(29, NULL, 'Noodle2', 15);

-- --------------------------------------------------------

--
-- Table structure for table `sergeants_equipments`
--

CREATE TABLE `sergeants_equipments` (
  `sergeantid` int(11) NOT NULL,
  `equipmentid` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `sergeants_equipments`
--

INSERT INTO `sergeants_equipments` (`sergeantid`, `equipmentid`) VALUES
(21, 3),
(21, 11),
(22, 2),
(22, 1),
(21, 8),
(21, 4),
(21, 12),
(22, 5),
(26, 29),
(26, 28),
(27, 28),
(27, 29),
(27, 30),
(28, 3),
(28, 11),
(28, 31);

-- --------------------------------------------------------

--
-- Table structure for table `spacemarines`
--

CREATE TABLE `spacemarines` (
  `id` int(11) NOT NULL,
  `assaultsquadid` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `base_point_cost` int(11) NOT NULL DEFAULT 13
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `spacemarines`
--

INSERT INTO `spacemarines` (`id`, `assaultsquadid`, `name`, `base_point_cost`) VALUES
(1, 1, 'Marine', 13),
(2, 1, 'Marine', 13),
(3, 1, 'Marine', 13),
(5, 2, 'Marine', 13),
(6, 2, 'Marine', 13),
(7, 2, 'Marine', 13),
(8, 2, 'Marine', 13),
(9, NULL, 'Marine', 13),
(10, 2, 'Marine', 13),
(14, 2, 'Marine', 13),
(15, 1, 'Marine', 13),
(16, 2, 'Marine', 13),
(18, 8, 'Marine', 13),
(19, NULL, 'Marine', 13),
(20, 8, 'Marine', 13),
(21, 6, 'Marine', 13),
(22, 6, 'Marine', 13);

-- --------------------------------------------------------

--
-- Table structure for table `spacemarines_equipments`
--

CREATE TABLE `spacemarines_equipments` (
  `spacemarineid` int(11) NOT NULL,
  `equipmentid` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `spacemarines_equipments`
--

INSERT INTO `spacemarines_equipments` (`spacemarineid`, `equipmentid`) VALUES
(1, 1),
(2, 29),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(7, 1),
(8, 1),
(9, 1),
(10, 1),
(1, 3),
(2, 2),
(3, 28),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(8, 2),
(9, 2),
(10, 2),
(14, 1),
(14, 1),
(15, 3),
(15, 11),
(16, 2),
(16, 3),
(17, 3),
(17, 2),
(18, 28),
(18, 2),
(19, 28),
(19, 2),
(20, 29),
(20, 28),
(21, 1),
(21, 29),
(22, 28),
(22, 29);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `armylists`
--
ALTER TABLE `armylists`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `armylists_assaultsquads`
--
ALTER TABLE `armylists_assaultsquads`
  ADD KEY `armylistid` (`armylistid`),
  ADD KEY `assaultsquadid` (`assaultsquadid`);

--
-- Indexes for table `assaultsquads`
--
ALTER TABLE `assaultsquads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `assaultsquads_spacemarines`
--
ALTER TABLE `assaultsquads_spacemarines`
  ADD KEY `assaultsquadid` (`assaultsquadid`),
  ADD KEY `spacemarineid` (`spacemarineid`);

--
-- Indexes for table `equipments`
--
ALTER TABLE `equipments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sergeants`
--
ALTER TABLE `sergeants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assaultsquadid` (`assaultsquadid`);

--
-- Indexes for table `sergeants_equipments`
--
ALTER TABLE `sergeants_equipments`
  ADD KEY `sergeantid` (`sergeantid`),
  ADD KEY `equipmentid` (`equipmentid`);

--
-- Indexes for table `spacemarines`
--
ALTER TABLE `spacemarines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assaultsquadid` (`assaultsquadid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `armylists`
--
ALTER TABLE `armylists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `assaultsquads`
--
ALTER TABLE `assaultsquads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `equipments`
--
ALTER TABLE `equipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `sergeants`
--
ALTER TABLE `sergeants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `spacemarines`
--
ALTER TABLE `spacemarines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `armylists_assaultsquads`
--
ALTER TABLE `armylists_assaultsquads`
  ADD CONSTRAINT `armylists_assaultsquads_ibfk_1` FOREIGN KEY (`armylistid`) REFERENCES `armylists` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `armylists_assaultsquads_ibfk_2` FOREIGN KEY (`assaultsquadid`) REFERENCES `assaultsquads` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assaultsquads_spacemarines`
--
ALTER TABLE `assaultsquads_spacemarines`
  ADD CONSTRAINT `assaultsquads_spacemarines_ibfk_1` FOREIGN KEY (`assaultsquadid`) REFERENCES `assaultsquads` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assaultsquads_spacemarines_ibfk_2` FOREIGN KEY (`spacemarineid`) REFERENCES `spacemarines` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sergeants`
--
ALTER TABLE `sergeants`
  ADD CONSTRAINT `sergeants_ibfk_1` FOREIGN KEY (`assaultsquadid`) REFERENCES `assaultsquads` (`id`);

--
-- Constraints for table `sergeants_equipments`
--
ALTER TABLE `sergeants_equipments`
  ADD CONSTRAINT `sergeants_equipments_ibfk_1` FOREIGN KEY (`sergeantid`) REFERENCES `sergeants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sergeants_equipments_ibfk_2` FOREIGN KEY (`equipmentid`) REFERENCES `equipments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `spacemarines`
--
ALTER TABLE `spacemarines`
  ADD CONSTRAINT `spacemarines_ibfk_1` FOREIGN KEY (`assaultsquadid`) REFERENCES `assaultsquads` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
