const https = require("https");

// const { twitterKey, twitterSecret } = require("./secrets");

const twitterKey = process.env.TWITTER_KEY;
const twitterSecret = process.env.TWITTER_SECRET;

const authorization = `Basic ${Buffer.from(twitterKey + ":" + twitterSecret).toString("base64")}`;

const getToken = new Promise(function (resolve, reject) {
    const options = {
        host: "api.twitter.com",
        path: "/oauth2/token",
        method: "POST",
        headers: {
            authorization,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
    };

    const req = https.request(options, (response) => {
        if (response.statusCode != 200) {
            reject(new Error(response.statusCode));
        } else {
            let body = "";
            response.on("data", (chunk) => (body += chunk));
            response.on("end", () => {
                let parsedBody = JSON.parse(body);
                resolve(parsedBody.access_token);
            });
        }
    });
    req.end("grant_type=client_credentials");
});

const getTweets = function (token, item, callback) {
    const options = {
        host: "api.twitter.com",
        path: `/1.1/statuses/user_timeline.json?screen_name=${item}&count=7`,
        method: "GET",
        headers: {
            Authorization: "Bearer " + token,
        },
    };

    const callbackTweets = (resp) => {
        if (resp.statusCode != 200) {
            callback(new Error(resp.statusCode));
            return;
        } else {
            let tweets = "";
            resp.on("data", (chunk) => {
                tweets += chunk;
            });
            resp.on("end", () => {
                callback(null, JSON.parse(tweets));
            });
        }
    };

    const req = https.request(options, callbackTweets);

    req.end();
};

const filterTweets = function (rawTweets) {
    const flatArr = rawTweets.flat();

    const filteredArr = flatArr.filter((item) => item.text.split("https://")[0] && item.entities.urls.length == 1);

    const sortedArr = filteredArr.sort((item1, item2) => {
        return new Date(item2.created_at).getTime() - new Date(item1.created_at).getTime(); // [ 5, 4, 3, 2, 1 ]
    });

    const shortArr = sortedArr.slice(0, 7);

    const jsonObj = [];

    shortArr.forEach((item) => {
        // console.log("item.text :", item.text);
        // console.log("item.created_at", item.created_at, "Date :", new Date(item.created_at).getTime());
        jsonObj.push({
            text: item.text.split("https://")[0],
            name: item.user.name,
            url: item.entities.urls[0].url,
            date: item.created_at,
        });
    });

    return jsonObj;
};

module.exports = {
    getToken,
    getTweets,
    filterTweets,
};
