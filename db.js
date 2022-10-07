// SETUP
require("dotenv").config(); // Loads all variables in .env and adds them to process.env

const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

// FUNCTIONS

// Users
function createRepresentative(first_name, last_name, email, password) {
    const sql = `
    INSERT INTO representatives (first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
    `;
    return db
        .query(sql, [first_name, last_name, email, password]) // correct way to add data to sql
        .then((result) => result.rows)
        .catch((error) => console.log("Error in createRepresentative:", error));
}

function editRepresentative(first_name, last_name, email, password, image_url, quote, party, id) {
    const sql = `
    UPDATE representatives SET first_name = $1, last_name = $2, email = $3, password = $4, image_url = $5, quote = $6, party = $7
    WHERE id = $8
    RETURNING *;
    `;
    return db
        .query(sql, [first_name, last_name, email, password, image_url, quote, party, id]) // correct way to add data to sql
        .then((result) => result.rows)
        .catch((error) => console.log("Error in editRepresentative:", error));
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
    const sql = `
    SELECT * FROM representatives
    ORDER BY id ASC
    ;`;
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

function countPetitions() {
    const sql = `
    SELECT COUNT(*) FROM petitions
    ;`;
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
    const sql = `
    SELECT * FROM petitions
    JOIN representatives
    ON petitions.user_id = representatives.id
    ORDER BY petitions.id DESC
    `;
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

// function getAllPetitions() {
//     const sql = "SELECT * FROM petitions;";
//     return db
//         .query(sql)
//         .then((results) => {
//             return results.rows;
//         })
//         .catch((error) => {
//             console.log("error in getAllPetitions:", error);
//             return error;
//         });
// }

function getAllPetitionsByGroup(group) {
    sql = `

    `;
}

// getAllUserInfo
// SELECT join users + profiles
// firstname, lastname, email
// age, city, url

// EXPORTS
module.exports = {
    createRepresentative,
    editRepresentative,
    getRepresentative,
    getAllRepresentatives,
    countRepresentatives,
    createPetition,
    getPetition,
    getAllPetitions,
    countPetitions,
};
