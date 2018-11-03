require('dotenv').config()
const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const columnify = require("columnify");
const keys = require("./keys.js");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: keys.dbPassword.password,
    database: "bamazon_db"
});

connection.connect((err) => {
    if (err) throw err;

    displayStore();
});

function displayStore() {
    connection.query(
        `SELECT item_id AS "ID",
         product_name AS "Product",
         price AS "Price"
         FROM products`,
        (err, results) => {
            if (err) throw err;
            let columns = columnify(results);
            console.log(columns);
            inquirer
                .prompt([
                    {
                        name: "choice",
                        message: chalk.cyan("From the list above, please type the ID of the item you'd like to purchase."),
                        validate: function (value) {
                            if (isNaN(value) === false && parseInt(value) > 0 && value <= results.length + 1) {
                                return true;
                            }
                            console.log(chalk.red(`\nPlease enter a valid ID\n`));
                            return false;
                        }
                    }, {
                        name: "quantity",
                        message: chalk.cyan("How many of those items would you like?"),
                        validate: function (value) {
                            if (isNaN(value) === false && parseInt(value) > 0) {
                                return true;
                            }
                            console.log(chalk.red(`\nPlease enter a quantity\n`));
                            return false;
                        }
                    }
                ]).then((ans) => {
                    let productID = ans.choice;
                    let quantity = ans.quantity;

                    connection.query(
                        `SELECT * 
                        FROM products
                         WHERE item_id = ${productID}`,
                        (err, results) => {
                            if (err) throw err;
                            let dbQuantity = results[0].stock_quantity;
                            if (dbQuantity >= quantity) {
                                console.log(chalk.green("Congrats, you bought your thing!"));
                                updateDB(productID, dbQuantity, quantity);
                            } else {
                                console.log(chalk.red(`Opps, there are only ${dbQuantity} left.`));
                                stopOrGo();
                            }
                        }
                    );
                });
        }
    );
}

function updateDB(id, dbQuant, purchaseQuant) {
    let newDbQuant = dbQuant - purchaseQuant;
    connection.query(
        `UPDATE products 
        SET stock_quantity = ${newDbQuant},
        items_sold = ${purchaseQuant}
        WHERE item_id = ${id}`,
        (err) => {
            if (err) throw err;
            console.log(chalk.green("Your item(s) have been purchased and the database has been updated!"));
        }
    )
}

function stopOrGo() {
    inquirer
        .prompt([{
            name: "isContinuing",
            message: chalk.cyan("Would you like to keep shopping?"),
            type: "confirm"
        }]).then((ans) => {
            (ans.isContinuing) ? displayStore() : process.exit();
        });
}