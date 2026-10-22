require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const morgan = require("morgan");

const routes = require("./routes");
const notFound = require("./middleware/notFound");
const connectDB = require("./config/db");
const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(cors({
    origin: "*",
}));
app.use(compression());

app.use(express.json({ limit: "11mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("combined"));

app.use("/", routes);

// Connect Database
connectDB();

// API Routes
app.use("/api", require("./routes/authRoutes"));
app.use("/api/patients", require("./routes/patientRoutes"));


app.use(notFound);

module.exports = app;