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

// Encryption
const bcrypt = require("bcryptjs");

// STATIC

app.use(express.static(path.join(__dirname, "public")));

// STARTUP

// db.getAllPetitions().then((rows) => {
//     console.log("Petitions:", rows);
// });
db.getAllRepresentatives().then((rows) => {
    console.log("Representatives:", rows);
});

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
// HOME PAGE
app.get("/", (req, res) => {
    console.log("req.session :", req.session);
    res.render("welcome", { title: "Petition", ...req.session });
});

app.post("/", (req, res) => {
    console.log("REGISTRATION. req.body:", req.body);

    // Check if email already exists

    if (!req.body.first_name || !req.body.last_name || !req.body.email || !req.body.password) {
        let renderObj = { title: "Profile", error_first_name: !req.body.first_name, error_last_name: !req.body.last_name, error_email: !req.body.email, error_password: !req.body.password };
        res.render("welcome", renderObj);
    } else {
        bcrypt
            .genSalt()
            .then((salt) => {
                console.log("bcrypt 1. salt:", salt);
                return bcrypt.hash(req.body.password, salt); // It's a promise so it must be returned
            })
            .then((hash) => {
                console.log("bcrypt 2. hash:", hash);
                db.createRepresentative(req.body.first_name, req.body.last_name, req.body.email, hash)
                    .then((data) => {
                        console.log("Checkpoint 3. data:", data);
                        req.session = { login: true, ...data[0] };
                        req.session.password = null;
                        res.redirect("/profile");
                    })
                    .catch((error) => {
                        console.log("error: ", error);
                        res.redirect("/profile");
                    });
            });
    }
});

app.post("/login", (req, res) => {
    console.log("LOG IN. req.body:", req.body);
    db.getRepresentative(req.body.email)
        .then((data) => {
            if (data.length) {
                bcrypt.compare(req.body.password, data[0].password).then((compare) => {
                    console.log("compare :", compare);
                    if (compare) {
                        req.session = { login: true, ...data[0] };
                        req.session.password = null;
                        res.redirect("/");
                    } else {
                        let renderObj = { title: "Welcome", error_password_login: true };
                        res.render("welcome", renderObj);
                    }
                });
            } else {
                let renderObj = { title: "Welcome", error_email_login: true };
                res.render("welcome", renderObj);
            }
        })
        .catch((error) => {
            console.log("error: ", error);
            res.redirect("/");
        });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

// PROFILE PAGE
app.get("/profile", (req, res) => {
    if (req.session.login) {
        res.render("profile", req.session);
    } else {
        res.redirect("/");
    }
});

app.post("/profile", (req, res) => {
    console.log("EDIT PROFILE. req.body:", req.body);

    // VALIDATION:
    // Mandatory fields should be filled > else render with error
    // Validate values are correct format and safe > else render with error
    // Check if email already exists
    // UPDATE TABLES:
    // If password is given, update firstname, lastname, email and password
    // Else update firstname, lastname, email and password

    if (!req.body.first_name || !req.body.last_name || !req.body.email || !req.body.password) {
        let renderObj = { title: "Profile", error_first_name: !req.body.first_name, error_last_name: !req.body.last_name, error_email: !req.body.email, error_password: !req.body.password, ...req.session };
        res.render("profile", renderObj);
    } else {
        bcrypt
            .genSalt()
            .then((salt) => {
                console.log("bcrypt 1. salt:", salt);
                return bcrypt.hash(req.body.password, salt); // It's a promise so it must be returned
            })
            .then((hash) => {
                console.log("bcrypt 2. hash:", hash);
                db.editRepresentative(req.body.first_name, req.body.last_name, req.body.email, hash, req.body.image_url, req.body.quote, req.body.party, req.session.id)
                    .then((data) => {
                        console.log("Checkpoint 3. data:", data);
                        req.session = { login: true, ...data[0] };
                        req.session.password = null;
                        res.redirect("/");
                    })
                    .catch((error) => {
                        console.log("error: ", error);
                        res.redirect("/");
                    });
            });
    }
});

// PETITIONS PAGE
app.get("/petitions", (req, res) => {
    res.render("petitions", req.session);
});

app.post("/petitions", (req, res) => {
    console.log("NEW PETITION. req.body:", req.body);

    if (!req.body.petition || !req.body.signature_url) {
        let renderObj = { title: "Petition", error_petition: !req.body.petition, error_signature: !req.body.signature, ...req.session };
        res.render("petitions", renderObj);
    } else {
        db.createPetition(req.session.id, req.body.petition, req.body.signature_url)
            .then((data) => {
                console.log("Checkpoint 3. data:", data);
                res.redirect("/thankyou");
            })
            .catch((error) => {
                console.log("error: ", error);
                res.redirect("/petitions");
            });
    }
});

// THANK YOU PAGE
app.get("/thankyou", (req, res) => {
    Promise.all([db.getPetition(req.session.id) /*, db.countSigners()*/]).then((results) => {
        console.log("results[0][0] :", results[0][0]);
        if (!results[0][0]) {
            res.redirect("/");
        } else {
            res.render("thankyou", { title: "Thank you!", petition: results[0][0].petition, signature_url: results[0][0].signature_url, ...req.session });
        }
    });
});

// REPRESENTATIVES PAGE
app.get("/representatives", (req, res) => {
    db.getAllRepresentatives()
        .then((data) => {
            console.log("data :", data);
            res.render("representatives", { representatives: data, ...req.session });
        })
        .catch((error) => {
            console.log("error: ", error);
            res.redirect("/");
        });
});

// VOTE NOW PAGE
app.get("/votenow", (req, res) => {
    // db.getAllPetitions()
    //     .then((data) => {
    //         logData = { signature_url: null, ...data };
    //         console.log("data :", logData);
    //         res.render("votenow", { petitions: data, ...req.session });
    //     })
    //     .catch((error) => {
    //         console.log("error: ", error);
    //         res.redirect("/");
    //     });

    res.render("votenow", req.session);
});

// GET /profile
// renders form to input profile info

// POST /profile
// Validate: age must be a number
// validate: city must be text
// validate: homepage is valid URL
//      must start with http
// save form data to database

// GET /petitions/party
// grab the party from the url
// getAllPetitionsByParty

// EXAMPLE

// db.createCity();

// INITIALIZATION
app.listen(PORT, () => {
    console.log(`Checkpoint 0: Listening on port: ${PORT}`);
});
