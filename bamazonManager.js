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
    operation();
});


function operation() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "command",
                message: "-- What would you like to do? --",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Add Sale", "View Product Sales by Department"]
            },
        ])
        .then(function (Response) {

            switch (Response.command) {
                case
                    "View Products for Sale": viewSale();
                    break;
                case
                    "View Low Inventory": viewLowInventory();
                    break;
                case
                    "Add to Inventory": addInventory();
                    break;
                case
                    "Add New Product": addProduct();
                    break;
                case
                    "Add Sale": addSale();
                    break;
                case
                    "View Product Sales by Department": viewSalesDep();
                    break;
                    
                case
                    "Create a department": viewSalesDep();
                    break;
                    
                    
            }
        }
        );
};

var saleBasket = [];
var saleID = 8;

function addSale() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "stock_id",
                message: "What stock_id sold?"
            },
            {
                type: "input",
                name: "add_quantity",
                message: "Quantity sold?"
            },
            {
                type: "input",
                name: "discount",
                message: "How much discount applied?"
            },
            {
                type: "list",
                name: "addmore",
                message: "Add more to basket?",
                choices: ["Yes", "No"]
            },            
        ])
        .then(function (Response) {
            
            saleBasket.push(Response);
            
            if(Response.addmore == "Yes") {
                addSale();
            } else {
            
            saleBasket.forEach(function(element){
                connection.query(
                    `
                    insert into sales (sale_id, item_id, sale_date, quantity, discount_applied)
                    values (${saleID},${element.stock_id},CURDATE(),${element.add_quantity},${element.discount});

                    

                    update product 
                    set stock_quantity = stock_quantity - 1
                    where item_id = ${element.stock_id}
                    `
                                ,
                                function (err, res) {
                                    if (err) throw err;
                                    console.log(
                `-------------------------
                Sale Recorded.
                -------------------------`)
                                });
            });
            saleID++;


                   
            }


        });
}

function viewSale() {

    connection.query(
        `
    Select *
    From product
    `
        ,
        function (err, res) {
            if (err) throw err;

            res.forEach(function (element) {
                console.log
                    (`
    Product_name: ${element.product_name} 
    Department: ${element.department_name}
    Price: ${element.price}
    Quantity: ${element.stock_quantity}
    Item_id: ${element.item_id}
    -------------------------`)
            });
            setTimeout (operation, 4000);
        }
    )
};

function viewLowInventory() {

    connection.query(
        `
        SELECT * 
        FROM bamazon.product
        Where stock_quantity <=1
        Order by stock_quantity 
    `
        ,
        function (err, res) {
            if (err) throw err;

            res.forEach(function (element) {
                console.log
                    (`-------------------------
    QUANTITY: ${element.stock_quantity}
    Product_name: ${element.product_name} 
    Department: ${element.department_name}
    Price: ${element.price}
    Item_id: ${element.item_id}`)
            });
            setTimeout (operation, 1000);
        }
    )
}

function addInventory() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "stock_id",
                message: "What is the stock ID you would like to add?"
            },
            {
                type: "input",
                name: "add_quantity",
                message: "Quantity you would like to add?"
            },
        ])
        .then(function (Response) {

            connection.query(
                `
        update product
        set stock_quantity = stock_quantity + ${Response.add_quantity}
        where item_id = ${Response.stock_id}
    `
                ,
                function (err, res) {
                    if (err) throw err;
                    console.log(
                        `-------------------------
Product updated.
-------------------------`)
                });
                setTimeout (operation, 1000)
        });

};

function addProduct() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "product_name",
                message: "What is the product name?"
            },
            {
                type: "list",
                name: "department",
                message: "What would you the department?",
                choices: ["tech", "cloth"]
            },
            {
                type: "input",
                name: "price",
                message: "What is the product price?"
            },
            {
                type: "input",
                name: "quantity",
                message: "What is the stock quantity?"
            },

        ])
        .then(function (Response) {
             connection.query(
                ` insert into product (product_name, department_name, price, stock_quantity)
                values("${Response.product_name}","${Response.department}",${Response.price},${Response.quantity})  `
                ,
                function (err, res) {
                    if (err) throw err;
                    console.log(
`-------------------------
Product Added.
-------------------------`)
                });
                setTimeout (operation, 1000)

        });
        
};

function viewSalesDep() {

    connection.query(
        // SP not work - call sp_sale_by_department()
        // View OK - select * from vw_sale_by_department
        ` select * from vw_sale_by_department`
        ,
        function (err, res) {
            if (err) throw err;
            
            // console.log(res);
            console.log(
                `Dep ID | Dep Name | Total Overhead |Total Sales | Total Profit`)
            
            res.forEach(function(element){
                console.log(
                    `${element.depID}         ${element.DepName}          $${element.total_overhead}         $${element.total_sales}      $${element.total_profit}`
                );
            })
             
        }
    )
    setTimeout (operation, 1000)
}