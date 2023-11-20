const express = require("express");
const router = express.Router();

const shop_middleware = require("../middlewares/shop.middleware");
const shop_controller = require("../controllers/shop.controller");

router.get("/products", shop_controller.products);

module.exports = router;