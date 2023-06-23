const dayJS = require("dayjs");
const { ipcRenderer } = require("electron");

const exitbtn = document.querySelector("#exitbtn");
exitbtn.addEventListener("click", () => {
  window.close();
});
const begDate = document.querySelector("#begDate");
const endDate = document.querySelector("#endDate");

const pulloutTable = document.querySelector("#pulloutTable");

addEventListener("DOMContentLoaded", () => {
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
  const dateValue = {
    beg: begDate.value + " 00:00:00",
    end: endDate.value + " 11:59:59",
  };

  ipcRenderer.send("get-pullout-record", dateValue);
  renderPullouts();
});
let pullouts;

const renderPullouts = () => {
  pulloutTable.innerHTML = "";
  pulloutTable.innerHTML = `
                                  <tr>
                                      <th>Product Name</th>
                                      <th>Pullout Qty</th>
                                      <th>Reason</th>
                                      <th>COS</th>
                                      <th>Date</th>
                                  </tr>
      `;
  pullouts.forEach((data) => {
    pulloutTable.innerHTML += `
                                  <tr>
                                    <td>${data.productName}</td>
                                    <td>${data.pulloutQty}</td>
                                    <td>${data.pulloutReason}</td>
                                    <td>Follow up</td>
                                    <td>${dayJS(data.dateTransact).format(
                                      "MMMM DD YYYY dddd - hh:mm:ss:a"
                                    )}</td>
                                  </tr>
          `;
  });
  const totalAmountAll = pullouts.reduce((a, c) => {
    return a + parseFloat(c.totalAmount);
  }, 0);
  const totalProfitAll = pullouts.reduce((a, c) => {
    return a + c.profit;
  }, 0);

  totalProfit.value = totalProfitAll;
  totalAmount.value = totalAmountAll;
  totalDays.value = sales.length;
};

ipcRenderer.on("filterd-pullout-records", (e, args) => {
  data = JSON.parse(args);
  pullouts = data;

  renderPullouts();
});
