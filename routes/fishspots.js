var express     = require("express");
var router      = express.Router();
var Fishspot  = require("../models/fishspot");
var middleware  = require("../middleware");
var geocoder    = require('geocoder');

//INDEX - show all fishspots
router.get("/", function(req, res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Fishspot.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allFishspots) {
            Fishspot.count({name: regex}).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allFishspots.length < 1) {
                        noMatch = "No FishSpots match that query, please try again.";
                    }
                    res.render("fishspots/index", {
                        fishspots: allFishspots,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all fishspots from DB
        Fishspot.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allFishspots) {
            Fishspot.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("fishspots/index", {
                        fishspots: allFishspots,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});

//CREATE - add new fishspot to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
    //Get data from form and add fishspots array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var cost = req.body.cost;
    geocoder.geocode(req.body.location, function (err, data) {
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newFishspot = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
        // Create a new fishspot and save to DB
        Fishspot.create(newFishspot, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                //redirect back to fishspots page
                console.log(newlyCreated);
                res.redirect("/fishspots");
            }
        });
    });
});

//NEW - show form to create new fishspot
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("fishspots/new");
});

//SHOW - shows more info about one fishspot
router.get("/:id", function(req, res) {
    //find the fishspot with provided id
    Fishspot.findById(req.params.id).populate("comments").exec(function(err, foundFishspot) {
        if(err || !foundFishspot) {
            req.flash("error", "Fishspot not found");
            res.redirect("back");
        } else {
            //render show template with that fishspot
            res.render("fishspots/show", {fishspot: foundFishspot});
        }
    });
});

// EDIT FISHSPOT ROUTE
router.get("/:id/edit", middleware.checkFishspotOwnership, function(req, res) {
    Fishspot.findById(req.params.id, function(err, foundFishspot) {
        res.render("fishspots/edit", {fishspot: foundFishspot});
    });
});

// UPDATE FISHSPOT ROUTE
router.put("/:id", function(req, res){
  geocoder.geocode(req.body.fishspot.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.fishspot.name, image: req.body.fishspot.image, description: req.body.fishspot.description, cost: req.body.fishspot.cost, location: location, lat: lat, lng: lng};
    Fishspot.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, fishspot){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/fishspots/" + fishspot._id);
        }
    });
  });
});

// Destroy Fishspot Route
router.delete("/:id", middleware.checkFishspotOwnership, function(req, res) {
    Fishspot.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("/fishspots");
        } else {
            res.redirect("/fishspots");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;