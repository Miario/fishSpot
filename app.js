var express             = require("express"),
    app                 = express(),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    methodOverride      = require("method-override"),
    Fishspot            = require("./models/fishspot"),
    Comment             = require("./models/comment"),
    User                = require("./models/user");
    
//requiring routes
var commentRoutes       = require("./routes/comments"),
    fishspotRoutes      = require("./routes/fishspots"),
    indexRoutes         = require("./routes/index");

var url = process.env.DATABASEURL || "mongodb://localhost/fish_spot_db"
mongoose.connect(url);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment   = require('moment');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once Again Rusty Wins",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/fishspots", fishspotRoutes);
app.use("/fishspots/:id/comments", commentRoutes);

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("FishSpot Server Has Started");
});