const dayjs = require("dayjs");
const { ipcRenderer } = require("electron");
const { v4: uuidv4 } = require("uuid");

const newProductForm = document.querySelector("#newProductForm");
const returnBtn = document.querySelector("#returnBtn");

const barcode = document.querySelector("#barcode");
const productNameInput = document.querySelector("#productName");
const productExpiryInput = document.querySelector("#productExpiry");
const startStockInput = document.querySelector("#startStock");
const productCosInput = document.querySelector("#productCos");
const sellingPriceInput = document.querySelector("#sellingPrice");
const stockRemainingInput = document.querySelector("#remainingStock");
const txtWarn = document.querySelector("#txtWarn");

addEventListener("DOMContentLoaded", () => {
  console.log(dayjs(new Date()).format("YYYY-MM-DD"));
  const dateNow = dayjs(new Date()).format("YYYY-MM-DD");
  // productExpiryInput.value = "2024-01-25";
  productExpiryInput.value = dateNow;
  barcode.focus();
});
newProductForm.addEventListener("submit", (e) => {
  if (barcode && productNameInput) {
    e.preventDefault();
    const newProduct = {
      productRef: uuidv4(),
      barcode: barcode.value,
      productName: productNameInput.value,
      productExpiry: productExpiryInput.value,
      startStock: startStockInput.value,
      productCos: productCosInput.value,
      sellingPrice: sellingPriceInput.value,
      StockRemaining: stockRemainingInput.value,
      sold: 0,
      pullout: 0,
      add: 0
    };

    ipcRenderer.send("new-product-data", newProduct);

    newProductForm.reset();

    txtWarn.innerHTML = "Product Saved";
    txtWarn.style.display = "inline-block";

    setTimeout(() => {
      txtWarn.style.display = "none";
    }, 3000);
  } else {
    ipcRenderer.send(
      "getting-notication-data",
      "Please provide product information first."
    );
  }
});

returnBtn.addEventListener("click", () => {
  window.close();
});
