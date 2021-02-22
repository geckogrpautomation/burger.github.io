CREATE SCHEMA `burger_db` ;

CREATE TABLE `burger_db`.`subburger` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `burger` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `burger_db`.`devburger` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `burger` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`));


  CREATE TABLE `burger_db`.`token` (  
  `token` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`token`));
