const Joi = require("joi")

// Validation of the request data in the payment claim.
exports.checkout_payment = (req, res, next) => {
    const schema = Joi.object({
        token: Joi.string()
            .pattern(new RegExp("(tok)[_]")).rule({ message: "Invalid token id." })
            .allow("")
            .required(),
        nameOnCard: Joi.string()
            .allow("")
            .required()
    });

    const { error } = schema.validate(req.body);

    if (error)
        res.status(400).json({ code: 400, message: error.details[0].message });
    else
        next();
}