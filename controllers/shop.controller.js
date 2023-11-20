const pino = require("pino");

const Product = require("../models/product.model");

const logger = pino();

// Get all products.
exports.products = async function (req, res) {
    try {
        const products = await Product.find({});

        res.render("products", products);
    } catch (error) {
        logger.error(error);
        res.status(500).json({ status: 500, message: "Could not get the products." });
    }
}