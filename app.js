const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";   

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main().then((res)=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    mongoose.connect(MONGO_URL);
}

//Main route
app.get("/", (req, res)=>{
    res.send("I am root");
});

//Index Route
app.get("/listings", async (req, res)=>{
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});


//New Route
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");  
});

//Show Route
app.get("/listings/:id", async (req, res)=>{
    let { id } = req.params;
    let list = await Listing.findById(id);
    res.render("listings/show.ejs", {list});
});

//Create Route
app.post("/listings", async (req, res)=>{
    let listing = req.body.listing;
    const newListing = new Listing(listing);
    await newListing.save();
    res.redirect("/listings");
});

//Edit route
app.get("/listings/:id/edit", async (req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

//Edit Route(put)
app.put("/listings/:id", async (req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id", async (req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});