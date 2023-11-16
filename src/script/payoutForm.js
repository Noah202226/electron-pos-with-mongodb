const dayjs = require("dayjs");
const { ipcRenderer } = require("electron");

const cancel = document.querySelector("#cancel");
const payoutForm = document.querySelector("#payoutForm");
const totalAmountInput = document.querySelector("#totalAmount");
const recievedAmountInput = document.querySelector("#recievedAmount");
const changeAmountInput = document.querySelector("#changeAmount");

let saleData;
let orders;
let refNo;

cancel.addEventListener("click", () => {
  window.close();
});

addEventListener("DOMContentLoaded", () => {
  recievedAmountInput.focus();

  recievedAmountInput.addEventListener("input", (e) => {
    if (
      parseInt(recievedAmountInput.value) < parseInt(totalAmountInput.value)
    ) {
      changeAmountInput.value = 0;
    } else {
      changeAmountInput.value =
        parseInt(e.target.value) - parseInt(totalAmountInput.value);
    }
  });
  ipcRenderer.send("get-sale-data");
  ipcRenderer.send("get-ref-no");
  ipcRenderer.send("get-order-data");
});
payoutForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Electron printer
  const data = [
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
      value: "EDZ Convenience Store",
      style: `text-align:center;`,
      css: {
        "font-weight": "400",
        "font-size": "14px",
        "font-family": "Arial Rounded MT",
      },
    },
    {
      type: "text",
      value: "------------------------------------------",
      css: { "font-family": "Arial Rounded MT", "font-size": "12px" },
    },
    {
      type: "text",
      style: `text-align:center;`,
      value: `Reference #: ${refNo}`,
      css: { "font-family": "Arial Rounded MT", "font-size": "12px" },
    },

    {
      type: "text",
      value: dayjs(new Date()).format("MMMM DD YYYY dddd - hh:mm:ss:a"),
      style: "text-align: center",
      css: { "font-family": "Arial Rounded MT", "font-size": "12px" },
    },
    {
      type: "text",
      value: "------------------------------------------",
      css: { "font-family": "Arial Rounded MT", "font-size": "12px" },
    },
    {
      type: "table",
      // style the table
      style: "border: 1px solid #ddd",
      css: {
        "font-weight": "100",
        "font-size": " 12px",
        "font-family": "Arial Rounded MT",
      },
      // list of the columns to be rendered in the table header
      tableHeader: ["Qty", "Product", "Price", "Amount"],
      // multi dimensional array depicting the rows and columns of the table body
      tableBody: orders,
      // list of columns to be rendered in the table footer
      tableFooter: [" ", " ", "TOTAL", totalAmountInput.value],
      // custom style for the table header
      tableHeaderStyle: "background-color: white; color: #000;",
      // custom style for the table body
      tableBodyStyle: "border: 1px solid #ddd",
    },
    {
      type: "text",
      value: `Amount Recieved: ${recievedAmountInput.value}`,
      style: "text-align: right",
      css: { "font-family": "Arial Rounded MT", "font-size": "12px" },
    },
    {
      type: "text",
      value: `Change: ${changeAmountInput.value}`,
      style: "text-align: right",
      css: { "font-family": "Arial Rounded MT", "font-size": "12px" },
    },
    {
      type: "text",
      value: "------------------------------------------",
      css: { "font-family": "Arial Rounded MT", "font-size": "12px" },
    },
    {
      type: "text",
      value: "Thank you, Come again.",
      css: {
        "font-weight": "400",
        "font-size": "12px",
        "font-family": "Arial Rounded MT",
      },
      style: "text-align:center",
    },
    {
      type: "text",
      value: "0933-923-0301",
      css: {
        "font-weight": "400",
        "font-size": "12px",
        "font-family": "Arial Rounded MT",
      },
      style: "text-align:center",
    },
  ];
  console.log(orders[0]);
  ipcRenderer.send("print", JSON.stringify(data));
  ipcRenderer.send("new-sale-record", saleData);
  window.close();
});
ipcRenderer.on("ref-no", (e, args) => {
  console.log(args);
  refNo = args;
});
ipcRenderer.on("orders-info", (e, args) => {
  console.log(args);
  orders = args;
});

ipcRenderer.on("payout-data", (e, args) => {
  console.log(args);
  saleData = args;
  totalAmountInput.value = args.totalAmount;
});
