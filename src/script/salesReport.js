const dayJS = require("dayjs");
const { ipcRenderer, dialog } = require("electron");
const ExcelJS = require("exceljs");
const dateTime = document.querySelector("#dateTime");
const salesRecordTable = document.querySelector("#salesRecordTable");
const exit = document.querySelector("#exit");

const totalAmount = document.querySelector("#totalAmount");
const totalProfit = document.querySelector("#totalProfit");
const totalDays = document.querySelector("#totalDays");

// const getFund = document.querySelector("#getFund");

const begDate = document.querySelector("#begDate");
const endDate = document.querySelector("#endDate");
const filterFlow = document.querySelector("#filterFlow");
const exportButton = document.querySelector("#exportButton");

const remainingValues = document.querySelector("#remainingValues");
const salesRecords = document.querySelector("#salesRecords");
const overAllTotal = document.querySelector("#overAllTotal");

let totalSales;
let totalRemainingValue;

const handleExportToExcel = () => {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("SALES", {
      properties: { tabColor: { argb: "0CC2000" } }
    });

    const capitalizeData = (data) => {
      const capitalizedDataArr = [];
      data.map((text) => {
        // Split the text into an array of words
        var words = text.split(" ");

        // Capitalize the first letter of each word
        var capitalizedWords = words.map(function (word) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        });

        // Join the capitalized words back into a single string
        var capitalizedText = capitalizedWords.join(" ");

        // Return the capitalized text

        capitalizedDataArr.push(capitalizedText);
      });

      return capitalizedDataArr;
    };

    // Exclude fields (_id and __v) when extracting column headers
    const headers = Object.keys(sales[0]).filter(
      (key) => !["_id", "__v"].includes(key)
    );

    const capitalizeHeaders = capitalizeData(headers);

    // Exclude fields (_id and __v) when mapping data objects to arrays of values

    const formattedRows = sales.map((row) => {
      const { dateTransact, ...rest } = row;
      const date = new Date(dateTransact);
      const formattedDate = date.toLocaleDateString();
      return { dateTransact: formattedDate, ...rest };
    });
    const rows = formattedRows.map(({ _id, __v, ...obj }) =>
      Object.values(obj)
    );

    // Title App
    const excelSalesTitle = sheet.getCell("A1");
    excelSalesTitle.font = { bold: true, size: 18 };
    excelSalesTitle.value = "Edz Conveniece Store Sales Reports";

    // Data computation
    const dateRange = sheet.getCell("A2");
    dateRange.font = { bold: true, size: 14 };
    dateRange.value = "Date Range:";
    const dateRangeFirst = sheet.getCell("B2");
    dateRangeFirst.font = { bold: true, size: 13, italic: true };
    // dateRangeFirst.value = `${firstDay} to ${Date.now()}`;
    dateRangeFirst.value = `${dayJS(firstDay).format("YYYY-MM-DD")} to ${dayJS(
      new Date()
    ).format("YYYY-MM-DD")}`;

    const totalSalesLabel = sheet.getCell("A3");
    totalSalesLabel.font = { bold: true, size: 14 };
    totalSalesLabel.value = "Total Sales:";
    const totalSales = sheet.getCell("B3");
    totalSales.font = { bold: true, size: 13, italic: true };
    totalSales.value = sales.reduce((a, b) => a + parseInt(b.totalAmount), 0);

    const totalProfitLabel = sheet.getCell("C3");
    totalProfitLabel.font = { bold: true, size: 14 };
    totalProfitLabel.value = "Total Profit:";
    const totalProfit = sheet.getCell("D3");
    totalProfit.font = { bold: true, size: 13, italic: true };
    totalProfit.value = sales.reduce((a, b) => a + parseInt(b.profit), 0);

    const headerRow = sheet.addRow(capitalizeHeaders);

    headerRow.font = { bold: true };

    sheet.columns[0].width = 50;
    sheet.columns[1].width = 30;
    sheet.columns[2].width = 30;
    sheet.columns[3].width = 30;
    // sheet.columns[4].width = 20;

    rows.forEach((rowData) => {
      sheet.addRow(rowData);
    });

    // Generate the Excel file
    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        if (buffer.byteLength == 0) return;

        // setIsSaving(true);
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Edz Convinence data - ${dayJS(firstDay).format(
          "YYYY-MM-DD"
        )} to ${dayJS(new Date()).format("YYYY-MM-DD")}.xlsx`;
        link.click();

        console.log("saving...");
      })
      .catch((error) => {
        console.log(error);
        // toast.error("Error saving excel file. =>" + error.message, {
        //   position: "top-center",
        //   containerId: "transactionsNofity"
        // });
      });
  } catch (e) {
    console.log(e);
    // toast.error("Error saving file. Select range with sales report to export", {
    //   position: "top-center",
    //   containerId: "transactionsNofity"
    // });
  }
};

exportButton.addEventListener("click", () => {
  console.log("exporting", begDate.value);
  handleExportToExcel();
  // ipcRenderer.send("exporting", {
  //   begDate: begDate.value,
  //   endDate: endDate.value,
  //   totalSales,
  // });
});

// getFund.addEventListener("click", () => {
//   console.log("getting fund form");

//   ipcRenderer.send("show-getFund-window");

//   window.close();
// });

// Global Variables
let sales;
const showOrderList = (ref) => {
  // ipcRenderer.send("show-orderlist-ref", ref);
  ipcRenderer.send("show-viewItemizedSales", ref);
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
    end: endDate.value + " 23:59:59"
  };
  console.log(begDate.value);
  console.log(endDate.value);
  ipcRenderer.send("get-sales", date);
};
const getTotalSalesAndRemaingValueOfProduct = () => {
  ipcRenderer.send("get-all-sales-and-remaining-value-of-products");
};

let now = new Date();
let date = new Date();
let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
// Events
addEventListener("DOMContentLoaded", () => {
  renderDateTime();

  now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 1);

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
    end: endDate.value + " 23:59:59"
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
