const express = require("express");
const router = express.Router();

const authorize_middleware = require("../middlewares/authorize.middleware");
const account_middleware = require("../middlewares/account.middleware");
const account_controller = require("../controllers/account.controller");

router.get("/profile", authorize_middleware.token, account_controller.profile);

router.get("/billing", authorize_middleware.token, account_controller.billing);

router.get("/payment-method", authorize_middleware.token, account_controller.payment_method);

module.exports = router;