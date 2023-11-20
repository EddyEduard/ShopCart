const express = require("express");
const router = express.Router();

const auth_middleware = require("../middlewares/auth.middleware");
const auth_controller = require("../controllers/auth.contoller");

router.post("/login", auth_middleware.login, auth_controller.login);

router.post("/register", auth_middleware.register, auth_controller.register);

module.exports = router;