var fs = require("fs");
var inquirer = require('inquirer');

var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "1234",
    database: "topsongdb"
});

connection.connect(function (err) {
    if (err) throw err;
    runSearch();
});

function runSearch() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "action",
                message: "What would you like to do?",
                choices: ["Find songs by artist",
                    "Find all artist who appear more than once",
                    "Find data within a specific range",
                    "Search for a specific song.",
                    "exit"
                ]
            },
        ])
        .then(function (inquirerResponse) {

            switch (inquirerResponse.action) {
                case "Find songs by artist": findArtist();
                    break;
                case "Find all artist who appear more than once": artistMoreOnce();
                    break;
                case "Find data within a specific range": dataRange();
                    break;
            };

        });
};

function findArtist() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "artistName",
                message: "What is the artist name?",
            }
        ])
        .then(function (inquirerResponse) {

            console.log(inquirerResponse.artistName)
            var query = connection.query(
                `SELECT * 
                FROM topsongdb.top5000
                where artist = "${inquirerResponse.artistName}"
            `,
                function (err, res) {
                    if (err) throw err;

                    res.forEach(function (element, i) {
                        console.log(i, element.song)
                    })
                }
            );
        });
};

function artistMoreOnce() {

    var query = connection.query(
        `
                SELECT artist,
                        count(artist) as total
                FROM topsongdb.top5000
                Group by artist
                Having total > 1
            `,
        function (err, res) {
            if (err) throw err;
            res.forEach(function (element, i) {
                console.log(i, element.artist)
            })
        }
    );
};


function dataRange() {
    inquirer
        .prompt([
            {
                type: "input",
                name: "from",
                message: "What year you want to search from?",
            },
            {
                type: "input",
                name: "to",
                message: "What year you want to search to?",
            }
        ])
        .then(function (inquirerResponse) {
            console.log(inquirerResponse.from, inquirerResponse.to)
            var query = connection.query(
                `SELECT * 
            FROM topsongdb.top5000
            where year >= "${inquirerResponse.from}"
                            AND
                year >= "${inquirerResponse.to}"          
        `,
                function (err, res) {
                    if (err) throw err;
                    res.forEach(function (element) {
                        console.log(element.artist)
                    })

                });
        });
};



