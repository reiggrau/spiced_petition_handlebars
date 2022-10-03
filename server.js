// SETUP
const PORT = 8000; //Set the port to be used

const path = require("path"); // Require 'path'

const express = require("express"); // require express

const app = express(); // create a new instance of express

// Handlebars setup
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// Database
const db = require("./db");

db.getAllSignatures().then((rows) => {
    console.log("Checkpoint 1:", rows);
});
// ...

// STATIC

app.use(express.static(path.join(__dirname, "public")));

// MIDDLEWARES

app.use(express.urlencoded({ extended: false }));

// BODY
// Petition page (main page)
app.get("/", (req, res) => {
    res.render("welcome", {
        title: "Petition",
    });
});

// Petition page
app.get("/petitions", (req, res) => {
    res.render("petitions", {
        title: "Petition",
    });
});

app.post("/petitions", (req, res) => {
    // Check if the input is correct: first_name, last_name, signature
    //      STORE in database
    //      SET a cookie
    //      redirect to thank-you page
    // Else display error message
    //      where is the error?
    //      show the form again with error message
    console.log("Checkpoint 2. req.body:", req.body);

    db.createSignature(req.body.first_name, req.body.last_name, req.body.quote)
        .then((result) => {
            console.log("Checpoint 3.");
            db.getAllSignatures().then((rows) => {
                console.log("Representatives:", rows);
            });
            res.redirect("/");
        })
        .catch((err) => {
            console.log("err: ", err);
        });
});

app.get("/representatives", (req, res) => {
    res.render("representatives", {
        title: "Petition",
    });
});

app.get("/votenow", (req, res) => {
    res.render("votenow", {
        title: "Petition",
    });
});

// app.get("/", (req, res) => {
//     // if user has not signed:
//     //      render the petition page with the form
//     // else
//     //      redirect to thank-you page
// });

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

// db.createCity();

// INITIALIZATION
app.listen(PORT, () => {
    console.log(`Checkpoint 0: Listening on port: ${PORT}`);
});
