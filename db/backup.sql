/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-12.3.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: first_db
-- ------------------------------------------------------
-- Server version	12.3.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `Matches`
--

DROP TABLE IF EXISTS `Matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `winner` int(11) DEFAULT NULL,
  `looser` int(11) DEFAULT NULL,
  `points` int(10) unsigned NOT NULL DEFAULT 150,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_winner` (`winner`),
  KEY `fk_looser` (`looser`),
  CONSTRAINT `fk_looser` FOREIGN KEY (`looser`) REFERENCES `Users` (`id`),
  CONSTRAINT `fk_winner` FOREIGN KEY (`winner`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Matches';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Matches`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Matches` WRITE;
/*!40000 ALTER TABLE `Matches` DISABLE KEYS */;
/*!40000 ALTER TABLE `Matches` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Queue`
--

DROP TABLE IF EXISTS `Queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user` (`user`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Queue';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Queue`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Queue` WRITE;
/*!40000 ALTER TABLE `Queue` DISABLE KEYS */;
/*!40000 ALTER TABLE `Queue` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Reports`
--

DROP TABLE IF EXISTS `Reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reported` int(11) NOT NULL,
  `source` int(11) NOT NULL,
  `type` varchar(10) NOT NULL,
  `messages` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_reported` (`reported`),
  KEY `fk_source` (`source`),
  CONSTRAINT `fk_reported` FOREIGN KEY (`reported`) REFERENCES `Users` (`id`),
  CONSTRAINT `fk_source` FOREIGN KEY (`source`) REFERENCES `Users` (`id`),
  CONSTRAINT `check_type` CHECK (`type` in ('messages','cheating'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reports';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reports`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Reports` WRITE;
/*!40000 ALTER TABLE `Reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `Reports` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(254) NOT NULL,
  `score` int(10) unsigned NOT NULL DEFAULT 0,
  `admin` tinyint(1) NOT NULL DEFAULT 0,
  `online` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `check_email_len` CHECK (char_length(`email`) >= 5),
  CONSTRAINT `check_username_len` CHECK (char_length(`username`) >= 3),
  CONSTRAINT `check_password_len` CHECK (char_length(`password`) >= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Users';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Dumping events for database 'first_db'
--

--
-- Dumping routines for database 'first_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-08-01 18:03:18
