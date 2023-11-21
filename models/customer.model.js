const mongoose = require("mongoose");

const customerSchema = mongoose.Schema({
    first_name: {
        type: String,
        default: "",
        minLength: 3
    },
    last_name: {
        type: String,
        default: "",
        minLength: 3
    },
    email: {
        type: String,
        required: true,
        minLength: 10
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        minLength: 10,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    address: {
        type: {
            country: {
                type: String,
                default: ""
            },
            state: {
                type: String,
                default: ""
            },
            city: {
                type: String,
                default: ""
            },
            street: {
                type: String,
                default: ""
            },
            vat_type: {
                type: String,
                default: ""
            },
            vat_code: {
                type: String,
                default: ""
            },
        }
    },
    card: {
        type: {
            name: {
                type: String,
                default: ""
            },
            brand: {
                type: String,
                default: ""
            },
            last4: {
                type: String,
                default: ""
            },
            exp_month: {
                type: Number,
                default: -1
            },
            exp_year: {
                type: Number,
                default: -1
            }
        }
    },
    metadata: {
        type: Object,
        default: {}
    },
    created_date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.connection.useDb("ShopCart").model("customers", customerSchema);