const { ipcRenderer } = require("electron");
const dayJs = require("dayjs");
// DOM
const prodInfo = document.querySelector("#prodInfo");
const exit = document.querySelector("#exit");
const totalRemainingValue = document.querySelector("#totalRemainingValue");
const printInventory = document.querySelector("#printInventory");

const prodSearch = document.querySelector("#prodSearch");

addEventListener("DOMContentLoaded", () => {
  getProductInfo();
});
prodSearch.addEventListener("input", (e) => {
  ipcRenderer.send("search-product", e.target.value);
});

// Variables
let products;
let arrayOfRemainingValueOfProduct = [];

// Events
exit.addEventListener("click", () => {
  window.close();
});

// Functions
const getProductInfo = () => {
  console.log("getting product ...");
  ipcRenderer.send("get-product-info", "get all product");
};

const showProductFlow = (id) => {
  ipcRenderer.send("get-product-flow", id);
  window.close();
};
const addProduct = (id) => {
  ipcRenderer.send("add-product", id);
  window.close();
};
const pulloutProd = (id) => {
  ipcRenderer.send("show-pullout-form", id);
  window.close();
};
const deleteProd = (id) => {
  ipcRenderer.send("delete-product", id);
};
const renderProductInfo = () => {
  prodInfo.innerHTML = "";
  arrayOfRemainingValueOfProduct = [];
  prodInfo.innerHTML = `<tr>
                            <th>Product Name</th>
                            <th>Expiry</th>
                            <th>COS</th>
                            <th>Selling Price</th>
                            <th>Add Stock</th>
                            <th>Stock Remaining</th>
                            <th>Stock Beggining</th>
                            <th>Sold</th>
                            <th>Pullout</th>
                            <th>Actions</th>
                        </tr>
                        `;
  products.forEach((product) => {
    arrayOfRemainingValueOfProduct.push(
      product.productCos * product.StockRemaining
    );
    prodInfo.innerHTML += `<tr>
                                <td class="clickable" onclick="showProductFlow('${
                                  product.productRef
                                }')">${product.productName}</td>
                                <td>${dayJs(product.productExpiry).format(
                                  "MMMM DD YYYY - dddd hh:mm:ss:A"
                                )}</td>
                                <td>${product.productCos}</td>
                                <td>${product.sellingPrice}</td>
                                <td>${product.add}</td>
                                <td>${product.StockRemaining}</td>
                                <td>${product.startStock}</td>
                                <td>${product.sold}</td>
                                <td>${product.pullout}</td>
                                <td class='actions'>
                                  <button onclick="addProduct('${
                                    product._id
                                  }')">Add</button>
                                  <button onclick="pulloutProd('${
                                    product._id
                                  }')">Pullout</button>
                                  <button onclick="deleteProd('${
                                    product._id
                                  }')">Delete</button>
                                </td>
                                </tr>`;
  });

  const totalValue = arrayOfRemainingValueOfProduct.reduce((a, c) => {
    return a + c;
  }, 0);
  totalRemainingValue.value = totalValue;
};

printInventory.addEventListener("click", () => {
  console.log("Printing Records...");

  const data = [
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
      value: "Kaycee Grocery App",
      style: `text-align:center;`,
      css: { "font-weight": "400", "font-size": "18px" },
    },
    {
      type: "text",
      value: "------------------------------------------",
      css: { "font-family": "Arial Rounded MT", "font-size": "12px" },
    },
  ];

  products.forEach((prod) =>
    data.push({
      type: "text",
      value: `${prod.productName} -${prod.StockRemaining}`,
      style: "text-align:center",
      css: { "font-weight": "400", "font-size": "14px" },
    })
  );

  ipcRenderer.send("print-inventory", JSON.stringify(data));
});

// IPC Listener
ipcRenderer.on("product-info", (e, args) => {
  const productInfo = JSON.parse(args);

  products = productInfo;

  renderProductInfo();
});
ipcRenderer.on("updated-productInfo", (e, args) => {
  const productInfo = JSON.parse(args);

  products = productInfo;

  renderProductInfo();
});
ipcRenderer.on("filtered-products", (e, args) => {
  const productInfo = JSON.parse(args);

  products = productInfo;

  renderProductInfo();
});
