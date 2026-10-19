if(process.envNODE_ENV != "production") {
require("dotenv").config();

}
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

// Renamed Joi schema import to avoid naming conflicts with Mongoose schema
// const { listingSchema: joiListingSchema, reviewSchema: joiReviewSchema } = require("./schema.js");
//PASSPORT
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user.js');
//PASSPORT


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parses incoming JSON requests
app.use(methodOverride("_method"));
// SESSION 
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const dbUrl=process.env.ATLASDB_URL;
//mongo-atlas
const store = MongoStore.create({
mongoUrl: dbUrl,
crypto: {
secret: "mysupersecretcode",
},
touchAfter: 24 * 3600,});

store.on("error", () =>
console. log("ERROR in MONGO SESSION STORE", err));

//mongo-atlas
const sessionOptions={
    store,
   secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie:{
   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  }
};
app.use(session(sessionOptions));
app.use(flash());
//PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//PASSPORT


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.failure=req.flash("failure");
    res.locals.currUser=req.user;

    next();
});
//SESSION
//PASSPORT
// app.use('/demoUser', async (req,res)=>{
//    let fakeUser=new User({
//     email:"student@gmail.com",
//     username:"student"
//    });
//      let registeredUser=await  User.register(fakeUser,"password");
//      res.send(registeredUser);
// });

//PASSPORT


// DB Connection
// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

async function main() {
    // await mongoose.connect(MONGO_URL);
     await mongoose.connect(dbUrl);
}
main()
  .then(() => console.log("connection made successfully to db"))
  .catch((error) => console.log("facing error:", error));

// Require Model
// const Listing = require('./models/listing.js');
// const Review = require('./models/review.js');
// imp------------------
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");
// Root Route
// app.get('/', (req, res) => {
//     res.send('hi, i am root page');
// });
  app.use("/listings",listingsRouter);
    app.use("/listings/:id/reviews",reviewsRouter);
    app.use("/",userRouter);
// // Index Route
// app.get("/listings", wrapAsync(async (req, res) => {
//     const allListing = await Listing.find({});
//     res.render("listings/index.ejs", { allListing });
// }));

// // New Route
// app.get("/listings/new", (req, res) => {
//     res.render("listings/new.ejs");
// });

// // Validation Middleware
// const validateListing = (req, res, next) => {
//     let { error } = joiListingSchema.validate(req.body);
//     console.log(error);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };

// //validation fro review
// const validateReview= (req, res, next) => {
//     let { error } = joiReviewSchema.validate(req.body);
//     console.log(error);
//     if (error) {
//         let errMsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400, errMsg);
//     } else {
//         next();
//     }
// };
// // Create Route
// app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
//     const newListing = new Listing(req.body.listing);
    
//     if (!newListing.image || !newListing.image.url) {
//         newListing.image = {
//             filename: "listingimage",
//             url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?v=1",
//         };
//     }
//     await newListing.save();
//     res.redirect("/listings");
// }));

// // Edit Route
// app.get("/listings/:id/edit", wrapAsync(async (req, res, next) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     if (!listing) {
//         return next(new ExpressError(404, "Listing does not exist!"));
//     }
//     res.render("listings/edit.ejs", { listing });
// }));

// // Update Route
// app.put("/listings/:id", validateListing, wrapAsync(async (req, res, next) => {
//     let { id } = req.params;
//     if (!req.body || !req.body.listing) {
//         return next(new ExpressError(400, "Send valid data for listing!"));
//     }
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     res.redirect(`/listings/${id}`);
// }));

// // Delete Route
// app.delete("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndDelete(id);
//     res.redirect('/listings');
// }));

// // Show Route
// app.get("/listings/:id", wrapAsync(async (req, res, next) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     if (!listing) {
//         return next(new ExpressError(404, "Listing not found!"));
//     }
//     res.render("listings/show.ejs", { listing });
// }));

// //PROJECT PHASE-2 (PART-A)
// // route for review post
// app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     console.log(id);
//     let listing = await Listing.findById(id);
//     console.log(req.body);
//     let newReview = new Review(req.body.review);
    
//     listing.reviews.push(newReview); // Removed invalid 'await'
    
//     await newReview.save();
//     let result = await listing.save();
//     console.log("resulttttt:", result);
    
//     res.redirect(`/listings/${id}`);
// }));
// // route to delete the review
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
//        let { id, reviewId } = req.params;

// await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
// await Review.findByIdAndDelete(reviewId);

// res.redirect(`/listings/${id}`);
// }));
// //PROJECT PHASE-2 (PART-A)
// 404 Catch-All Route
// With this syntax:
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
