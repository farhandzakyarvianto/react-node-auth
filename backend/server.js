const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local");
const cookieParser = require("cookie-parser");
const byrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();

const User = require("./User");
const app = express();

mongoose.connect(
    process.env.MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    },
    () => {
        console.log("Mongoose is connected");
    }
);

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "http://localhost:3000", // location of the react app
        credentials: true,
    })
);
app.use(
    session({
        secret: "secretcode",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

// Routes
app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) throw err;
        if (!user) res.send("No User Exists");
        else {
            req.logIn(user, (err) => {
                if (err) throw err;
                res.send("Successfully Authenticated");
                console.log(req.user);
            });
        }
    })(req, res, next);
});
app.post("/register", (req, res) => {
    User.findOne({ username: req.body.username }, async (err, doc) => {
        if (err) throw err;
        if (doc) res.send("User already exists");
        if (!doc) {
            const hashedPassword = await byrypt.hash(req.body.password, 10);
            const newUser = new User({
                username: req.body.username,
                password: hashedPassword,
            });
            await newUser.save();
            res.send("User Created");
        }
    });
});
app.get("/user", (req, res) => {
    res.send(req.user);
});

PORT = process.env.PORT || 4000;
// Start server
app.listen(PORT, () => {
    console.log(`Server has started on http://localhost/${PORT}`);
});
