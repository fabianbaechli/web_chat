CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `full_name` text NOT NULL,
  `user_name` text NOT NULL,
  `email` mediumtext NOT NULL,
  `password` mediumtext NOT NULL,
  `image_path` mediumtext,
  `online` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;

CREATE TABLE `chat_room` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `max_participants` int(11) NOT NULL,
  `admin` int(11) unsigned NOT NULL,
  `password` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `admin` (`admin`),
  CONSTRAINT `chat_room_ibfk_1` FOREIGN KEY (`admin`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `users_chatrooms` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_fk` int(11) unsigned NOT NULL,
  `chat_room_fk` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_fk` (`user_fk`),
  KEY `chat_room_fk` (`chat_room_fk`),
  CONSTRAINT `users_chatrooms_ibfk_1` FOREIGN KEY (`user_fk`) REFERENCES `users` (`id`),
  CONSTRAINT `users_chatrooms_ibfk_2` FOREIGN KEY (`chat_room_fk`) REFERENCES `chat_room` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;