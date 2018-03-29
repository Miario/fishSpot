// all middleware goes here
var middlewareObj = {};
var Fishspot =  require("../models/fishspot");
var Comment =  require("../models/comment");

middlewareObj.checkFishspotOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Fishspot.findById(req.params.id, function(err, foundFishspot) {
            if(err || !foundFishspot) {
                req.flash("error", "Fishspot not found!");
                res.redirect("back");
            } else {
                //does user own the fishspot
                if(foundFishspot.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
    }; 

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err || !foundComment) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                //does user own the comment?
                if(foundComment.author.id.equals(req.user._id)  || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged to do that!");
    res.redirect("/login");
};

module.exports = middlewareObj;

