split up components using require.js

finish setting up DAVE https://github.com/evantahler/PHP-DAVE-API


delimiter $$

CREATE DATABASE `wordtoth_a2b` /*!40100 DEFAULT CHARACTER SET utf8 */$$

delimiter $$

CREATE TABLE `task` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `parentTaskId` int(10) unsigned DEFAULT NULL,
  `label` varchar(45) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `start` int(10) unsigned DEFAULT NULL,
  `end` int(10) unsigned DEFAULT NULL,
  `duration` int(10) unsigned DEFAULT NULL,
  `inProgress` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8$$

