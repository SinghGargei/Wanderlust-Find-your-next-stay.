const mongoose = require("mongoose");
const Review = require("./review");
const { ref } = require("joi");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?v=1",
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?v=1"
          : v,
    },
  },
  price: Number,
  location: String,
  country: String,
  //relationship build
  reviews:[{
    type:Schema.Types.ObjectId,
    ref:"Review",
  }],
});
listingSchema.post("findOneAndDelete", async (listing) => {
if (listing) {
await Review.deleteMany({_id: {$in: listing.reviews } });}

});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;