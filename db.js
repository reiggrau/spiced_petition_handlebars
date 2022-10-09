// SETUP
require("dotenv").config(); // Loads all variables in .env and adds them to process.env

const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

// FUNCTIONS

// REGISTER & LOGIN
function checkEmail(email) {
    const sql = `
    SELECT id, email
    FROM representatives
    WHERE email = $1
    ;`;
    return db
        .query(sql, [email])
        .then((result) => result.rows)
        .catch((error) => console.log("Error in checkEmail:", error));
}

function createRepresentative(first_name, last_name, email, password) {
    const sql = `
        INSERT INTO representatives (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, first_name, last_name, email, created_at
        ;`;
    return db
        .query(sql, [first_name, last_name, email, password]) // correct way to add data to sql
        .then((result) => result.rows)
        .catch((error) => console.log("Error in createRepresentative:", error));
}

function getRepresentative(email) {
    const sql = `
    SELECT representatives.id, first_name, last_name, email, password, created_at, image_url, quote, party
    FROM representatives LEFT OUTER JOIN profiles
    ON representatives.id = user_id
    WHERE email = $1
    ;`;
    return db
        .query(sql, [email])
        .then((result) => result.rows)
        .catch((error) => console.log("Error in getRepresentative:", error));
}

// PROFILE EDIT
function editRepresentative(id, first_name, last_name, email, password) {
    const sql = `
        UPDATE representatives SET first_name = $2, last_name = $3, email = $4, password = $5
    WHERE id = $1
    RETURNING id, first_name, last_name, email
    ;`;
    return db
        .query(sql, [id, first_name, last_name, email, password]) // correct way to add data to sql
        .then((result) => result.rows)
        .catch((error) => console.log("Error in editRepresentative:", error));
}

function editRepresentativeNoPassword(id, first_name, last_name, email) {
    const sql = `
    UPDATE representatives SET first_name = $2, last_name = $3, email = $4
    WHERE id = $1
    RETURNING id, first_name, last_name, email
    ;`;
    return db
        .query(sql, [id, first_name, last_name, email]) // correct way to add data to sql
        .then((result) => result.rows)
        .catch((error) => console.log("Error in editRepresentativeNoPassword:", error));
}

function editProfile(user_id, image_url, quote, party) {
    const sql = `
    INSERT INTO profiles (user_id, image_url, quote, party)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id) DO
    UPDATE SET image_url = $2, quote = $3, party = $4
    RETURNING image_url, quote, party
    ;`;
    return db
        .query(sql, [user_id, image_url, quote, party]) // correct way to add data to sql
        .then((result) => result.rows)
        .catch((error) => console.log("Error in editProfile", error));
}

// PETITIONS
function createPetition(user_id, title, petition, signature_url, topic) {
    const sql = `
    INSERT INTO petitions (user_id, title, petition, signature_url, topic)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    ;`;
    return db
        .query(sql, [user_id, title, petition, signature_url, topic])
        .then((result) => result.rows)
        .catch((error) => console.log("Error in createPetition:", error));
}

function deletePetition(id) {
    const sql = `
    DELETE * FROM petitions
    WHERE id = $1
    ;`;
    return db
        .query(sql, [id])
        .then((result) => result.rows)
        .catch((error) => console.log("Error in createPetition:", error));
}

// THANK YOU
function getLastPetition(userId) {
    const sql = `
    SELECT * FROM petitions
    LEFT OUTER JOIN representatives ON petitions.user_id = representatives.id
    LEFT OUTER JOIN profiles ON petitions.user_id = profiles.user_id
    WHERE petitions.user_id = $1
    ORDER BY petitions.id ASC
    ;`;
    return db
        .query(sql, [userId])
        .then((result) => result.rows)
        .catch((error) => console.log("Error in getLastPetition:", error));
}

function countPetitions() {
    const sql = `
    SELECT COUNT(*) FROM petitions
    ;`;
    return db
        .query(sql)
        .then((result) => result.rows)
        .catch((error) => console.log("Error in countPetitions:", error));
}

function countRepresentatives() {
    const sql = `
    SELECT COUNT(*) FROM representatives
    ;`;
    return db
        .query(sql)
        .then((result) => result.rows)
        .catch((error) => console.log("Error in countRepresentatives:", error));
}

// REPRESENTATIVES PAGE
function getAllRepresentatives() {
    const sql = `
    SELECT representatives.id, first_name, last_name, email, password, created_at, image_url, quote, party
    FROM representatives LEFT OUTER JOIN profiles
    ON representatives.id = user_id
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

// VOTE NOW PAGE
function getAllPetitions() {
    const sql = `
    SELECT * FROM petitions
    LEFT OUTER JOIN representatives ON petitions.user_id = representatives.id
    LEFT OUTER JOIN profiles ON petitions.user_id = profiles.user_id
    ORDER BY petitions.id DESC
    ;`;
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

function getAllPetitionsByTopic(topic) {
    sql = `

    `;
}

// deletePetition (userId)

// EXPORTS
module.exports = {
    checkEmail,
    createRepresentative,
    getRepresentative,
    editRepresentative,
    editRepresentativeNoPassword,
    editProfile,
    createPetition,
    deletePetition,
    getLastPetition,
    countPetitions,
    countRepresentatives,
    getAllPetitions,
    getAllPetitionsByTopic,
    getAllRepresentatives,
};
