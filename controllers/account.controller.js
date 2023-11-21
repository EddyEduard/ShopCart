const pino = require("pino");

const Customer = require("../models/customer.model");
const Cart = require("../models/cart.model");

const logger = pino();

require("dotenv").config();

// Get profile.
exports.profile = async function (req, res) {
    const customerId = req.customer.id;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });

        res.render("account/profile", {
            title: "Profile",
            customer,
            cart
        });
    } catch (error) {
        logger.error(error);
    }
}

// Get billing information.
exports.billing = async function (req, res) {
    const customerId = req.customer.id;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });

        res.render("account/billing", {
            title: "Billing Information",
            customer,
            cart
        });
    } catch (error) {
        logger.error(error);
    }
}

// Get payment method information.
exports.payment_method = async function (req, res) {
    const customerId = req.customer.id;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });

        res.render("account/payment-method", {
            title: "Payment Method",
            customer,
            cart
        });
    } catch (error) {
        logger.error(error);
    }
}