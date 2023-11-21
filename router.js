const express = require("express");
const router = express.Router();

// const index_router = require("./routers/index.router");
// router.use("/", index_router);

const auth_router = require("./routers/auth.router");
router.use("/auth", auth_router);

const account_router = require("./routers/account.router");
router.use("/account", account_router);

const shop_router = require("./routers/shop.router");
router.use("/shop", shop_router);

module.exports = router;