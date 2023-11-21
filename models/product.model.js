const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: {
        type: String,
        default: "",
        required: true,
        minLength: 5
    },
    description: {
        type: String,
        default: ""
    },
    images: {
        type: [],
        required: true
    },
    price: {
        type: Number,
        default: 0,
        required: true
    },
    discount: {
        type: Number,
        default: 0,
        required: true
    },
    stock: {
        type: Number,
        default: 0,
        required: true
    },
    created_date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.connection.useDb("ShopCart").model("products", productSchema);