const express = require("express");
const router = express.Router();

const auth_middleware = require("../middlewares/auth.middleware");
const auth_controller = require("../controllers/auth.contoller");

router.get("/login", auth_controller.login_view);

router.get("/register", auth_controller.register_view);

router.post("/login", auth_middleware.login, auth_controller.login);

router.post("/register", auth_middleware.register, auth_controller.register);

router.get("/logout", auth_controller.logout);

module.exports = router;