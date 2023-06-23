const { ipcRenderer } = require("electron");
const cancel = document.querySelector("#cancel");
const getFundHistory = document.querySelector("#getFundHistory");
cancel.addEventListener("click", window.close);

const remainingValues = document.querySelector("#remainingValues");
const salesRecords = document.querySelector("#salesRecords");
const overAllTotal = document.querySelector("#overAllTotal");

// Handling form
const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const getFund = {
    saleRef: form.fundReason.value,
    dateTransact: new Date(),
    totalAmount: -form.getFundAmount.value,
    profit: 0,
  };
  const getFundTransactionData = {
    dateTransact: new Date(),
    reason: form.fundReason.value,
    amount: -form.getFundAmount.value,
    lastRemainingValueOfProduct: remainingValues.value,
    lastTotalSales: salesRecords.value,
    lastOverAll: overAllTotal.value,
  };

  ipcRenderer.send("new-getFund-record", getFund);
  ipcRenderer.send("save-getFund-transaction", getFundTransactionData);
});
getFundHistory.addEventListener("click", () => {
  ipcRenderer.send("show-fundHistory-window");
});

ipcRenderer.on("done-saving-transaction", (e, args) => {
  window.close();
});

// IPC

addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("get-all-sales-and-remaining-value-of-products");
});

let totalSales;
let totalRemainingValue;

ipcRenderer.on("all-data-report", (e, args) => {
  data = JSON.parse(args);
  totalSales = data.totalSalesData;
  totalRemainingValue = data.totalProductInfo;

  salesRecords.value = totalSales.reduce((a, b) => {
    return a + parseFloat(b.totalAmount);
  }, 0);

  remainingValues.value = totalRemainingValue.reduce((a, b) => {
    return a + b.productCos * b.StockRemaining;
  }, 0);

  overAllTotal.value =
    parseFloat(salesRecords.value) + parseFloat(remainingValues.value);
});
