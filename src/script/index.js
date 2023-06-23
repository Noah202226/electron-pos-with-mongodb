const { ipcRenderer } = require("electron");
const dayJs = require("dayjs");

const exitApp = document.querySelector("#exitApp");
const minimizeApp = document.querySelector("#minimizeApp");
const showProducts = document.querySelector("#showProducts");
const itemListBtn = document.querySelector("#itemListBtn");
const pulloutBtn = document.querySelector("#pulloutBtn");

const user = document.querySelector("#User");
const newProductBtn = document.querySelector("#newProductBtn");
const salesReportBtn = document.querySelector("#salesReportBtn");
const payoutBtn = document.querySelector("#payoutBtn");
const dateTime = document.querySelector("#datetime");
const salesListTable = document.querySelector("#salesListTable");

let qtyOfOrderInput = document.querySelector("#qtyOfOrder");
const totalAmountInput = document.querySelector("#totalAmount");
const totalProfitInput = document.querySelector("#totalProfit");
const alertText = document.querySelector("#alertText");
let idrefNo = document.querySelector("#idrefNo");

const digits = document.querySelectorAll("button.digit");
const cButton = document.querySelector("button.clear");

const barcode = document.querySelector("#barcode");
barcode.addEventListener("keyup", (e) => {
  if (e.key == "Enter" || e.keyCode === 13) {
    console.log("Searching for product...");
    ipcRenderer.send("send-qty-of-order", qtyOfOrderInput.value);
    ipcRenderer.send("find-barcode", barcode.value);
    barcode.value = "";
    barcode.focus();
  }
});

const openDrawer = document.querySelector("#openDrawer");
openDrawer.addEventListener("click", () => {
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
    {
      type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
      value: "OPEN DRAWER",
      style: `text-align:center;`,
      css: { "font-weight": "400", "font-size": "20px" },
    },
  ];

  ipcRenderer.send("open-drawer", JSON.stringify(data));
});

console.log(digits);
digits.forEach((digit) => {
  digit.addEventListener("click", (e) => {
    console.log(e.target.innerHTML);
    qtyOfOrderInput.value = qtyOfOrderInput.value + e.target.innerHTML;
  });
});
cButton.addEventListener("click", () => {
  qtyOfOrderInput.value = null;
});

// Variables
let sales;

// fuctions
const renderDateTime = () => {
  dateTime.innerHTML = dayJs(new Date()).format(
    "MMMM DD YYYY dddd - hh:mm:ss a"
  );
  setTimeout("renderDateTime()", 1000);
};
const UIdata = () => {
  ipcRenderer.send("get-ui-data", idrefNo.innerHTML);
};

const voidItem = (id, qty) => {
  const voidData = {
    prodId: id,
    currentRef: idrefNo.innerHTML,
    qtyOfOrder: qty,
  };
  console.log(voidData);
  ipcRenderer.send("void-product", voidData);
};
const renderSale = () => {
  salesListTable.innerHTML = "";
  salesListTable.innerHTML = `
                              <tr>
                                <th>QTY</td>
                                <th>Product Name</td>
                                <th>Price</td>
                                <th>Total</td>
                              </tr>
                              `;
  sales.map((sale) => {
    salesListTable.innerHTML += `
                        <tr>
                          <td>${sale.quantityOfOrder}</td>
                          <td onclick="voidItem('${sale._id}','${sale.quantityOfOrder}')">${sale.productName}</td>
                          <td>${sale.price}</td>
                          <td>${sale.totalAmount}</td>
                        </tr>
                      `;
  });
  const totalAmountOfOrder = sales.reduce((a, c) => {
    return a + c.totalAmount;
  }, 0);
  const totalProfitOfOrder = sales.reduce((a, c) => {
    return a + c.profit;
  }, 0);

  totalAmountInput.value = totalAmountOfOrder;
  totalProfitInput.value = totalProfitOfOrder;
  console.log(totalProfitOfOrder, totalAmountOfOrder);
};

// Events
addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("queing-user", "getting user");
  renderDateTime();
  UIdata();
  qtyOfOrderInput.value = 1;

  barcode.focus();
});
newProductBtn.addEventListener("click", () => {
  console.log("showing new product form");
  ipcRenderer.send("show-newProduct-form", "show new product form");
});
salesReportBtn.addEventListener("click", () => {
  ipcRenderer.send("show-salesReport-form");
});
pulloutBtn.addEventListener("click", () => {
  ipcRenderer.send("show-pullout-record");
});
exitApp.addEventListener("click", () => {
  ipcRenderer.send("exit-app");
});
minimizeApp.addEventListener("click", () => ipcRenderer.send("minimize-app"));

showProducts.addEventListener("click", () => {
  if (
    qtyOfOrderInput.value == 0 ||
    qtyOfOrderInput.value == "0" ||
    qtyOfOrderInput.value == "" ||
    qtyOfOrderInput.value == null
  ) {
    alertText.innerHTML = "No Quantity of Order";

    setTimeout(() => {
      alertText.style.display = "none";
      alertText.innerHTML = null;
    }, 3000);
  } else {
    const saleinfo = {
      qtyOfOrder: qtyOfOrderInput.value,
      refIdNo: idrefNo.innerHTML,
    };
    ipcRenderer.send("show-products", saleinfo);
  }
});
itemListBtn.addEventListener("click", () => {
  if (sales.length != 0) {
    alertText.innerHTML = "Finish Transaction first to view product list";
    setTimeout(() => {
      alertText.style.display = "none";
    }, 3000);
  } else {
    ipcRenderer.send("show-product-info-window", "get all products");
  }
});
payoutBtn.addEventListener("click", () => {
  if (totalAmountInput.value != 0) {
    const saleData = {
      saleRef: idrefNo.innerHTML,
      dateTransact: new Date(),
      totalAmount: totalAmountInput.value,
      profit: totalProfitInput.value,
    };
    // Orders Data
    const ordersLength = salesListTable.rows.length;
    console.log(ordersLength);
    let orders = [];
    for (i = 1; i < ordersLength; i++) {
      var cells = salesListTable.rows.item(i).cells;
      console.log(cells);

      var cellLength = cells.length;
      let order = [];
      for (var j = 0; j < cellLength; j++) {
        var cellVal = cells.item(j).innerHTML;

        console.log(`Row ${i}, Column ${j}: Value ${cellVal}`);

        if (j < 4) {
          console.log(`Push ${cellVal}`);
          order.push(cellVal);
        }
      }
      orders.push(order);
    }

    console.log(orders);

    ipcRenderer.send("show-payout-form", saleData);
    ipcRenderer.send("orders-data", JSON.stringify(orders));
  } else {
    console.log("no transactions");
  }
});

// IPC Listener
ipcRenderer.on("ref-data", (e, args) => {
  console.log(args);
  const dataRef = JSON.parse(args);

  dataRef.forEach((data) => {
    console.log(data);
    idrefNo.innerHTML = data.refIdNo;
  });

  ipcRenderer.send("get-sales-by-ref", idrefNo.innerHTML);
});

ipcRenderer.on("sales-by-ref", (e, args) => {
  const salesbyRef = JSON.parse(args);
  sales = salesbyRef;
  console.log(sales);
  renderSale();
});

ipcRenderer.on("updated-list-of-order", (e, args) => {
  const updatedOrderOfSales = JSON.parse(args);
  sales = updatedOrderOfSales;
  renderSale();
});