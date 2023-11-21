const pino = require("pino");

const Customer = require("../models/customer.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Review = require("../models/review.model");

const logger = pino();

require("dotenv").config();

// Get all products.
exports.products = async function (req, res) {
    const page = "page" in req.query == false ? 0 : parseInt(req.query.page);
    const maxPages = parseInt(process.env.PRODUCTS_PER_PAGE);
    const customerId = req.customer.id;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });
        const products = await Product.find({}, {}, { skip: (page == 0 ? page : page - 1) * maxPages, limit: maxPages });
        const reviews = await Review.aggregate([
            { "$group": { _id: "$product_id", balance: { $avg: "$rating" } } }
        ]);
        const countPages = Math.ceil(await Product.countDocuments() / maxPages);

        res.render("shop/products", {
            title: "Products",
            typePage: "VIEW-PRODUCTS",
            currentPage: page,
            pages: Array.from(new Array(countPages), (_, index) => index + 1),
            maxPages,
            customer,
            cart,
            products,
            reviews
        });
    } catch (error) {
        logger.error(error);
    }
}

// Get products by id.
exports.product = async function (req, res) {
    const id = req.params.id;
    const customerId = req.customer.id;
    const customers = [];

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });
        const product = await Product.findById(id);
        const reviews = await Review.find({ product_id: id });

        for (const review of reviews)
            customers.push(await Customer.findById(review.customer_id));

        res.render("shop/products", {
            title: "Product - " + product.name,
            typePage: "VIEW-PRODUCT",
            customer,
            cart,
            product,
            reviews,
            customers
        });
    } catch (error) {
        logger.error(error);
    }
}

// Add product to cart.
exports.add_product_to_cart = async function (req, res) {
    const id = req.params.id;
    const quantity = parseInt(req.body.quantity);
    const customerId = req.customer.id;

    try {
        const cart = await Cart.findOne({ customer_id: customerId });
        const product = await Product.findById(id);

        if (product != null) {
            const indexItem = cart.items.findIndex(x => x.product_id == product.id);

            if (indexItem != -1)
                cart.items[indexItem].quantity += quantity;
            else
                cart.items.push({ product_id: product.id, quantity: quantity });
        }

        await Cart.findByIdAndUpdate(cart.id, cart);

        res.redirect("/shop/cart");
    } catch (error) {
        logger.error(error);
    }
}

// Get all products from cart.
exports.cart = async function (req, res) {
    const customerId = req.customer.id;
    const products = [];
    const shippingPrice = parseInt(process.env.SHIPPING_PRICE);
    let product = null, totalPrice = 0;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });

        for (const item of cart.items) {
            product = await Product.findById(item.product_id);
            totalPrice += (product.price - (product.price * (product.discount / 100))) * item.quantity;
            products.push(product);
        }

        res.render("shop/cart", {
            title: "Cart",
            totalPrice,
            shippingPrice,
            totalPriceExcludingVAT: totalPrice + shippingPrice,
            totalPriceIncludingVAT: ((totalPrice + shippingPrice) + ((totalPrice + shippingPrice) * (19 / 100))),
            customer,
            cart,
            products,
        });
    } catch (error) {
        logger.error(error);
    }
}

// Change quantity for a product from cart.
exports.change_product_quantity_to_cart = async function (req, res) {
    const id = req.params.id;
    const quantity = parseInt(req.body.quantity);
    const customerId = req.customer.id;

    try {
        const cart = await Cart.findOne({ customer_id: customerId });
        const product = await Product.findById(id);

        if (product != null) {
            const indexItem = cart.items.findIndex(x => x.product_id == product.id);

            if (indexItem != -1)
                cart.items[indexItem].quantity = quantity;

            await Cart.findByIdAndUpdate(cart.id, cart);
        }

        res.redirect("/shop/cart");
    } catch (error) {
        logger.error(error);
    }
}

// Remove product from cart.
exports.remove_product_from_cart = async function (req, res) {
    const id = req.params.id;
    const customerId = req.customer.id;

    try {
        const cart = await Cart.findOne({ customer_id: customerId });
        const product = await Product.findById(id);

        if (product != null) {
            const indexItem = cart.items.findIndex(x => x.product_id == product.id);

            if (indexItem != -1)
                cart.items.splice(indexItem, 1);

            await Cart.findByIdAndUpdate(cart.id, cart);
        }

        res.redirect("/shop/cart");
    } catch (error) {
        logger.error(error);
    }
}

// Checkout page.
exports.checkout = async function (req, res) {
    const customerId = req.customer.id;
    const products = [];
    const shippingPrice = parseInt(process.env.SHIPPING_PRICE);
    let product = null, totalPrice = 0;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });

        for (const item of cart.items) {
            product = await Product.findById(item.product_id);
            totalPrice += (product.price - (product.price * (product.discount / 100))) * item.quantity;
            products.push(product);
        }

        res.render("shop/checkout", {
            title: "Checkout",
            totalPrice,
            shippingPrice,
            totalPriceExcludingVAT: totalPrice + shippingPrice,
            totalPriceIncludingVAT: ((totalPrice + shippingPrice) + ((totalPrice + shippingPrice) * (19 / 100))),
            customer,
            cart,
            products,
        });
    } catch (error) {
        logger.error(error);
    }
}

// Payment for cart.
exports.checkout_payment = async function (req, res) {
    const customerId = req.customer.id;
    const token = req.body.token;
    const shippingPrice = parseInt(process.env.SHIPPING_PRICE);
    let product = null, totalPrice = 0;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });

        for (const item of cart.items) {
            product = await Product.findById(item.product_id);
            totalPrice += (product.price - (product.price * (product.discount / 100))) * item.quantity;
        }



        res.status(200).json({ status: 200, message: "Payment successfully!" });
    } catch (error) {
        res.status(500).json({ status: 500, message: error });
        logger.error(error);
    }
}