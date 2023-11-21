require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pino = require("pino");

const Customer = require("../models/customer.model");
const Cart = require("../models/cart.model");

const logger = pino();

// Customer login page.
exports.login_view = async function (req, res) {
    res.render("auth/login", {
        title: "Sign In",
        isError: false
    });
}

// Customer registration page.
exports.register_view = async function (req, res) {
    res.render("auth/register", {
        title: "Sign Up",
        isError: false
    });
}

// Login customer.
exports.login = async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const customer = await Customer.findOne({ email: email });

        if (customer == null) {
            res.render("auth/login", {
                title: "Sign In",
                error: { status: 403, message: "The email address is incorect." },
                isError: true
            });
        } else {
            if (await !bcrypt.compareSync(password, customer.password)) {
                res.render("auth/login", {
                    title: "Sign In",
                    error: { status: 403, message: "The password is incorect." },
                    isError: true
                });
            } else {
                const paylod = { id: customer.id, email: customer.email };
                const token = await jwt.sign(paylod, process.env.AUTH_SECRET_KEY, { expiresIn: "24h" });
                const today = new Date();
                const expirationDate = new Date(today);
                expirationDate.setTime(today.getTime() + (24 * 60 * 60 * 1000));

                res.cookie("token", token, { expires: expirationDate, httpOnly: true })
                res.redirect("/shop/products");
            }
        }
    } catch (error) {
        logger.error(error);
    }
}

// Register customer.
exports.register = async function (req, res) {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;

    try {
        const customer = new Customer({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
            phone: "0000000000",
            address: {
                country: "",
                state: "",
                city: "",
                street: "",
                vat_type: "",
                vat_code: ""
            },
            card: {
                name: "",
                brand: "",
                last4: "",
                exp_month: -1,
                exp_year: -1
            },
            metadata: {
                has_payment_method_added: false
            },
            created_date: Date.now()
        });

        const existEmail = await Customer.findOne({ email: customer.email });

        if (existEmail != null) {
            res.render("auth/register", {
                title: "Sign Up",
                error: { status: 403, message: "There is a user with this email address." },
                isError: true
            });
        } else {
            const salt = await bcrypt.genSaltSync();
            customer.password = await bcrypt.hashSync(customer.password, salt);
            const newCustomer = await customer.save();

            await (new Cart({
                customer_id: newCustomer.id,
                items: []
            })).save();

            res.redirect("/auth/login");
        }
    } catch (error) {
        logger.error(error);
    }
}

// Customer logout.
exports.logout = function (req, res) {
    res.clearCookie("token");
    res.redirect("/auth/login");
}