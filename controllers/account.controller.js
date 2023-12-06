require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const lookup = require("country-code-lookup");
const bcrypt = require("bcrypt");
const pino = require("pino");

const Customer = require("../models/customer.model");
const Cart = require("../models/cart.model");
const Review = require("../models/review.model");

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
            typeError: null,
            isError: false,
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
            typeError: "BILLING",
            isError: false,
            customer,
            cart
        });
    } catch (error) {
        logger.error(error);
    }
}

// Edit profile.
exports.edit_profile = async function (req, res) {
    const customerId = req.customer.id;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const phone = req.body.phone;
    const image = req.body.image;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });
        const existEmail = await Customer.findOne({ email: email });

        if (existEmail != null && existEmail.id != customerId) {
            res.render("account/profile", {
                title: "Profile",
                typeError: "PROFILE",
                error: { status: 403, message: "There is a customer with this email address." },
                isError: true,
                customer,
                cart
            });
        } else {
            customer.first_name = firstName;
            customer.last_name = lastName;
            customer.email = email;
            customer.phone = phone;
            customer.image = image;

            await Customer.findByIdAndUpdate(customer.id, customer);

            res.redirect("/account/profile");
        }
    } catch (error) {
        logger.error(error);
    }
}

// Change password.
exports.change_password = async function (req, res) {
    const customerId = req.customer.id;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });

        if (await !bcrypt.compareSync(oldPassword, customer.password)) {
            res.render("account/profile", {
                title: "Profile",
                typeError: "PASSWORD",
                error: { status: 403, message: "The old password is incorect." },
                isError: true,
                customer,
                cart
            });
        } else {
            const salt = await bcrypt.genSaltSync();
            const hashPassword = await bcrypt.hashSync(newPassword, salt);
            customer.password = hashPassword;
            await Customer.findByIdAndUpdate(customer.id, customer);

            res.redirect("/account/profile");
        }
    } catch (error) {
        logger.error(error);
    }
}

// Delete account.
exports.delete_account = async function (req, res) {
    const customerId = req.customer.id;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });
        const reviews = await Review.find({ customer_id: customerId });

        for (const review of reviews)
            await Review.findByIdAndDelete(review.id);

        await Cart.findByIdAndDelete(cart.id);
        await Customer.findByIdAndDelete(customer.id);

        res.redirect("/auth/login");
    } catch (error) {
        logger.error(error);
    }
}

// Edit billing information.
exports.edit_billing = async function (req, res) {
    const customerId = req.customer.id;
    const country = req.body.country;
    const state = req.body.state;
    const city = req.body.city;
    const street = req.body.street;
    const postalCode = req.body.postalCode;
    const vatType = req.body.vatType;
    const vatCode = req.body.vatCode;

    try {
        const customer = await Customer.findById(customerId);
        const cart = await Cart.findOne({ customer_id: customerId });

        customer.address.country = country;
        customer.address.state = state;
        customer.address.city = city;
        customer.address.street = street;
        customer.address.postal_code = postalCode;
        customer.address.vat_type = vatType == "none" ? "" : vatType;
        customer.address.vat_code = vatCode;

        const stripeCustomers = await stripe.customers.search({
            query: `metadata[\'service\']:\'shopcart\' AND metadata[\'customer_id\']:\'${customer.id}\'`
        });
        let stripeCustomer = stripeCustomers.data.length > 0 ? stripeCustomers.data[0] : null;

        if (stripeCustomer != null) {
            await stripe.customers.update(stripeCustomer.id, {
                address: {
                    country: lookup.byCountry(customer.address.country)?.iso2,
                    state: customer.address.state,
                    city: customer.address.city,
                    line1: customer.address.street,
                    postal_code: customer.address.postal_code
                },
                email: customer.email,
                phone: customer.phone
            }).then(async () => {
                let taxIDValidated = true;

                if (customer.vat_type != "" && customer.vat_code != "") {
                    await stripe.customers.listTaxIds(
                        customer.id,
                        {
                            limit: 10
                        }
                    ).then(async taxIDs => {
                        if (taxIDs.data.find(x => x.type == customer.vat_type && x.value == customer.vat_code) == null) {
                            await stripe.customers.createTaxId(
                                stripeCustomer.id,
                                {
                                    type: customer.vat_type,
                                    value: customer.vat_code
                                }
                            ).then(async () => {
                                if (taxIDs.data.length > 0) {
                                    for await (const tax of taxIDs.data)
                                        await stripe.customers.deleteTaxId(customer.id, tax.id);
                                }
                            }).catch(error => {
                                taxIDValidated = false;
                                logger.error(error);

                                res.render("account/billing", {
                                    title: "Billing Information",
                                    typeError: "BILLING",
                                    isError: true,
                                    error: error.message,
                                    customer,
                                    cart
                                });
                            });
                        }
                    });
                } else {
                    await stripe.customers.listTaxIds(
                        customer.id,
                        {
                            limit: 10
                        }
                    ).then(async taxIDs => {
                        if (taxIDs.data.length > 0) {
                            for await (const tax of taxIDs.data)
                                await stripe.customers.deleteTaxId(customer.id, tax.id);
                        }
                    });
                }

                if (taxIDValidated)
                    await Customer.findByIdAndUpdate(customer.id, customer);
            });
        } else {
            await Customer.findByIdAndUpdate(customer.id, customer);

            res.render("account/billing", {
                title: "Billing Information",
                typeError: "BILLING",
                isError: false,
                customer,
                cart
            });
        }
    } catch (error) {
        logger.error(error);
    }
}
