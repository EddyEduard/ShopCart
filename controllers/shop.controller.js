require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const lookup = require("country-code-lookup");
const pino = require("pino");

const Customer = require("../models/customer.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Review = require("../models/review.model");
const Order = require("../models/order.model");

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
            totalVAT: ((totalPrice + shippingPrice) * (19 / 100)),
            totalPriceIncludingVAT: ((totalPrice + shippingPrice) + ((totalPrice + shippingPrice) * (19 / 100))),
            isUpdateCard: req.query.isUpdateCard,
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
    const nameOnCard = req.body.nameOnCard;
    const isUpdateCard = req.query.isUpdateCard != undefined ? req.query.isUpdateCard == "true" : false;
    const shippingPrice = parseInt(process.env.SHIPPING_PRICE);
    let product = null;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });

        const stripeCustomers = await stripe.customers.search({
            query: `metadata[\'service\']:\'shopcart\' AND metadata[\'customer_id\']:\'${customer.id}\'`
        });
        let stripeCustomer = stripeCustomers.data.length > 0 ? stripeCustomers.data[0] : null;

        const payForServices = stripeCustomer => {
            return new Promise(async (resolve, reject) => {
                for (const item of cart.items) {
                    product = await Product.findById(item.product_id);

                    await stripe.invoiceItems.create({
                        customer: stripeCustomer.id,
                        quantity: item.quantity,
                        unit_amount_decimal: parseFloat(((product.price - (product.price * (product.discount / 100))) * 100).toFixed(2)),
                        tax_behavior: "exclusive",
                        currency: "usd",
                        description: product.name
                    }).catch(error => logger.error(error));
                }

                await stripe.invoiceItems.create({
                    customer: stripeCustomer.id,
                    quantity: 1,
                    unit_amount: shippingPrice * 100,
                    tax_behavior: "exclusive",
                    currency: "usd",
                    description: "Shipping"
                }).catch(error => logger.error(error));

                await stripe.invoices.create({
                    customer: stripeCustomer.id,
                    description: `Products.`,
                    pending_invoice_items_behavior: "include",
                    automatic_tax: { enabled: true }
                }).then(async invoice => {
                    await stripe.invoices.pay(invoice.id).then(async data => {
                        const order = new Order({
                            customer_id: customer.id,
                            status: "UNDELIVERED",
                            items: cart.items,
                            created_date: new Date()
                        });

                        await order.save();

                        for (const item of cart.items) {
                            product = await Product.findById(item.product_id);

                            if (product.stock > 0)
                                product.stock = product.stock - item.quantity;

                            await Product.findByIdAndUpdate(product.id, product);
                        }

                        cart.items = [];

                        await Cart.findByIdAndUpdate(cart.id, cart);

                        resolve({ message: "The invoice has been issued and paid successfully.", type: "SUCCESS", invoice: data.invoice_pdf });
                    }).catch(error => reject({ message: error, type: "ERROR" }));
                }).catch(error => reject({ message: error, type: "ERROR" }));
            });
        };

        if (stripeCustomer == null && token != "" && nameOnCard != "" && !isUpdateCard) {
            await stripe.tokens.retrieve(token).then(async newToken => {
                await stripe.customers.create({
                    address: {
                        country: lookup.byCountry(customer.address.country)?.iso2,
                        state: customer.address.state,
                        city: customer.address.city,
                        line1: customer.address.address,
                        postal_code: customer.address.postal_code
                    },
                    name: nameOnCard,
                    email: customer.email,
                    phone: customer.phone,
                    metadata: {
                        customer_id: customer.id,
                        fingerprint: newToken.card.fingerprint,
                        service: "shopcart"
                    }
                }).then(async newCustomer => {
                    await stripe.customers.createSource(
                        newCustomer.id,
                        {
                            source: token
                        }
                    ).then(async _ => {
                        if (customer.address.vat_type != "" && customer.address.vat_code != "") {
                            await stripe.customers.createTaxId(
                                newCustomer.id,
                                {
                                    type: customer.address.vat_type,
                                    value: customer.address.vat_code
                                }
                            ).catch(error => logger.error(error));
                        }

                        customer.card.name = newToken.card.name;
                        customer.card.brand = newToken.card.brand;
                        customer.card.last4 = newToken.card.last4;
                        customer.card.exp_month = newToken.card.exp_month;
                        customer.card.exp_year = newToken.card.exp_year;
                        customer.metadata.has_payment_method_added = true;

                        await Customer.findByIdAndUpdate(customer.id, customer);

                        await payForServices(newCustomer).then(result => res.status(200).json({ status: 200, message: result.message, invoice: result.invoice })).catch(error => {
                            logger.error(error.message);

                            if (typeof error.message == "string" && error.type == "WARNING")
                                res.status(403).json({ status: 403, message: `Payment was successfully made. ${error.message}` });
                            else if (typeof error.message == "object" && error.type == "ERROR")
                                res.status(500).json({ status: 500, message: `Payment failed. ${error.message["message"]}` });
                        });
                    }).catch(error => {
                        logger.error(error);
                        res.status(500).json({ status: 500, message: `Payment failed. ${error["message"]}` });
                    });
                }).catch(error => {
                    logger.error(error);
                    res.status(500).json({ status: 500, message: `Payment failed. ${error["message"]}` });
                });
            });
        } else if (stripeCustomer != null && token != "" && nameOnCard != "" && isUpdateCard) {
            await stripe.customers.deleteSource(stripeCustomer.id, stripeCustomer.default_source).then(async () => {
                await stripe.tokens.retrieve(token).then(async newToken => {
                    await stripe.customers.createSource(
                        stripeCustomer.id,
                        {
                            source: newToken.id
                        }
                    ).then(async _ => {
                        customer.card.name = newToken.card.name;
                        customer.card.brand = newToken.card.brand;
                        customer.card.last4 = newToken.card.last4;
                        customer.card.exp_month = newToken.card.exp_month;
                        customer.card.exp_year = newToken.card.exp_year;
                        customer.metadata.has_payment_method_added = true;

                        await Customer.findByIdAndUpdate(customer.id, customer);

                        await payForServices(stripeCustomer).then(result => res.status(200).json({ status: 200, message: result.message, invoice: result.invoice })).catch(error => {
                            logger.error(error.message);

                            if (typeof error.message == "string" && error.type == "WARNING")
                                res.status(403).json({ status: 403, message: `Payment was successfully made. ${error.message}` });
                            else if (typeof error.message == "object" && error.type == "ERROR")
                                res.status(500).json({ status: 500, message: `Payment failed. ${error.message["message"]}` });
                        });
                    }).catch(error => {
                        logger.error(error);
                        res.status(500).json({ status: 500, message: `Payment failed. ${error["message"]}` });
                    });
                });
            }).catch(error => {
                logger.error(error);
                res.status(500).json({ status: 500, message: "Payment failed." });
            });
        } else if (stripeCustomer != null && stripeCustomer.default_source == null && token != "" && nameOnCard != "" && !isUpdateCard) {
            await stripe.customers.createSource(
                stripeCustomer.id,
                {
                    source: token
                }
            ).then(async _ => {
                await payForServices(stripeCustomer).then(result => res.status(200).json({ status: 200, message: result.message, invoice: result.invoice })).catch(error => {
                    logger.error(error.message);
                    if (typeof error.message == "string" && error.type == "WARNING")
                        res.status(403).json({ status: 403, message: `Payment was successfully made. ${error.message}` });
                    else if (typeof error.message == "object" && error.type == "ERROR")
                        res.status(500).json({ status: 500, message: `Payment failed. ${error.message["message"]}` });
                });
            }).catch(error => {
                logger.error(error);
                res.status(500).json({ status: 500, message: `Payment failed. ${error["message"]}` });
            });
        } else if (stripeCustomer != null && stripeCustomer.default_source != null && token == "" && nameOnCard == "" && !isUpdateCard) {
            await payForServices(stripeCustomer).then(result => res.status(200).json({ status: 200, message: result.message, invoice: result.invoice })).catch(error => {
                logger.error(error.message);

                if (typeof error.message == "string" && error.type == "WARNING")
                    res.status(403).json({ status: 403, message: `Payment was successfully made. ${error.message}` });
                else if (typeof error.message == "object" && error.type == "ERROR")
                    res.status(500).json({ status: 500, message: `Payment failed. ${error.message["message"]}` });
            });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({ status: 500, message: error });
    }
}

// Get orders.
exports.orders = async function (req, res) {
    const customerId = req.customer.id;
    const showOrder = req.query.order != undefined ? req.query.order : "";
    let orders = [], products = [], product = null;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });
        const customerOrders = await Order.find({ customer_id: customerId });

        for (const order of customerOrders) {
            products = [];

            for (const item of order.items) {
                product = await Product.findById(item.product_id);
                products.push(product);
            }

            orders.push({
                id: order.id,
                status: order.status,
                items: order.items,
                date: new Date(order.created_date).toUTCString(),
                products
            });
        }

        res.render("shop/orders", {
            title: "Orders",
            showOrder,
            customer,
            cart,
            orders
        });
    } catch (error) {
        logger.error(error);
    }
}