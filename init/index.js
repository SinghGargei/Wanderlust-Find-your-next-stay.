const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
// let's make connection
const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';
main().then(()=>{
      console.log("connection made successfully to db")
}
).catch((e)=>{
      console.log("facing error");
      });
async function main(){
    await mongoose.connect(MONGO_URL);
}



      const  initDB= async()=>{
          // clear data first
          await Listing.deleteMany({});
          console.log("data deleted");
          await Listing.insertMany(initData.data);
          console.log("data was initialised");
      };
      initDB();