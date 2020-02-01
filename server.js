const express = require("express");
const dotenv = require("dotenv");
//env setup
dotenv.config({ path: "./config/config.env" });
//express setup
const app = express();

const PORT = process.env.PORT || 5555;

app.listen(
  PORT,
  console.log(
    `Server started in ${process.env.NODE_ENV} enviornment and port ${PORT}`
  )
);
