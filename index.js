// Set up process variables
require("dotenv").config();
const { MARVEL_PUBLIC_KEY, MARVEL_PRIVATE_KEY, DB_URL } = process.env;

// Set up express
const express = require("express");
const app = express();

// Set up cookieParser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Set up bodyParser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// Set up express session
const expressSession = require("express-session");
app.use(
  expressSession({
    secret: "keyboard cat",
    saveUninitialized: false,
    resave: false
  })
);

// Set up flash messages
// const flash = require("express-flash");
// app.use(flash());

// Set up express handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "application" }));
app.set("view engine", "handlebars");

// Set up public folder for styling and front end javascript
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Set up mongoose here
const mongoose = require("mongoose");
const bluebird = require("bluebird");
mongoose.Promise = bluebird;

const beginConnection = mongoose.connect(DB_URL, {
  useMongoClient: true
});

beginConnection
  .then(db => {
    console.log("Super People DB Connection Success");
  })
  .catch(err => console.error(error));

// set up passport and local strategy
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());

const LocalStrategy = require("passport-local").Strategy;
const { User } = require("./models");

passport.use(
  new LocalStrategy(async function(email, password, done) {
    try {
      const user = await User.findOne({ email: email });
      console.log("trying to authenticate");
      if (!user)
        throw new Error("Error: No User by that email in the database");

      if (!user.validatePassword(password))
        throw new Error("Error: Passwords do not match");

      console.log("Found an error");
      return done(null, user);
      console.log("Found an error");
    } catch (err) {
      console.log("Found an error");
      done(err);
    }
  })
);

const serializeUser = (user, done) => done(null, user.id);

const deserializeUser = (id, done) => {
  User.findById(id, (err, user) => {
    done(null, user);
  });
};

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

// Routes
const indexRoutes = require("./routes/index");
app.use("/", indexRoutes);

// Start ze server
const port = 3000;

app.listen(port, () => {
  console.log("Listening for Superpeople");
});
