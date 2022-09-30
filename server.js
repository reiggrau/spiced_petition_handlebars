const { application } = require("express");
const db = require("./db");

db.getAllCities().then((rows) => {
    console.log("Cities:", rows);
});

// ...

// Petition page
app.get("/", (req, res) => {
    // if user has not signed:
    //      render the petition page with the form
    // else
    //      redirect to thank-you page
});

// Submit
app.post("/", (req, res) => {
    // Check if the input is correct: first_name, last_name, signature
    //      STORE in database
    //      SET a cookie
    //      redirect to thank-you page
    // Else display error message
    //      where is the error?
    //      show the form again with error message
});

// Thank you page
app.get("/thank-you", (req, res) => {
    // If user has signed
    //      Get data from db
    //      show info: thank you for signing + how many people has signed
    // else
    //      redirect to petition page
});

app.get("/signatures", (req, res) => {
    // if user has signed
    //      Get data from db
    //
});

// EXAMPLE

db.createCity();
