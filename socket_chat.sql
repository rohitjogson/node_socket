-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Feb 25, 2018 at 07:39 PM
-- Server version: 10.1.13-MariaDB
-- PHP Version: 5.6.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `socket_chat`
--

-- --------------------------------------------------------

--
-- Table structure for table `chat`
--

CREATE TABLE `chat` (
  `id` varchar(100) NOT NULL,
  `sender` varchar(100) NOT NULL,
  `receiver` varchar(100) NOT NULL,
  `massge` varchar(100) NOT NULL,
  `time` varchar(100) NOT NULL,
  `date` varchar(100) NOT NULL,
  `datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `chat`
--

INSERT INTO `chat` (`id`, `sender`, `receiver`, `massge`, `time`, `date`, `datetime`) VALUES
('7a05bdd5adfe71328175105bc138836a', '50dae4da3ddbfece5645a4238b1517dd', '50dae4da3ddbfece5645a4238b1517dd', 'hey', '11:05 AM', '25/1/2018', '2018-02-25 05:36:43'),
('7a05bdd5adfe71328175105bc138836a', '50dae4da3ddbfece5645a4238b1517dd', '50dae4da3ddbfece5645a4238b1517dd', 'hii', '11:07 AM', '25/1/2018', '2018-02-25 05:37:08'),
('94dbe2575d073999956c38753d8bcbef', 'a59f491aac2eb6962a8ed804072d9592', '4fba0847be33303e9014e979b7573822', 'hhh', '11:17 AM', '25/1/2018', '2018-02-25 05:47:10'),
('94dbe2575d073999956c38753d8bcbef', 'a59f491aac2eb6962a8ed804072d9592', '4fba0847be33303e9014e979b7573822', 'hhh', '11:17 AM', '25/1/2018', '2018-02-25 05:47:17'),
('7a05bdd5adfe71328175105bc138836a', 'a59f491aac2eb6962a8ed804072d9592', 'a59f491aac2eb6962a8ed804072d9592', 'hello', '11:17 AM', '25/1/2018', '2018-02-25 05:47:48'),
('7a05bdd5adfe71328175105bc138836a', 'a59f491aac2eb6962a8ed804072d9592', 'a59f491aac2eb6962a8ed804072d9592', 'hii', '11:18 AM', '25/1/2018', '2018-02-25 05:48:01'),
('a2444e25a8e1e5a8a594c1c12fe10b65', '50dae4da3ddbfece5645a4238b1517dd', 'a59f491aac2eb6962a8ed804072d9592', 'hooo', '11:18 AM', '25/1/2018', '2018-02-25 05:48:30'),
('a2444e25a8e1e5a8a594c1c12fe10b65', '50dae4da3ddbfece5645a4238b1517dd', 'a59f491aac2eb6962a8ed804072d9592', 'hhhhhhh', '11:18 AM', '25/1/2018', '2018-02-25 05:48:56'),
('94dbe2575d073999956c38753d8bcbef', 'a59f491aac2eb6962a8ed804072d9592', '4fba0847be33303e9014e979b7573822', 'hhhhhhhhhhhhhh', '11:22 AM', '25/1/2018', '2018-02-25 05:52:41'),
('94dbe2575d073999956c38753d8bcbef', 'a59f491aac2eb6962a8ed804072d9592', '4fba0847be33303e9014e979b7573822', 'hhhhhhhhhhhhhh', '11:22 AM', '25/1/2018', '2018-02-25 05:52:41'),
('94dbe2575d073999956c38753d8bcbef', 'a59f491aac2eb6962a8ed804072d9592', '4fba0847be33303e9014e979b7573822', 'hhhhhhhhhhhhhh', '11:22 AM', '25/1/2018', '2018-02-25 05:52:41');

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` varchar(100) NOT NULL,
  `admin` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`id`, `admin`, `name`, `status`) VALUES
('60993bc8aebd67e67fd3f315ba388c35', 'a59f491aac2eb6962a8ed804072d9592', 'lll', 'pub'),
('7a05bdd5adfe71328175105bc138836a', '50dae4da3ddbfece5645a4238b1517dd', 'hello', 'pub'),
('94dbe2575d073999956c38753d8bcbef', '4fba0847be33303e9014e979b7573822', 'Public Group', 'pub');

-- --------------------------------------------------------

--
-- Table structure for table `participents`
--

