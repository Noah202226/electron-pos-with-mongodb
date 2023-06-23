const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/kaycee-grocery-data")
  .then(() => console.log("Connected to database"))
  .catch((e) => console.log(e));
