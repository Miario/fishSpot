var express = require("express");
var router = express.Router({mergeParams: true});
var Fishspot =  require("../models/fishspot");
var Comment =  require("../models/comment");
var middleware  = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function(req, res) {
    //find fishspot by id
    Fishspot.findById(req.params.id, function(err, fishspot) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {fishspot: fishspot});
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function(req, res) {
    //lookup fishspot using ID
    Fishspot.findById(req.params.id, function(err, fishspot) {
        if(err) {
            console.log(err);
            res.redirect("/fishspots");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    fishspot.comments.push(comment._id);
                    fishspot.save();
                    req.flash("success", "Succesfully added comment");
                    res.redirect("/fishspots/" + fishspot._id);
                }
            });
        }
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Fishspot.findById(req.params.id, function(err, foundFishspot) {
        if(err || !foundFishspot) {
            req.flash("error", "No fishspot found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err) {
                res.redirect("back");
            } else {
                res.render("comments/edit", {fishspot_id: req.params.id, comment: foundComment});
            }
        });
    });
});

//COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if(err) {
            res.redirect("back");
        } else {
            res.redirect("/fishspots/" + req.params.id);
        }
    });
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
   //findByidAndRemove
   Comment.findByIdAndRemove(req.params.comment_id, function(err) {
       if(err) {
           res.redirect("back");
       } else {
           req.flash("success", "Comment deleted!");
           res.redirect("/fishspots/" + req.params.id);
       }
   })
});

module.exports = router;