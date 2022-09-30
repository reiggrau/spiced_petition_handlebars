require("dotenv").config(); // Loads all variables in .env and adds them to process.env

const spicedPg = require("spiced-pg");
const DATABASE_URL = process.env.DATABASE_URL;
const db = spicedPg(DATABASE_URL);

function getAllCities() {
    const sql = "SELECT * FROM cities;";
    return db
        .query(sql)
        .then((results) => {
            return results.rows;
        })
        .catch((error) => {
            console.log("error in getAllCities:", error);
        });
}

function createCity(name, country, population) {
    const sql = `
    INSERT INTO cities (name, country, population)
    VALUES ($1, $2, $3)
    RETURNING *;
    `; // Avoid interpolation "${}" to prevent code insertion
    return db
        .query(sql, [name, country, population]) // correct way to add data to sql
        .then((result) => result.rows)
        .cath((error) => console.log("error in createCity:", error));
}

module.exports = {
    getAllCities,
    createCity,
};
