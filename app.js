const express = require('express');
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parses incoming JSON requests (Postman)
app.use(methodOverride("_method"));

// DB Connection
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
async function main() {
    await mongoose.connect(MONGO_URL);
}
main()
  .then(() => console.log("connection made successfully to db"))
  .catch((error) => console.log("facing error:", error));

// Require Model
const Listing = require('./models/listing.js');

// Root Route
app.get('/', (req, res) => {
    res.send('hi, i am root page');
});

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
}));

// New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

const validateListing=(req,res,next)=>{
     let {error}=listingSchema.validate(req.body);
     console.log(error);
  if(error){
  let errMsg=error.details.map((el)=>el.message).join(",");
    throw  new ExpressError(404,errMsg);
  }else{
    next();
  }
};
// Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    // if (!req.body || !req.body.listing) {
    //     return next(new ExpressError(400, "Send valid data for listing!")); // Added return[cite: 9]
    // }
   
   
    const newListing = new Listing(req.body.listing); // Removed redundant await
    
    if (!newListing.image || !newListing.image.url) {
        newListing.image = {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?v=1",
        };
    }
    await newListing.save();
    res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return next(new ExpressError(404, "Listing does not exist!"));
    }
    res.render("listings/edit.ejs", { listing });
}));

// Update Route
app.put("/listings/:id", wrapAsync(async (req, res, next) => { // Added wrapAsync & next
    let { id } = req.params;
    if (!req.body || !req.body.listing) {
        return next(new ExpressError(400, "Send valid data for listing!")); // Added return[cite: 9]
    }
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

// Show Route
app.get("/listings/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return next(new ExpressError(404, "Listing not found!"));
    }
    res.render("listings/show.ejs", { listing });
}));

// 404 Catch-All Route (Synchronous: No wrapAsync required)
app.all("{*path}", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// Centralized Error Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(8080, () => {
    console.log('app is listening on port 8080');
});