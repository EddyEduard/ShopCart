const express = require("express");
const router = express.Router();

const authorize_middleware = require("../middlewares/authorize.middleware");
const account_middleware = require("../middlewares/account.middleware");
const account_controller = require("../controllers/account.controller");

router.get("/profile", authorize_middleware.token, account_controller.profile);

router.post("/profile", authorize_middleware.token, account_middleware.edit_profile, account_controller.edit_profile);

router.post("/change_password", authorize_middleware.token, account_middleware.change_password, account_controller.change_password);

router.delete("/profile", authorize_middleware.token, account_middleware.delete_account, account_controller.delete_account);

router.get("/billing", authorize_middleware.token, account_controller.billing);

router.post("/billing", authorize_middleware.token, account_middleware.edit_billing, account_controller.edit_billing);

module.exports = router;