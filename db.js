// SETUP
require("dotenv").config(); // Loads all variables in .env and adds them to process.env

const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

// FUNCTIONS
function getAllPetitions() {
    const sql = "SELECT * FROM petitions;";
    return db
        .query(sql)
        .then((results) => {
            return results.rows;
        })
        .catch((error) => {
            console.log("error in getAllPetitions:", error);
            return error;
        });
}

function getAllRepresentatives() {
    const sql = "SELECT * FROM representatives;";
    return db
        .query(sql)
        .then((results) => {
            return results.rows;
        })
        .catch((error) => {
            console.log("error in getAllRepresentatives:", error);
            return error;
        });
}

function createPetition(first_name, last_name, petition) {
    const sql = `
    INSERT INTO petitions (first_name, last_name, petition)
    VALUES ($1, $2, $3)
    RETURNING *;
    `;
    return db
        .query(sql, [first_name, last_name, petition])
        .then((result) => result.rows)
        .catch((error) => console.log("Error in createPetition:", error));
}

function createRepresentative(first_name, last_name, image_url, quote) {
    const sql = `
    INSERT INTO representatives (first_name, last_name, image_url, quote)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `; // Avoid interpolation "${}" to prevent code insertion
    return db
        .query(sql, [first_name, last_name, image_url, quote]) // correct way to add data to sql
        .then((result) => result.rows)
        .catch((error) => console.log("Error in createRepresentative:", error));
}

// EXPORTS
module.exports = {
    getAllPetitions,
    getAllRepresentatives,
    createPetition,
    createRepresentative,
};
