require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pino = require("pino");

const Customer = require("../models/customer.model");
const Cart = require("../models/cart.model");

const logger = pino();

// Customer login.
exports.login = async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const customer = await Customer.findOne({ email: email });

        if (customer == null)
            res.status(403).json({ status: 403, message: "The email address is incorect." });
        else {
            if (await !bcrypt.compareSync(password, customer.password))
                res.status(403).json({ status: 403, message: "The password is incorect." });
            else {
                const paylod = { id: customer.id, email: customer.email };
                const token = await jwt.sign(paylod, process.env.AUTH_SECRET_KEY, { expiresIn: "24h" });
                const today = new Date();
                const expirationDate = new Date(today);
                expirationDate.setTime(today.getTime() + (24 * 60 * 60 * 1000));

                res.status(200).json({ token: token, expire_date: expirationDate.getTime() });
            }
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({ status: 500, message: "Login failed." });
    }
}

// Customer registration.
exports.register = async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const customer = new Customer({
            first_name: "",
            last_name: "",
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

        if (existEmail != null)
            res.status(403).json({ status: 403, message: "There is a user with this email address." });
        else {
            const salt = await bcrypt.genSaltSync();
            customer.password = await bcrypt.hashSync(customer.password, salt);
            const newCustomer = await customer.save();

            const cart = new Cart({
                customer_id: newCustomer.id,
                items: []
            });

            const newCart = cart.save();

            res.status(201).json({ newCustomer, newCart });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({ status: 500, message: "Failed registration." });
    }
}
