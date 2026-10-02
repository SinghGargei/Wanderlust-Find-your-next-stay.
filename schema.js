const joi=require("joi");
module.exports.listingSchema=joi.object({
    listing:joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
     price: joi.number().required().min(0),
    loaction: joi.string().required(),
     country: joi.string().required(),
    imge: joi.string().allow("", null),
    }).required(),
});