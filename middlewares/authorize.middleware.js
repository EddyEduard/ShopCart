const jwt = require("jsonwebtoken");

require("dotenv").config();

// Authorization users after login in application.
exports.token = function (req, res, next) {
    const token = req.cookies["token"];

    if (token == null)
        res.redirect("/auth/login");

    jwt.verify(token, process.env.AUTH_SECRET_KEY, (error, data) => {
        if (error)
            res.redirect("/auth/login");
        else {
            req.customer = data;
            next();
        }
    });
}