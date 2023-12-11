const Joi = require("joi");

const Customer = require("../models/customer.model");
const Cart = require("../models/cart.model");

// Validation of the request data for customer profile.
exports.edit_profile = async (req, res, next) => {
    const schema = Joi.object({
        firstName: Joi.string()
            .min(3)
            .required()
            .messages({
                "string.empty": "The input 'First name' is not allowed to be empty.",
                "string.min": "The input 'First name' length must be at least 3 characters long.",
                "any.required": "The input 'First name' is required.",
            }),
        lastName: Joi.string()
            .min(3)
            .required()
            .messages({
                "string.empty": "The input 'Last name' is not allowed to be empty.",
                "string.min": "The input 'Last name' length must be at least 3 characters long.",
                "any.required": "The input 'Last name' is required.",
            }),
        email: Joi.string()
            .email()
            .required()
            .messages({
                "string.empty": "The input 'Email' is not allowed to be empty.",
                "string.email": "The input 'Email' must be a valid email.",
                "any.required": "The input 'Email' is required.",
            }),
        phone: Joi.string()
            .min(10)
            .messages({
                "string.empty": "The input 'Phone' is not allowed to be empty.",
                "string.min": "The input 'Phone' length must be at least 10 characters long.",
                "any.required": "The input 'Phone' is required.",
            }),
        image: Joi.string()
            .allow("")
    });

    const { error } = schema.validate(req.body);

    if (error) {
        const customer = await Customer.findById(req.customer.id);
        const cart = await Cart.findOne({ customer_id: req.customer.id });

        res.render("account/profile", {
            title: "Profile",
            typeError: "PROFILE",
            error: { status: 400, message: error.details[0] },
            isError: true,
            customer,
            cart
        });
    } else
        next();
}

// Validation of the request data for change password.
exports.change_password = async (req, res, next) => {
    const schema = Joi.object({
        oldPassword: Joi.string()
            .min(6)
            .required()
            .messages({
                "string.empty": "The input 'Old password' is not allowed to be empty.",
                "string.min": "The input 'Old password' length must be at least 6 characters long.",
                "any.required": "The input 'Old password' is required.",
            }),
        newPassword: Joi.string()
            .min(6)
            .required()
            .messages({
                "string.empty": "The input 'New password' is not allowed to be empty.",
                "string.min": "The input 'New password' length must be at least 6 characters long.",
                "any.required": "The input 'New password' is required.",
            }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        const customer = await Customer.findById(req.customer.id);
        const cart = await Cart.findOne({ customer_id: req.customer.id });

        res.render("account/profile", {
            title: "Profile",
            typeError: "PASSWORD",
            error: { status: 400, message: error.details[0] },
            isError: true,
            customer,
            cart
        });
    } else
        next();
}

// Validation of the request data for delete account.
exports.delete_account = async (req, res, next) => {
    const schema = Joi.object({
        deleteConfirm: Joi.string()
            .required()
            .regex(/DELETE/)
            .messages({
                "string.empty": "The input 'Delete confirm' is not allowed to be empty.",
                "string.pattern.base": "The input 'Delete confirm' must match the value 'DELETE'.",
                "any.required": "The input 'Delete confirm' is required.",
            })
    });

    const { error } = schema.validate(req.body);

    if (error) {
        const customer = await Customer.findById(req.customer.id);
        const cart = await Cart.findOne({ customer_id: req.customer.id });

        res.render("account/profile", {
            title: "Profile",
            typeError: "DELETE",
            error: { status: 400, message: error.details[0] },
            isError: true,
            customer,
            cart
        });
    } else
        next();
}

// Edit billing information.
exports.edit_billing = async (req, res, next) => {
    const schema = Joi.object({
        country: Joi.string()
            .required()
            .messages({
                "string.empty": "The input 'Country' is not allowed to be empty.",
                "string.min": "The input 'Country' length must be at least 5 characters long.",
                "any.required": "The input 'Country' is required.",
            }),
        state: Joi.string()
            .allow("")
            .allow(null),
        city: Joi.string()
            .min(3)
            .required()
            .messages({
                "string.empty": "The input 'City' is not allowed to be empty.",
                "string.min": "The input 'City' length must be at least 3 characters long.",
                "any.required": "The input 'City' is required.",
            }),
        street: Joi.string()
            .min(3)
            .required()
            .messages({
                "string.empty": "The input 'Street' is not allowed to be empty.",
                "string.min": "The input 'Street' length must be at least 10 characters long.",
                "any.required": "The input 'Street' is required.",
            }),
        postalCode: Joi.string()
            .min(5)
            .required()
            .messages({
                "string.empty": "The input 'Postal code' is not allowed to be empty.",
                "string.min": "The input 'Postal code' length must be at least 5 characters long.",
                "any.required": "The input 'Postal code' is required.",
            }),
        vatType: Joi.string()
            .allow("")
            .allow(null),
        vatCode: Joi.string()
            .allow("")
            .allow(null),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        const customer = await Customer.findById(req.customer.id);
        const cart = await Cart.findOne({ customer_id: req.customer.id });
        console.log(error)
        res.render("account/billing", {
            title: "Billing",
            typeError: "BILLING",
            error: { status: 400, message: error.details[0] },
            isError: true,
            customer,
            cart
        });
    } else
        next();
}