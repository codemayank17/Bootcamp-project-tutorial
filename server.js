const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
//env setup
dotenv.config({ path: "./config/config.env" });
//connect to database
connectDB();
//express setup
const app = express();

//Bodyparser
app.use(express.json());

//logger middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Mount router
app.use("/api/v1/bootcamps", require("./api/v1/bootcamps"));

app.get("/", (req, res) => {
  res.send("Hello");
});

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