CREATE TABLE `participents` (
  `groupid` varchar(100) NOT NULL,
  `userid` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `participents`
--

INSERT INTO `participents` (`groupid`, `userid`) VALUES
('60993bc8aebd67e67fd3f315ba388c35', '2f0ed294b1e6f7ad6c7846e6729ea19d'),
('60993bc8aebd67e67fd3f315ba388c35', '6084770247ac6da5f96b28303ccd5830'),
('60993bc8aebd67e67fd3f315ba388c35', 'a59f491aac2eb6962a8ed804072d9592'),
('7a05bdd5adfe71328175105bc138836a', '50dae4da3ddbfece5645a4238b1517dd'),
('7a05bdd5adfe71328175105bc138836a', '6084770247ac6da5f96b28303ccd5830');

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE `room` (
  `id` varchar(100) NOT NULL,
  `sender` varchar(100) NOT NULL,
  `receiver` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `room`
--

INSERT INTO `room` (`id`, `sender`, `receiver`) VALUES
('60993bc8aebd67e67fd3f315ba388c35', 'a59f491aac2eb6962a8ed804072d9592', 'a59f491aac2eb6962a8ed804072d9592'),
('7a05bdd5adfe71328175105bc138836a', '50dae4da3ddbfece5645a4238b1517dd', '50dae4da3ddbfece5645a4238b1517dd'),
('94dbe2575d073999956c38753d8bcbef', '4fba0847be33303e9014e979b7573822', '4fba0847be33303e9014e979b7573822'),
('a2444e25a8e1e5a8a594c1c12fe10b65', '50dae4da3ddbfece5645a4238b1517dd', 'a59f491aac2eb6962a8ed804072d9592');

-- --------------------------------------------------------

--
-- Table structure for table `userclick`
--

CREATE TABLE `userclick` (
  `id` int(10) NOT NULL,
  `roomid` varchar(100) NOT NULL,
  `userid` varchar(100) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `userclick`
--

INSERT INTO `userclick` (`id`, `roomid`, `userid`, `time`) VALUES
(0, '7a05bdd5adfe71328175105bc138836a', '50dae4da3ddbfece5645a4238b1517dd', '2018-02-25 05:48:24'),
(0, '7a05bdd5adfe71328175105bc138836a', '29dd1d25fdc0c520cef8b5a4db73a5af', '2018-02-25 05:38:15'),
(0, '94dbe2575d073999956c38753d8bcbef', '29dd1d25fdc0c520cef8b5a4db73a5af', '2018-02-25 05:38:29'),
(0, '7a05bdd5adfe71328175105bc138836a', 'a59f491aac2eb6962a8ed804072d9592', '2018-02-25 05:52:29'),
(0, 'a2444e25a8e1e5a8a594c1c12fe10b65', '50dae4da3ddbfece5645a4238b1517dd', '2018-02-25 05:48:56'),
(0, 'a2444e25a8e1e5a8a594c1c12fe10b65', 'a59f491aac2eb6962a8ed804072d9592', '2018-02-25 06:16:53'),
(0, '94dbe2575d073999956c38753d8bcbef', 'a59f491aac2eb6962a8ed804072d9592', '2018-02-25 05:52:33'),
(0, '60993bc8aebd67e67fd3f315ba388c35', '2f0ed294b1e6f7ad6c7846e6729ea19d', '2018-02-25 06:18:16'),
(0, '60993bc8aebd67e67fd3f315ba388c35', '50dae4da3ddbfece5645a4238b1517dd', '2018-02-25 06:18:16'),
(0, '60993bc8aebd67e67fd3f315ba388c35', '6084770247ac6da5f96b28303ccd5830', '2018-02-25 06:18:16'),
(0, '60993bc8aebd67e67fd3f315ba388c35', 'a59f491aac2eb6962a8ed804072d9592', '2018-02-25 06:18:20');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `active` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password`, `active`) VALUES
('0e36961b1b67a17fadac2db780dc5262', 'rohitjogson500@gmail.com', 'admin', 'rohit', 0),
('2f0ed294b1e6f7ad6c7846e6729ea19d', 'daiay.siddharth@gmail.com', 'Daiya siddharth', 'Ashoka@sog1', 0),
('4fba0847be33303e9014e979b7573822', 'admin@rohit.com', 'admin', 'rohit', 0),
('50dae4da3ddbfece5645a4238b1517dd', 'rohitjogson@gmail.com', 'rohit jogson', 'rohit', 1),
('6084770247ac6da5f96b28303ccd5830', 'manoj@123.com', 'manoj kumar', 'manoj', 1),
('a59f491aac2eb6962a8ed804072d9592', 'rohit@123.com', 'rohit jogsan', 'rohit', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `chat`
--
ALTER TABLE `chat`
  ADD KEY `id` (`id`),
  ADD KEY `sender` (`sender`),
  ADD KEY `receiver` (`receiver`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin` (`admin`);

--
-- Indexes for table `participents`
--
ALTER TABLE `participents`
  ADD KEY `groupid` (`groupid`,`userid`);

--
-- Indexes for table `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender` (`sender`),
  ADD KEY `receiver` (`receiver`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chat`
--
ALTER TABLE `chat`
  ADD CONSTRAINT `chat_ibfk_1` FOREIGN KEY (`id`) REFERENCES `room` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chat_ibfk_2` FOREIGN KEY (`sender`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chat_ibfk_3` FOREIGN KEY (`receiver`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`admin`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `participents`
--
ALTER TABLE `participents`
  ADD CONSTRAINT `participents_ibfk_1` FOREIGN KEY (`groupid`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `room`
--
ALTER TABLE `room`
  ADD CONSTRAINT `room_ibfk_1` FOREIGN KEY (`sender`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `room_ibfk_2` FOREIGN KEY (`receiver`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
