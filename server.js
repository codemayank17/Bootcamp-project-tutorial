const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
//env setup
dotenv.config({ path: "./config/config.env" });
//express setup
const app = express();

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

app.listen(
  PORT,
  console.log(
    `Server started in ${process.env.NODE_ENV} enviornment and port ${PORT}`
  )
);
