const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const pino = require("pino");

const app = express();
const server = http.createServer(app);

const logger = pino();

require("dotenv").config();

// Connect to MongoDB database.

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on("error", error => logger.error(error));
db.once("open", () => logger.info("Connected to database."));

// App settings.

app.use(cors({
    optionsSuccessStatus: 200
}));
app.use(express.text({
    limit: "10gb",
    extended: true
}));
app.use(express.urlencoded({
    limit: "10gb",
    extended: true
}));
app.use(express.json({
    limit: "10gb",
    extended: true
}));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(express.static("./public"));

app.set("view engine", "ejs");

// Main router API.

const router = require("./router");
app.use("/", router);

// Import helpers.

const helpers_for = {
    faker: require("./helpers/faker.helper")
};

// Server implementation.

server.listen(process.env.PORT, async _ => {

    // const customers = await helpers_for.faker.generateRandomCustomers(30, true);

    // const products = await helpers_for.faker.generateRandomProducts(100, true);

    // const reviews = await helpers_for.faker.generateRandomReviewForProducts(150, customers, products, true);

    logger.info("Server running...");
});