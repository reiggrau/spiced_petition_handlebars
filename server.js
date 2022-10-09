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
    res.render("welcome", { page: "Home page", ...req.session });
});

app.post("/", (req, res) => {
    console.log("REGISTRATION. req.body:", req.body);

    let renderObj;

    // Check if empty fields
    if (!req.body.first_name || !req.body.last_name || !req.body.email || !req.body.password) {
        renderObj = { error_first_name: !req.body.first_name, error_last_name: !req.body.last_name, error_email: !req.body.email, error_password: !req.body.password };
        res.render("welcome", { page: "Welcome", ...renderObj });
    } else {
        // Check if email already exists
        db.checkEmail(req.body.email)
            .then((data) => {
                console.log("Checkpoint 1. checkEmail:", data);
                if (data.length && data[0].id != req.session.id) {
                    renderObj = { error_email_used: true };
                    throw new Error("Email already in use!");
                } else {
                    return bcrypt.genSalt();
                }
            })
            .then((salt) => {
                console.log("Checkpoint 2. bcrypt.salt:", salt);
                return bcrypt.hash(req.body.password, salt); // It's a promise so it must be returned
            })
            .then((hash) => {
                console.log("Checkpoint 3. hash:", hash);
                return db.createRepresentative(req.body.first_name, req.body.last_name, req.body.email, hash);
            })
            .then((data) => {
                console.log("Checkpoint 4. data:", data);
                req.session = Object.assign(req.session, data[0]);
                res.redirect("/profile");
            })
            .catch((error) => {
                console.log("error: ", error);
                res.render("welcome", { page: "Profile", ...renderObj });
            });
    }
});

app.post("/login", (req, res) => {
    console.log("LOG IN. req.body:", req.body);
    let renderObj;
    db.getRepresentative(req.body.email)
        .then((data) => {
            if (data.length) {
                bcrypt.compare(req.body.password, data[0].password).then((compare) => {
                    console.log("compare :", compare);
                    if (compare) {
                        delete data[0].password; // caution!
                        req.session = Object.assign(req.session, data[0]);
                        res.redirect("/");
                    } else {
                        renderObj = { error_password_login: true };
                        res.render("welcome", { page: "Welcome", ...renderObj });
                    }
                });
            } else {
                renderObj = { error_email_login: true };
                res.render("welcome", { page: "Welcome", ...renderObj });
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
    if (req.session.id) {
        res.render("profile", { page: "profile", ...req.session });
    } else {
        res.redirect("/");
    }
});

app.post("/profile", (req, res) => {
    console.log("EDIT PROFILE. req.body:", req.body);
    // VALIDATION:
    // Validate values are correct format and safe > else render with error
    //
    // UPDATE TABLES:
    //
    //
    // redirect to petition page

    let dataObj;
    let renderObj;

    if (!req.body.first_name || !req.body.last_name || !req.body.email) {
        renderObj = { error_first_name: !req.body.first_name, error_last_name: !req.body.last_name, error_email: !req.body.email, ...req.session };
        res.render("profile", { page: "Profile", ...renderObj });
    } else {
        db.checkEmail(req.body.email)
            .then((data) => {
                if (data.length && data[0].id != req.session.id) {
                    renderObj = { error_email_used: true, ...req.session };
                    throw new Error("Email already in use!");
                } else if (req.body.password) {
                    return bcrypt.genSalt();
                } else {
                    return false;
                }
            })
            .then((salt) => {
                if (salt) {
                    return bcrypt.hash(req.body.password, salt);
                } else {
                    return false;
                }
            })
            .then((hash) => {
                if (hash) {
                    return db.editRepresentative(req.session.id, req.body.first_name, req.body.last_name, req.body.email, hash);
                } else {
                    return db.editRepresentativeNoPassword(req.session.id, req.body.first_name, req.body.last_name, req.body.email);
                }
            })
            .then((data1) => {
                console.log("representatives data1:", data1);
                dataObj = { ...data1[0] };
                return db.editProfile(req.session.id, req.body.image_url, req.body.quote, req.body.party);
            })
            .then((data2) => {
                console.log("profiles data2:", data2);
                dataObj = Object.assign(dataObj, data2[0]);
                req.session = Object.assign(req.session, dataObj);
                res.redirect("/petitions");
            })
            .catch((error) => {
                console.log("error: ", error);
                res.render("profile", { page: "Profile", ...renderObj });
            });
    }
});

// PETITIONS PAGE
app.get("/petitions", (req, res) => {
    res.render("petitions", { page: "Petitions", ...req.session });
});

app.post("/petitions", (req, res) => {
    console.log("NEW PETITION. req.body:", req.body);

    if (!req.body.title || !req.body.petition || !req.body.signature_url) {
        let renderObj = { error_title: !req.body.title, error_petition: !req.body.petition, error_signature: !req.body.signature, ...req.session };
        res.render("petitions", { page: "Petitions", ...renderObj });
    } else {
        db.createPetition(req.session.id, req.body.title, req.body.petition, req.body.signature_url, req.body.topic)
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

// delete petition
app.post("/petitions/delete", (req, res) => {
    // VALIDATIOIN
    // user signed in
    // db.deletePetition
    // remove 'signed' from session
    // redirect to petition page
});

// THANK YOU PAGE
app.get("/thankyou", (req, res) => {
    let renderObj;
    Promise.all([db.getLastPetition(req.session.id), db.countPetitions(), db.countRepresentatives(), db.getAllPetitions()]).then((data) => {
        console.log("data :", data);
        if (!data[0][0]) {
            res.redirect("/");
        } else {
            petitionData = data[0];
            petitionData[0].petition_id = petitionData[0].id;
            delete petitionData[0].id;
            petitionData[0].canDelete = petitionData[0].user_id == req.session.id;
            petitionData[0].created_at = new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "long" }).format(petitionData.created_at);
            console.log("petitionData :", petitionData);

            petition_count = data[1][0].count;
            representatives_count = data[2][0].count;

            miniPetitions = data[3];

            renderObj = { petitionData, petition_count, representatives_count, miniPetitions, ...req.session };
            res.render("thankyou", { page: "Thank you!", ...renderObj });
        }
    });
});

// REPRESENTATIVES PAGE
app.get("/representatives", (req, res) => {
    db.getAllRepresentatives()
        .then((data) => {
            console.log("data :", data);
            res.render("representatives", { page: "Representatives", representatives: data, ...req.session });
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

    res.render("votenow", { page: "Vote now!", ...req.session });
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
