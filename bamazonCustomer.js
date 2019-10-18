var fs = require("fs");
var inquirer = require('inquirer');

var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "1234",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    checkStock();
});

var stockTemp = {};

function checkStock() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "id",
                message: "Input product ID.",
            }
        ])
        .then(function (Response) {

            var query = connection.query(
                `SELECT * 
                FROM product
                where item_id = "${Response.id}"
                `,
                function (err, res) {
                    if (err) throw err;
                    stockTemp = res;
                console.log(res);
                placeOrder();

                }
            );
        });
};


function placeOrder() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "quantity",
                message: "Input order quantity.",
            }
        ])
        .then(function (Response) {

            if(Response.quantity > stockTemp[0].stock_quantity) {
                console.log(`Only ${stockTemp[0].stock_quantity} available, input a smaller quantity.`);
                placeOrder()
            } else {
                
            var stockLeft = stockTemp[0].stock_quantity - Response.quantity;
            var orderCost = Response.quantity * stockTemp[0].price;

                var query = connection.query(
                    `
                    UPDATE product 
                    SET stock_quantity = "${stockLeft}" 
                    WHERE item_id = "${stockTemp[0].item_id}"   
                    `,
                    function (err, res) {
                        if (err) throw err;
                    console.log(`Order placed. Total price is $${orderCost}. @ $${stockTemp[0].price} per item.`);
                    checkStock()
                    }
                );
            }

        });
};