const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema: joiListingSchema } = require("../schema.js");
const Listing = require('../models/listing.js');
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isOwner } = require('../middleware.js');
const listingController = require('../controllers/listing.js');

const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
// const upload = multer({ dest: 'uploads/' });
const upload = multer({storage});

// Validation Middleware
const validateListing = (req, res, next) => {
    let { error } = joiListingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
router.route("/")
.get( wrapAsync(listingController.index))//index route
.post( isLoggedIn, upload.single('listing[image]'), wrapAsync(listingController.createListing));// Create Route -validateListing,
// .post( upload.single('listing[image]'),(req,res)=>{
//     console.log(req.file);
//     res.send(req.file);
// });
// Index Route
// router.get("/", wrapAsync(listingController.index));

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);


router.route("/:id")
.put( isLoggedIn, isOwner,upload.single('listing[image]'), wrapAsync(listingController.updateListing))// Edit Route
.delete( isLoggedIn, isOwner, wrapAsync(listingController.destroyListing))// // Delete Route
.get(wrapAsync(listingController.showListing));// // Show Route




// Create Route
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// // Update Route
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// // Delete Route
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// // Show Route
// router.get("/:id", wrapAsync(listingController.showListing));

module.exports = router;
