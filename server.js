const express = require("express");
const http = require("http");
const cors = require("cors");
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
app.use(express.static("./public"));

app.set("view engine", "ejs");

// Main router API.

const router = require("./router");
app.use("/", router);

// Server implementation.

server.listen(process.env.PORT, _ => {
    logger.info("Server running...");
});