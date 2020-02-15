const express = require("express");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const dotenv = require("dotenv");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const morgan = require("morgan");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const path = require("path");

//env setup
dotenv.config({ path: "./config/config.env" });

//connect to database
connectDB();

//express setup
const app = express();

//CORS
app.use(cors());

//static folder
app.use(express.static(path.join(__dirname, "public")));

//Bodyparser
app.use(express.json());

//express-mongo-sanitize
app.use(mongoSanitize());

//helmet
app.use(helmet());

//XSS-Clean
app.use(xss());

//Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10m
  max: 100
});
app.use(limiter);

//Prevent Http param pollution
app.use(hpp());

//logger middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//cookieparser
app.use(cookieParser());

//File upload middleware
app.use(fileupload());

//Mount routers
app.use("/api/v1/bootcamps", require("./api/v1/bootcamps"));
app.use("/api/v1/courses", require("./api/v1/courses"));
app.use("/api/v1/auth", require("./api/v1/auth"));
app.use("/api/v1/users", require("./api/v1/users"));
app.use("/api/v1/reviews", require("./api/v1/reviews"));

//errorHandler
app.use(errorHandler);

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "index.html"));
// });

const PORT = process.env.PORT || 5555;

const server = app.listen(
  PORT,
  console.log(
    `Server started in ${process.env.NODE_ENV} enviornment and port ${PORT}`
  )
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
