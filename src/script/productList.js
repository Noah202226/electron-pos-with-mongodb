const { ipcRenderer } = require("electron");

const returnBtn = document.querySelector("#returnBtn");
const buttonsContainer = document.querySelector("#buttonsContainer");
const qtyOfOrder = document.querySelector("#qtyOfOrder");
const prodSearch = document.querySelector("#prodSearch");

const totalItemsCount = document.querySelector("#totalItemsCount");

document.addEventListener('DOMContentLoaded', () => {
  prodSearch.focus()
})

// Variables
let refno;
// Functions
const getProducts = () => {
  ipcRenderer.send("getting-products");
};
// Events
returnBtn.addEventListener("click", () => {
  window.close();
});

addEventListener("DOMContentLoaded", () => {
  getProducts();
});
prodSearch.addEventListener("input", (e) => {
  ipcRenderer.send("search-product", e.target.value);
});

let lastProductList;
let searchProductList;
// Listener
ipcRenderer.on("all-products", (e, args) => {
  const products = JSON.parse(args);
  console.log(products);
  lastProductList = products;

  products.forEach((product) => {
    let btn = document.createElement("button");
    btn.innerText = `${product.productName} - Onstock: ${product.StockRemaining}`;
    btn.setAttribute("id", product._id);
    btn.addEventListener("click", () => {
      const productID = btn.getAttribute("id");
      ipcRenderer.send("find-product", productID);
      window.close();
    });
    buttonsContainer.appendChild(btn);
  });

  totalItemsCount.textContent = products.length;
});
ipcRenderer.on("filtered-products", (e, args) => {
  lastProductList.forEach((btn) => {
    try {
      let button = document.getElementById(btn._id);
      button.remove();
    } catch (err) {
      console.log(err);
    }
  });

  const filteredProducts = JSON.parse(args);
  searchProductList = filteredProducts;

  searchProductList.forEach((product) => {
    let btn = document.createElement("button");
    btn.innerText = `${product.productName} - Onstock: ${product.StockRemaining}`;
    btn.setAttribute("id", product._id);
    btn.addEventListener("click", () => {
      const productID = btn.getAttribute("id");
      ipcRenderer.send("find-product", productID);
      window.close();
    });
    buttonsContainer.appendChild(btn);
  });

  totalItemsCount.textContent = searchProductList.length;
});

ipcRenderer.on("quatity-of-order", (e, args) => (qtyOfOrder.value = args));
ipcRenderer.on("ref-id-no", (e, args) => {
  refno = args;
});
