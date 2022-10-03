// SETUP
require("dotenv").config(); // Loads all variables in .env and adds them to process.env

const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

// FUNCTIONS
function getAllSignatures() {
    const sql = "SELECT * FROM signatures;";
    return db
        .query(sql)
        .then((results) => {
            return results.rows;
        })
        .catch((error) => {
            console.log("error in getAllSignatures:", error);
        });
}

function createSignature(first_name, last_name, quote) {
    const sql = `
    INSERT INTO signatures (first_name, last_name, quote)
    VALUES ($1, $2, $3)
    RETURNING *;
    `; // Avoid interpolation "${}" to prevent code insertion
    return db
        .query(sql, [first_name, last_name, quote]) // correct way to add data to sql
        .then((result) => result.rows)
        .cath((error) => console.log("Error in createSignature:", error));
}

// EXPORTS
module.exports = {
    getAllSignatures,
    createSignature,
};
