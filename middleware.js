const Listing = require('./models/listing.js');
const Review = require('./models/review.js');
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("failure", "needs to be loggedin");
        return res.redirect('/login');
    }
    next();
};

module.exports.savedRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner= async (req,res,next)=>{
    let { id } = req.params;
        const listing = await Listing.findById(id);
        if(!listing.owner._id.equals(res.locals.currUser._id)){
            req.flash("failure", "You don't have permission to edit") ;
        return res.redirect(`/listings/${id}`);
        }
        next();
}
module.exports.isReviewAuthor= async (req,res,next)=>{
        let { id, reviewId } = req.params;
        const review = await Review.findById(reviewId);
        console.log(review+"....");
        if(!review.author._id.equals(res.locals.currUser._id)){
            req.flash("failure", "You are not the author of the review") ;
        return res.redirect(`/listings/${id}`);
        }
        next();
}