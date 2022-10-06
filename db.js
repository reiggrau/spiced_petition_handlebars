// SETUP
require("dotenv").config(); // Loads all variables in .env and adds them to process.env

const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

// FUNCTIONS

// Users
function createRepresentative(first_name, last_name, email, password, image_url, quote) {
    const sql = `
    INSERT INTO representatives (first_name, last_name, email, password, image_url, quote)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `;
    return db
        .query(sql, [first_name, last_name, email, password, image_url, quote]) // correct way to add data to sql
        .then((result) => result.rows)
        .catch((error) => console.log("Error in createRepresentative:", error));
}

function getRepresentative(email) {
    const sql = `
    SELECT * FROM representatives WHERE email = $1;
    `;
    return db
        .query(sql, [email])
        .then((result) => result.rows)
        .catch((error) => console.log("Error in getRepresentative:", error));
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

function countRepresentatives() {}

// Petitions
function createPetition(user_id, petition, signature_url) {
    const sql = `
    INSERT INTO petitions (user_id, petition, signature_url)
    VALUES ($1, $2, $3)
    RETURNING *;
    `;
    return db
        .query(sql, [user_id, petition, signature_url])
        .then((result) => result.rows)
        .catch((error) => console.log("Error in createPetition:", error));
}

function countPetitions(value) {
    return;
}

function getPetition(userId) {
    const sql = `
    SELECT * FROM petitions WHERE id = $1;
    `;
    return db
        .query(sql, [userId])
        .then((result) => result.rows)
        .catch((error) => console.log("Error in getSignature:", error));
}

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

// EXPORTS
module.exports = {
    createRepresentative,
    getRepresentative,
    getAllRepresentatives,
    countRepresentatives,
    createPetition,
    getPetition,
    getAllPetitions,
    countPetitions,
};
