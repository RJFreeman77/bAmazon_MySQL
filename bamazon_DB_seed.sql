DROP DATABASE if EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

DROP TABLE IF EXISTS products;

CREATE TABLE products (
	 item_id INT NOT NULL Auto_INCREMENT PRIMARY KEY
    , product_name VARCHAR(50) NOT NULL
    , department_name VARCHAR(50)
    , unit_cost DECIMAL (10,2) NOT NULL
    , price DECIMAL (10,2) NOT NULL
    , stock_quantity INT NOT NULL
    , items_sold INT
    );