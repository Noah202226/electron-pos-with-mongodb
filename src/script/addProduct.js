// Imports
const { ipcRenderer } = require("electron");
const dayJs = require("dayjs");

const form = document.querySelector("form");
const exitBtn = document.querySelector("#exitBtn");
const addStock = document.querySelector("#addStock");

// Events
exitBtn.addEventListener("click", () => window.close());

addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("get-product-details");
  addStock.value = 0;
  form.totalStock.value = 0;
  addStock.select();

  console.log(dayJs(new Date()).format("YYYY-MMMM-DD HH:MM:ss A"));
});
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (form.totalStock.value == 0 || form.totalStock.value == "") {
    console.log("nothing to update");
  } else {
    const updatedStock = {
      productRef: form.productRef.value,
      productName: form.productName.value,
      status: "Add Stock",
      qty: addStock.value,
      remaining: form.totalStock.value,
      date: dayJs(new Date()).format("YYYY-MMMM-DD HH:MM:ss A"),
    };
    ipcRenderer.send("add-product-qty", updatedStock);
    window.close();
  }
});
addStock.addEventListener("input", () => {
  form.totalStock.value =
    parseInt(form.stockRemain.value) + parseInt(addStock.value);
});

// IPC Listener
ipcRenderer.on("product-details", (e, args) => {
  console.log(JSON.parse(args));
  const prod = JSON.parse(args);

  const exp = prod.productExpiry;
  const exp2 = dayJs(exp).format("YYYY-MM-DD");
  console.log(exp2);

  form.productRef.value = prod.productRef;
  form.productExpiration.value = exp2;
  form.productName.value = prod.productName;
  form.stockBeggin.value = prod.startStock;
  form.stockRemain.value = prod.StockRemaining;
});
