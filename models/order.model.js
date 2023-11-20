const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    customer_id: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["UNDELIVERED", "SHIPPED", "DELIVERED"],
        default: "UNDELIVERED",
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
    },
    created_date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.connection.useDb("ShopCart").model("orders", orderSchema);