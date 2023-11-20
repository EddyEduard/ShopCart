const Joi = require("joi")

// Validation of the request data for user login.
exports.login = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required(),
        password: Joi.string()
            .min(6)
            .required(),
    });

    const { error } = schema.validate(req.body);

    if (error)
        res.status(400).json({ code: 400, message: error.details[0].message });
    else
        next();
}

// Validation of the request data for user registration.
exports.register = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required(),
        password: Joi.string()
            .min(6)
            .required(),
    });

    const { error } = schema.validate(req.body);

    if (error)
        res.status(400).json({ code: 400, message: error.details[0].message });
    else
        next();
}