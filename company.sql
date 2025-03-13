-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Mar 05, 2025 at 09:45 AM
-- Server version: 9.2.0
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `company`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`%` PROCEDURE `get_users` ()   BEGIN
  SELECT * FROM users;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `get_users_by_name` (IN `name` VARCHAR(20), IN `lastname` VARCHAR(20))   BEGIN
  SELECT * FROM users WHERE user_name = name AND user_lastname = lastname;
END$$

CREATE DEFINER=`root`@`%` PROCEDURE `show_all_users_p` ()   BEGIN
  SELECT * FROM show_all_users;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Stand-in structure for view `get_users_with_phones`
-- (See below for the actual view)
--
CREATE TABLE `get_users_with_phones` (
`phones` text
,`user_name` varchar(20)
,`user_pk` bigint unsigned
);

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `item_pk` bigint UNSIGNED NOT NULL,
  `item_title` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `item_price` smallint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`item_pk`, `item_title`, `item_price`) VALUES
(1, 'Shirt', 200),
(2, 'Shoes', 700);

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `post_pk` bigint UNSIGNED NOT NULL,
  `post_data` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`post_pk`, `post_data`) VALUES
(1, 'Post from A'),
(2, 'Post from B');

-- --------------------------------------------------------

--
-- Stand-in structure for view `show_all_users`
-- (See below for the actual view)
--
CREATE TABLE `show_all_users` (
);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_pk` bigint UNSIGNED NOT NULL,
  `user_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_last_name` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_username` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_created_at` bigint UNSIGNED DEFAULT '0',
  `user_verification_key` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `user_verified_at` bigint UNSIGNED DEFAULT '0',
  `user_updated_at` bigint UNSIGNED NOT NULL DEFAULT '0',
  `user_deleted_at` bigint UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_pk`, `user_name`, `user_last_name`, `user_email`, `user_username`, `user_password`, `user_created_at`, `user_verification_key`, `user_verified_at`, `user_updated_at`, `user_deleted_at`) VALUES
(57, 'John', 'Hummel', 'johnh@gmail.com', 'JohnH', 'scrypt:32768:8:1$WohZS3fmXGNZhCmd$9181d2d131ab324edbb9ad25c1c336f627da3f6dbd9e1005e7fed3a0931fb670311e2e0363ba76f50988e0d1faac7c38f1633572debd6ec78bde64efcbab9108', 1741162969, NULL, 1741162997, 20250305082317, 0),
(58, 'Jong', 'Hals', 'Hls@hals.com', 'JohnDOe', 'scrypt:32768:8:1$O773eRvNnqRYCZSd$8f7012013e2442539d17c4aac102fe2dc0568eec7393b81d03725516d107d6d6d4c73910a132d6fbad7ad4329b6ef30937bab75252bfea1dcf14bacac3f91c88', 1741167828, '9e83db85-518f-4de1-abcd-cdd154d0a47f', 1741167852, 20250305094412, 0);

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `update_user` BEFORE UPDATE ON `users` FOR EACH ROW SET NEW.user_updated_at = NOW()
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users_phones`
--

CREATE TABLE `users_phones` (
  `user_fk` bigint UNSIGNED NOT NULL,
  `user_phone` char(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users__posts`
--

CREATE TABLE `users__posts` (
  `user_fk` bigint UNSIGNED NOT NULL,
  `post_fk` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`item_pk`),
  ADD UNIQUE KEY `item_pk` (`item_pk`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`post_pk`),
  ADD UNIQUE KEY `post_pk` (`post_pk`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_pk`),
  ADD UNIQUE KEY `user_pk` (`user_pk`),
  ADD UNIQUE KEY `user_pk_2` (`user_pk`),
  ADD UNIQUE KEY `user_email` (`user_email`),
  ADD UNIQUE KEY `user_username` (`user_username`);

--
-- Indexes for table `users_phones`
--
ALTER TABLE `users_phones`
  ADD PRIMARY KEY (`user_fk`,`user_phone`);

--
-- Indexes for table `users__posts`
--
ALTER TABLE `users__posts`
  ADD PRIMARY KEY (`user_fk`,`post_fk`),
  ADD KEY `post_fk` (`post_fk`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `item_pk` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `post_pk` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_pk` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

-- --------------------------------------------------------

--
-- Structure for view `get_users_with_phones`
--
DROP TABLE IF EXISTS `get_users_with_phones`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `get_users_with_phones`  AS SELECT `u`.`user_pk` AS `user_pk`, `u`.`user_name` AS `user_name`, group_concat(`p`.`user_phone` order by `p`.`user_phone` ASC separator ',') AS `phones` FROM (`users` `u` left join `users_phones` `p` on((`u`.`user_pk` = `p`.`user_fk`))) GROUP BY `u`.`user_pk` ;

-- --------------------------------------------------------

--
-- Structure for view `show_all_users`
--
DROP TABLE IF EXISTS `show_all_users`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `show_all_users`  AS SELECT `users`.`user_pk` AS `user_pk`, `users`.`user_name` AS `user_name`, `users`.`user_lastname` AS `user_lastname`, `users`.`user_created_at` AS `user_created_at`, `users`.`user_updated_at` AS `user_updated_at`, `users`.`user_deleted_at` AS `user_deleted_at` FROM `users` ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `users_phones`
--
ALTER TABLE `users_phones`
  ADD CONSTRAINT `users_phones_ibfk_1` FOREIGN KEY (`user_fk`) REFERENCES `users` (`user_pk`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Constraints for table `users__posts`
--
ALTER TABLE `users__posts`
  ADD CONSTRAINT `users__posts_ibfk_1` FOREIGN KEY (`user_fk`) REFERENCES `users` (`user_pk`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `users__posts_ibfk_2` FOREIGN KEY (`post_fk`) REFERENCES `posts` (`post_pk`) ON DELETE CASCADE ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
