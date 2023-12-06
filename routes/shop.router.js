const express = require("express");
const router = express.Router();

const authorize_middleware = require("../middlewares/authorize.middleware");
const shop_middleware = require("../middlewares/shop.middleware");
const shop_controller = require("../controllers/shop.controller");

router.get("/products", authorize_middleware.token, shop_controller.products);

router.get("/products/:id", authorize_middleware.token, shop_controller.product);

router.post("/products/:id", authorize_middleware.token, shop_controller.add_product_to_cart);

router.get("/cart", authorize_middleware.token, shop_controller.cart);

router.put("/cart/:id", authorize_middleware.token, shop_controller.change_product_quantity_to_cart);

router.delete("/cart/:id", authorize_middleware.token, shop_controller.remove_product_from_cart);

router.get("/checkout", authorize_middleware.token, shop_controller.checkout);

router.post("/checkout", authorize_middleware.token, shop_middleware.checkout_payment, shop_controller.checkout_payment);

router.get("/orders", authorize_middleware.token, shop_controller.orders);

module.exports = router;