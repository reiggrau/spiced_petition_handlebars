// SETUP
const PORT = 8000; //Set the port to be used
const path = require("path"); // Require 'path'
const express = require("express"); // require express
const app = express(); // create a new instance of express

const cookieSession = require("cookie-session");

// Handlebars setup
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

// Database
const db = require("./db");

// STATIC

app.use(express.static(path.join(__dirname, "public")));

// STARTUP

// db.getAllPetitions().then((rows) => {
//     console.log("Petitions:", rows);
// });
// db.getAllRepresentatives().then((rows) => {
//     console.log("Representatives:", rows);
// });

// MIDDLEWARES

app.use(express.urlencoded({ extended: false }));

app.use(
    cookieSession({
        secret: process.env.SESSION_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 1, // miliseconds * seconds * minutes * hours * days
        nameSite: true,
    })
);

// BODY
// Main page (petition)
app.get("/", (req, res) => {
    console.log("req.session :", req.session);
    if (req.session.signatureId) {
        res.redirect("/thankyou");
    }

    res.render("welcome", {
        title: "Petition",
    });
});

app.get("/thankyou", (req, res) => {
    Promise.all([db.getSignature(req.session.signatureId) /*, db.countSigners()*/]).then((results) => {
        console.log("results[0][0] :", results[0][0]);
        res.render("thankyou", {
            title: "Petition",
            first_name: results[0][0].first_name,
            last_name: results[0][0].last_name,
            petition: results[0][0].petition,
            imgUrl: results[0][0].signature_url,
        });
    });
});

app.post("/", (req, res) => {
    // Check if the input is correct: first_name, last_name, signature
    //      STORE in database
    //      SET a cookie
    //      redirect to thank-you page
    // Else display error message
    //      where is the error?
    //      show the form again with error message

    console.log("Checkpoint 2. req.body:", req.body);

    if (!req.body.first_name || !req.body.last_name || !req.body.petition || !req.body.signature_url) {
        res.render("welcome", {
            title: "Petition",
            error_firstname: !req.body.first_name,
            error_lastname: !req.body.last_name,
            error_petition: !req.body.petition,
            error_signature: !req.body.signature,
        });
    } else {
        db.createPetition(req.body.first_name, req.body.last_name, req.body.petition, req.body.signature_url)
            .then((data) => {
                console.log("Checkpoint 3. data:", data);

                req.session.signatureId = data[0].id; // We save the signature id to the session cookie
                res.redirect("/thankyou");
            })
            .catch((err) => {
                console.log("err: ", err);
                res.render("welcome", {
                    title: "Petition",
                });
            });
    }
});

// Petitions
app.get("/petitions", (req, res) => {
    res.render("petitions", {
        title: "Petition",
    });
});

app.get("/petitions/login", (req, res) => {
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

    db.createRepresentative(req.body.first_name, req.body.last_name, req.body.image_url, req.body.quote)
        .then((result) => {
            console.log("Checkpoint 3.");
            db.getAllRepresentatives().then((rows) => {
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
