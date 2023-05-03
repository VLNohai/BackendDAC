const {Client} = require('pg');

const client = new Client({
    host : "database-2.cnhef5ed68jq.eu-north-1.rds.amazonaws.com",
    user : "postgres",
    port : 5432,

    password : "conaiv2001",
    database : "damdatabase"
})

client.connect();

module.exports = client;

