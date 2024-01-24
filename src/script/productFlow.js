const dayjs = require("dayjs");
const { ipcRenderer } = require("electron");

const barcode = document.querySelector("#barcode");
const productName = document.querySelector("#productName");
const expiry = document.querySelector("#expiry");
const productCos = document.querySelector("#productCos");
const sellingPrice = document.querySelector("#sellingPrice");
const stockRemain = document.querySelector("#stockRemain");
const prodFlowTable = document.querySelector("#prodFlowTable");
const updateproductBtn = document.querySelector("#updateproductBtn");
const exit = document.querySelector("#exit");

let prodFlow;
let productId;
// Functions
const getdata = () => {
  ipcRenderer.send("get-productflow-data");
};
const renderProductFlow = () => {
  prodFlowTable.innerHTML = "";
  prodFlowTable.innerHTML = `<tr>
                              <th>ProductName</th>
                              <th>Status</th>
                              <th>Quantity</th>
                              <th>Remaining</th>
                              <th>Date of transaction</th>
                            </tr>`;
  prodFlow.forEach((data) => {
    prodFlowTable.innerHTML += `<tr>
                              <td>${data.productName}</td>
                              <td>${data.status}</td>
                              <td>${data.qty}</td>
                              <td>${data.remaining}</td>
                              <td>${dayjs(data.date).format(
                                "MMMM-DD:YYYY hh:mm:ss:a"
                              )}</td>
                          </tr>`;
  });
  // const flows = document.querySelectorAll("th");
  // console.log(flows);
};

// Events
addEventListener("DOMContentLoaded", () => {
  getdata();
});
exit.addEventListener("click", () => window.close());

updateproductBtn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("updating ...");
  const newProductInfo = {
    thisProductID: productId,
    newBarcode: barcode.value,
    newProductName: productName.value,
    newProductExpiry: expiry.value,
    newProductCos: productCos.value,
    newSellingPrice: sellingPrice.value
  };
  ipcRenderer.send("update-product", JSON.stringify(newProductInfo));

  window.close();
});

// IPC Lister
ipcRenderer.on("product-data", (e, args) => {
  const data = JSON.parse(args);
  data.map((prod) => {
    console.log(prod);
    productId = prod._id;
    barcode.value = prod.barcode;
    productName.value = prod.productName;
    expiry.value = dayjs(prod.productExpiry).format("YYYY-MM-DD");
    productCos.value = prod.productCos;
    sellingPrice.value = prod.sellingPrice;
    stockRemain.value = prod.StockRemaining;
  });
});

ipcRenderer.on("productflow-data", (e, args) => {
  prodFlow = JSON.parse(args);

  renderProductFlow();
});
