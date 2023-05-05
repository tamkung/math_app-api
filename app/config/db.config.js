const mysql = require('mysql2');
require('dotenv').config();

const db_config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME,
};
connection = mysql.createPool(db_config);

connection.getConnection(function (err) {
    if (err) {
        console.log("Cannot establish a connection with the database.");
        connection = reconnect(connection);
    } else {
        console.log("Connection database successful!");
    }
});

function reconnect(connection) {
    console.log("\n New connection tentative...");
    connection = mysql.createPool(db_config);
    connection.getConnection(function (err) {
        if (err) {
            setTimeout(reconnect(connection), 2000);
        } else {
            console.log("New connection established with the database.");
            return connection;
        }
    });
}

connection.on("error", function (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
        console.log("/!\\ Cannot establish a connection with the database. /!\\ (" + err.code + ")");
        return reconnect(connection);
    } else if (err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT") {
        console.log("/!\\ Cannot establish a connection with the database. /!\\ (" + err.code + ")");
        return reconnect(connection);
    } else if (err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
        console.log("/!\\ Cannot establish a connection with the database. /!\\ (" + err.code + ")");
        return reconnect(connection);
    } else if (err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE") {
        console.log("/!\\ Cannot establish a connection with the database. /!\\ (" + err.code + ")");
    } else {
        console.log("/!\\ Cannot establish a connection with the database. /!\\ (" + err.code + ")");
        return reconnect(connection);
    }
});

module.exports = connection;