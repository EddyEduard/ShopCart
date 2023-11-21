const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
    customer_id: {
        type: String,
        required: true
    },
    product_id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: "",
        required: true,
        minLength: 10
    },
    content: {
        type: String,
        default: ""
    },
    rating: {
        type: Number,
        default: 0,
        required: true
    },
    created_date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.connection.useDb("ShopCart").model("reviews", reviewSchema);