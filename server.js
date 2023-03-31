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

// require twitter.js functions
const { getToken, getTweets, filterTweets } = require("./twitterPromise");

const { promisify } = require("util");
const getTweetsPromise = promisify(getTweets);

// STATIC
app.use(express.static(path.join(__dirname, "public")));

// Variables
const screen_nameArr = ["TheOnion"];

const namesRegex = /^[a-z ,.'-]+$/i; // names check
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; // email check

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
// HEADLINES
app.get("/headlines.json", (req, res) => {
    console.log("Requesting headlines!");

    getToken // 1- get the token
        .then((token) => {
            // console.log("token:", token);

            Promise.all(screen_nameArr.map((item) => getTweetsPromise(token, item))) // 2- with the token, make a request for tweets
                .then((results) => {
                    // console.log("filterTweets(results) :", filterTweets(results));

                    res.json(filterTweets(results)); // 3- once we receive the tweets, filter them // 4- send filtered tweets to the client as JSON
                })
                .catch((error) => console.log("Error in getTweetsPromise :", error));
        })
        .catch((error) => console.log("Error in getToken :", error));
});

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
    } else if (!req.body.email.match(emailRegex) || !req.body.first_name.match(namesRegex) || !req.body.last_name.match(namesRegex)) {
        renderObj = { error_email_regex: !req.body.email.match(emailRegex), error_first_regex: !req.body.first_name.match(namesRegex), error_last_regex: !req.body.last_name.match(namesRegex) };
        res.render("welcome", { page: "Welcome", ...renderObj });
    } else {
        // Check if email already exists
        db.checkEmail(req.body.email)
            .then((data) => {
                if (data.length && data[0].id != req.session.id) {
                    renderObj = { error_email_used: true };
                    throw new Error("Email already in use!");
                } else {
                    return bcrypt.genSalt();
                }
            })
            .then((salt) => {
                return bcrypt.hash(req.body.password, salt); // It's a promise so it must be returned
            })
            .then((hash) => {
                return db.createRepresentative(req.body.first_name, req.body.last_name, req.body.email, hash);
            })
            .then((data) => {
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

    let dataObj;
    let renderObj;

    if (!req.body.first_name || !req.body.last_name || !req.body.email) {
        renderObj = { error_first_name: !req.body.first_name, error_last_name: !req.body.last_name, error_email: !req.body.email, ...req.session };
        res.render("profile", { page: "Profile", ...renderObj });
    } else if (!!req.body.user_page && req.body.user_page.indexOf("http://") != 0 && req.body.user_page.indexOf("https://") != 0) {
        renderObj = { error_user_page: true, ...req.session };
        res.render("profile", { page: "Profile", ...renderObj });
    } else if (!req.body.email.match(emailRegex) || !req.body.first_name.match(namesRegex) || !req.body.last_name.match(namesRegex)) {
        renderObj = { error_email_regex: !req.body.email.match(emailRegex), error_first_regex: !req.body.first_name.match(namesRegex), error_last_regex: !req.body.last_name.match(namesRegex), ...req.session };
        res.render("profile", { page: "Profile", ...renderObj });
    } else {
        let url = req.body.user_page;
        // console.log("req.body.user_page :", req.body.user_page);
        // console.log('req.body.user_page.indexOf("ttp") :', req.body.user_page.indexOf("guashj"));
        // Check if url is valid
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
                dataObj = { ...data1[0] };
                return db.editProfile(req.session.id, req.body.image_url, req.body.quote, req.body.party, req.body.user_page);
            })
            .then((data2) => {
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

app.post("/deleteuser", (req, res) => {
    console.log("DELETE USER:", req.body);

    if (req.session.id == req.body.user_id) {
        db.deleteAllPetitions(req.body.user_id).then(() => {
            db.deleteProfile(req.body.user_id).then(() => {
                db.deleteRepresentative(req.body.user_id).then(() => {
                    req.session = null;
                    res.redirect("/");
                });
            });
        });
    } else {
        res.redirect("/");
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
            .then(() => {
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
    let renderObj;
    Promise.all([db.getLastPetition(req.session.id), db.countPetitions(), db.countRepresentatives(), db.getAllPetitions()]).then((data) => {
        if (!data[0][0]) {
            res.redirect("/");
        } else {
            petitionData = [data[0][0]];
            petitionData[0].petition_id = petitionData[0].id;
            delete petitionData[0].id;
            petitionData[0].canDelete = petitionData[0].user_id == req.session.id;
            petitionData[0].created_at = petitionData[0].created_at.toString().split(" GMT")[0];

            petition_count = data[1][0].count;
            representatives_count = data[2][0].count;

            data[3].shift();
            miniPetitions = data[3];

            renderObj = { petitionData, petition_count, representatives_count, miniPetitions, ...req.session };
            res.render("thankyou", { page: "Thank you!", ...renderObj });
        }
    });
});

// delete petition
app.post("/deletepetition", (req, res) => {
    console.log("DELETE PETITION:", req.body.petition_id);
    if (req.session.id) {
        db.deletePetition(req.body.petition_id).then(() => {
            res.redirect("/petitions");
        });
    } else {
        res.redirect("/");
    }
});

// REPRESENTATIVES PAGE
app.get("/representatives", (req, res) => {
    db.getAllRepresentatives()
        .then((data) => {
            // console.log("data :", data);
            for (let element of data) {
                element.created_at = element.created_at.toString().split(" ").slice(0, 4).join(" ");
            }
            res.render("representatives", { page: "Representatives", representatives: data, ...req.session });
        })
        .catch((error) => {
            console.log("error: ", error);
            res.redirect("/");
        });
});

// VOTE NOW PAGE
app.get("/votenow", (req, res) => {
    db.getAllPetitions()
        .then((data) => {
            console.log("data :", data);
            for (let element of data) {
                element.petition_id = element.id;
                delete element.id;
                element.canDelete = element.user_id == req.session.id;
                element.created_at = element.created_at.toString().split(" GMT")[0];
            }
            res.render("votenow", { title: "Vote now!", petitions: data, ...req.session });
        })
        .catch((error) => {
            console.log("error: ", error);
            res.redirect("/");
        });
});

app.post("/accept", (req, res) => {
    console.log("ACCEPT PETITION :", req.body.petition_id);
    db.acceptPetition(req.body.petition_id).then(() => {
        res.redirect("/votenow");
    });
});

app.post("/pass", (req, res) => {
    console.log("PASS PETITION :", req.body.petition_id);
    db.passPetition(req.body.petition_id).then(() => {
        res.redirect("/votenow");
    });
});

app.post("/reject", (req, res) => {
    console.log("REJECT PETITION :", req.body.petition_id);
    db.rejectPetition(req.body.petition_id).then(() => {
        res.redirect("/votenow");
    });
});

// TOPIC
app.get("/topic/:topic", (req, res) => {
    console.log("TOPIC. req.params.topic :", req.params.topic);
    db.getAllPetitionsByTopic(req.params.topic)
        .then((data) => {
            console.log("data :", data);
            for (let element of data) {
                element.petition_id = element.id;
                delete element.id;
                element.canDelete = element.user_id == req.session.id;
                element.created_at = element.created_at.toString().split(" GMT")[0];
            }
            res.render("topic", { title: "Topic", topic: data[0].topic, petitions: data, ...req.session });
        })
        .catch((error) => {
            console.log("error: ", error);
            res.redirect("/");
        });
});

// INITIALIZATION
app.listen(PORT, () => {
    console.log(`Checkpoint 0: Listening on port: ${PORT}`);
});
