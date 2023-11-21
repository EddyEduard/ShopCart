const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    customer_id: {
        type: String,
        required: true
    },
    items: {
        type: [
            {
                product_id: {
                    type: String,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        required: true
    }
});

module.exports = mongoose.connection.useDb("ShopCart").model("carts", cartSchema);