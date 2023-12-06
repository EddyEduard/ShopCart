const express = require("express");
const router = express.Router();

const index_router = require("./routes/index.router");
router.use("/", index_router);

const auth_router = require("./routes/auth.router");
router.use("/auth", auth_router);

const account_router = require("./routes/account.router");
router.use("/account", account_router);

const shop_router = require("./routes/shop.router");
router.use("/shop", shop_router);

module.exports = router;