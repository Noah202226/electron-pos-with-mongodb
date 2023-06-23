const dayJS = require("dayjs");
const { ipcRenderer } = require("electron");

const dateTime = document.querySelector("#dateTime");
const salesRecordTable = document.querySelector("#salesRecordTable");
const exit = document.querySelector("#exit");

const totalAmount = document.querySelector("#totalAmount");
const totalProfit = document.querySelector("#totalProfit");
const totalDays = document.querySelector("#totalDays");

const getFund = document.querySelector("#getFund");

const begDate = document.querySelector("#begDate");
const endDate = document.querySelector("#endDate");
const filterFlow = document.querySelector("#filterFlow");

const remainingValues = document.querySelector("#remainingValues");
const salesRecords = document.querySelector("#salesRecords");
const overAllTotal = document.querySelector("#overAllTotal");

getFund.addEventListener("click", () => {
  console.log("getting fund form");

  ipcRenderer.send("show-getFund-window");

  window.close();
});

// Global Variables
let sales;
const showOrderList = (ref) => {
  ipcRenderer.send("show-orderlist-ref", ref);
};

// Functions
const renderDateTime = () => {
  dateTime.innerHTML = dayJS(new Date()).format(
    "MMMM DD YYYY dddd - hh:mm:ss:a"
  );
  setTimeout(() => {
    renderDateTime();
  }, 1000);
};
const renderSales = () => {
  salesRecordTable.innerHTML = "";
  salesRecordTable.innerHTML = `
                                <tr>
                                    <th>Date</th>
                                    <th>Reference Number</th>
                                    <th>Total Amount</th>
                                    <th>Profit</th>
                                </tr>
    `;
  sales.forEach((data) => {
    salesRecordTable.innerHTML += `
                                <tr>
                                    <td>${dayJS(data.dateTransact).format(
                                      "MMMM DD YYYY dddd - hh:mm:ss:a"
                                    )}</td>
                                    <td onclick="showOrderList('${
                                      data.saleRef
                                    }')">${data.saleRef}</td>
                                    <td>${data.totalAmount}</td>
                                    <td>${data.profit}</td>
                                </tr>
        `;
  });
  const totalAmountAll = sales.reduce((a, c) => {
    return a + parseFloat(c.totalAmount);
  }, 0);
  const totalProfitAll = sales.reduce((a, c) => {
    return a + c.profit;
  }, 0);

  totalProfit.value = totalProfitAll;
  totalAmount.value = totalAmountAll;
  totalDays.value = sales.length;
};

let orderslist;
ipcRenderer.on("orderlist-on-this-ref", (e, args) => {
  orderslist = JSON.parse(args);
  renderOrderlist();
});
const ordersTable = document.querySelector("#ordersTable");
const renderOrderlist = () => {
  ordersTable.innerHTML = "";
  ordersTable.innerHTML = `<tr>
                              <th>Reference</th>
                              <th>QTY</th>
                              <th>ProductName</th>
                              <th>Price</th>
                              <th>Total</th>
                            </tr>`;
  orderslist.forEach((order) => {
    ordersTable.innerHTML += `<tr>

                                <td>${order.productRef}</td>
                                <td>${order.quantityOfOrder}</td>
                                <td>${order.productName}</td>
                                <td>${order.price}</td>
                                <td>${order.totalAmount}</td>
    </tr>`;
  });
};
const getSales = () => {
  const date = {
    beg: begDate.value + " 00:00:00",
    end: endDate.value + " 23:59:59",
  };
  console.log(begDate.value);
  console.log(endDate.value);
  ipcRenderer.send("get-sales", date);
};
const getTotalSalesAndRemaingValueOfProduct = () => {
  ipcRenderer.send("get-all-sales-and-remaining-value-of-products");
};

// Events
addEventListener("DOMContentLoaded", () => {
  renderDateTime();

  let now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 1);

  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  console.log(firstDay);

  // endDate.value = now.toISOString().slice(0, 16);
  // beginDate.value = firstDay.toISOString().slice(0, 16);

  endDate.value = dayJS(now).format("YYYY-MM-DD");
  begDate.value = dayJS(firstDay).format("YYYY-MM-DD");
  console.log(begDate.value);
  console.log(endDate.value);

  getSales();
  getTotalSalesAndRemaingValueOfProduct();
});
exit.addEventListener("click", () => {
  window.close();
});
filterFlow.addEventListener("click", () => {
  const date = {
    beg: begDate.value + " 00:00:00",
    end: endDate.value + " 11:59:59",
  };
  console.log(date.beg);
  console.log(date.end);
  ipcRenderer.send("get-sales", date);
});

// IPC Listener
ipcRenderer.on("sales-data", (e, args) => {
  const salesData = JSON.parse(args);
  sales = salesData;
  console.log(sales);
  renderSales();
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
