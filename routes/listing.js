const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

//Index Route
router.get("/", wrapAsync(async (req, res)=>{
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));


//New Route
router.get("/new", isLoggedIn, (req, res)=>{
    res.render("listings/new.ejs");  
});

//Show Route
router.get("/:id", wrapAsync(async (req, res)=>{
    let { id } = req.params;
    const list = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        }
    })
    .populate("owner");
    if(!list){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {list});
}));

//Create Route
router.post("/",
    isLoggedIn,
    validateListing,
    wrapAsync(async (req, res, next)=>{
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listed Created!");
    res.redirect("/listings");
}));

//Edit route
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(async (req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing});
}));

//Edit Route(put)
router.put("/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(async (req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send Valid data for listing");
    }   
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;