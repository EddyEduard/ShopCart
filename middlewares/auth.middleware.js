const Joi = require("joi");

// Validation of the request data for customer login.
exports.login = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                "string.empty": "The input 'Email' is not allowed to be empty.",
                "string.email": "The input 'Email' must be a valid email.",
                "any.required": "The input 'Email' is required.",
            }),
        password: Joi.string()
            .min(6)
            .required()
            .messages({
                "string.empty": "The input 'Password' is not allowed to be empty.",
                "string.min": "The input 'Password' length must be at least 6 characters long.",
                "any.required": "The input 'Password' is required.",
            }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        res.render("auth/login", {
            title: "Sign In",
            error: { status: 400, message: error.details[0] },
            isError: true
        });
    } else
        next();
}

// Validation of the request data for customer register.
exports.register = (req, res, next) => {
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
        password: Joi.string()
            .min(6)
            .required()
            .messages({
                "string.empty": "The input 'Password' is not allowed to be empty.",
                "string.min": "The input 'Password' length must be at least 6 characters long.",
                "any.required": "The input 'Password' is required.",
            }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        res.render("auth/register", {
            title: "Sign Up",
            error: { status: 400, message: error.details[0] },
            isError: true
        });
    } else
        next();
}