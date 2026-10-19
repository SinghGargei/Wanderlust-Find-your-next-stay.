

const Listing = require('../models/listing.js');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const ExpressError = require("../utils/ExpressError.js");

// Index Route
module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
};

// Render New Form Route
module.exports.renderNewForm = async (req, res) => {
    res.render("listings/new.ejs");
};

// Create Listing Route
module.exports.createListing = async (req, res, next) => {

  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
}).send();

console.log(response.body.features[0].geometry.coordinates);
 // 'return' lagane se function wahin terminate ho jayega aur aage ka code nahi chalega
    let url=req.file.path;
    let filename= req.file.filename;
    console.log("url "+url+"   and  fileName:"+ filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    // if (!newListing.image || !newListing.image.url) {
    //     newListing.image = {
    //         filename: "listingimage",
    //         url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?v=1",
    //     };
    // }
  newListing.image={url,filename};
       
    newListing.geometry = response.body.features[0].geometry;
let savedListing = await newListing.save();
console. log(savedListing);
    req.flash("success", "New listing added successfully!");
    res.redirect("/listings");
};

// Render Edit Form Route
module.exports.renderEditForm = async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("failure", "Listing does not exist!");
        return res.redirect('/listings');
    }
    let originalImageUrl=listing.image.url;
    console.log(originalImageUrl);
   originalImageUrl= originalImageUrl.replace("/upload","/upload/w_200");
console.log(originalImageUrl);

    res.render("listings/edit.ejs", { listing,originalImageUrl });
};

// Update Listing Route
module.exports.updateListing = async (req, res, next) => {
    let { id } = req.params;
    if (!req.body || !req.body.listing) {
        req.flash("failure", "Invalid listing data!");
        return res.redirect('/listings');
    }
    let newListingOriginal=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    // image  url add hoge new vali
    if(typeof req.file !=undefined){
         let url = req.file.path;
             let filename = req.file.path;
             newListingOriginal.image={url,filename};
        console.log("new listing with new file:"+ newListingOriginal);
       await newListingOriginal.save();
    }
        
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

// Delete Listing Route
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully!");
    res.redirect('/listings');
};

// Show Listing Route
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author"
        },
    }).populate("owner");
    
    if (!listing) {
        req.flash("failure", "This listing doesn't exist!");
        return res.redirect('/listings');
    }
    res.render("listings/show.ejs", { listing });
};