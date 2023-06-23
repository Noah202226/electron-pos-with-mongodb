const dayjs = require("dayjs");
const { ipcRenderer } = require("electron");

const close = document.querySelector("#close");
const form = document.querySelector("form");
const pulloutQty = document.querySelector("#pulloutQty");

close.addEventListener("click", (e) => {
  window.close();
});

// getting the id of product to pullout
addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("getproductID-to-pullout");
});

// auto calc the new remaining stock
pulloutQty.addEventListener("input", (e) => {
  if (parseInt(form.stockRemain.value) < e.target.value) {
    console.log("Error. pullout quantity is over to the stock remaining");
  } else {
    form.newStockRemain.value = form.stockRemain.value - e.target.value;
  }
});

ipcRenderer.on("product-to-pullout", (e, args) => {
  const data = JSON.parse(args);
  console.log(data);

  form.productid.value = data._id;
  form.productName.value = data.productName;
  form.stockRemain.value = data.StockRemaining;
});

// sending data
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const pulloutData = {
    productID: form.productid.value,
    productName: form.productName.value,
    stockRemaining: form.stockRemain.value,
    pulloutQty: form.pulloutQty.value,
    newStock: form.newStockRemain.value,
    pulloutReason: form.pulloutReason.value,
    date: new Date(),
  };

  ipcRenderer.send("pullout-data", pulloutData);

  window.close();
});
