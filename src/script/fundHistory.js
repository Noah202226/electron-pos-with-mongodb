const { ipcRenderer } = require("electron");
const dayJS = require("dayjs");
const closeWindow = document.querySelector("#closeWindow");

const historyTable = document.querySelector("#historyTable");

// Events
addEventListener("DOMContentLoaded", () => {
  let now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 1);

  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

  // endDate.value = now.toISOString().slice(0, 16);
  // beginDate.value = firstDay.toISOString().slice(0, 16);

  endDate.value = dayJS(now).format("YYYY-MM-DD");
  begDate.value = dayJS(firstDay).format("YYYY-MM-DD");

  getFundTransactions();
});

closeWindow.addEventListener("click", () => {
  window.close();
});

const getFundTransactions = () => {
  const date = {
    beg: begDate.value,
    end: endDate.value,
  };
  ipcRenderer.send("get-fund-transactions", date);
};
let transactions;
// Listener
ipcRenderer.on("filterdFundTrasactions", (e, args) => {
  const data = JSON.parse(args);
  transactions = data;

  historyTable.innerHTML = "";
  historyTable.innerHTML = `
        <tr>
            <th>Date Transact</th>
            <th>Reason</th>
            <th>Amount</th>
            <th>Last Remaining Value of Product</th>
            <th>Last Total Sales</th>
            <th>Last Overall total</th>
        </tr>
    `;
  transactions.forEach((trans) => {
    historyTable.innerHTML += `
        <tr>
            <td>${dayJS(trans.dateTransact).format("YYYY-MM-DD")}</td>
            <td>${trans.reason}</td>
            <td>${trans.amount}</td>
            <td>${trans.lastRemainingValueOfProduct}</td>
            <td>${trans.lastTotalSales}</td>
            <td>${trans.lastOverAll}</td>
        </tr>
      `;
  });
});
