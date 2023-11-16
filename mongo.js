const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1/kaycee-grocery-data")
  .then(() => console.log("Connected to database"))
  .catch((e) => console.log(e));
