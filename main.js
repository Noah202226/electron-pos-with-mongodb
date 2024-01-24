const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");

const { PosPrinter } = require("electron-pos-printer");
const dayJs = require("dayjs");

const ExcelJS = require("exceljs");

// Models
const User = require("./src/models/User");
const Product = require("./src/models/Product");
const SalesItemized = require("./src/models/SalesItemized");
const IncrementOnSale = require("./src/models/incrementOnSale");
const SaleRecord = require("./src/models/salesRecord");
const ProductFlow = require("./src/models/productFlow");
const Pullout = require("./src/models/Pullout");
const GetFundTransaction = require("./src/models/getFundTransaction");

require("./mongo");

// Global Variables
let user;
let orders;

function createAndOpenExcelFile(beg, end, arrayofsales) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sales");

  // Add data to specific cells
  worksheet.getCell("A1").value = "Sales Report";
  worksheet.getCell("B1").value = "Date";
  worksheet.getCell("C1").value = beg;
  worksheet.getCell("D1").value = end;

  worksheet.getRow("1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF91D2FF" },
    bgColor: { argb: "FF91D2FF" }
  };
  worksheet.getRow("1").font = {
    size: 14
  };

  worksheet.getColumn("A").width = 30;
  worksheet.getColumn("B").width = 50;
  worksheet.getColumn("C").width = 20;
  worksheet.getColumn("D").width = 20;

  worksheet.getCell("A2").alignment = {
    vertical: "middle",
    horizontal: "center"
  };
  worksheet.getCell("B2").alignment = {
    vertical: "middle",
    horizontal: "center"
  };
  worksheet.getCell("A3").alignment = {
    vertical: "middle",
    horizontal: "center"
  };
  worksheet.getCell("B3").alignment = {
    vertical: "middle",
    horizontal: "center"
  };
  worksheet.getCell("A2").value = "Total Sales Amount:";
  worksheet.getCell("B2").value = arrayofsales.reduce((a, b) => {
    return a + parseFloat(b.totalAmount);
  }, 0);
  worksheet.getCell("B2").font = {
    name: "Comic Sans MS",
    family: 4,
    size: 12,
    underline: true,
    bold: true
  };

  worksheet.getCell("A3").value = "Total Profit:";
  worksheet.getCell("B3").value = arrayofsales.reduce((a, b) => {
    return a + parseFloat(b.profit);
  }, 0);
  worksheet.getCell("B3").font = {
    name: "Comic Sans MS",
    family: 4,
    size: 12,
    underline: true,
    bold: true
  };

  // Add headers
  const headers = ["Reference", "Transaction Date", "Total Amount", "Profit"];
  worksheet.addRow(headers);
  worksheet.getRow("4").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFF00" },
    bgColor: { argb: "F21000FF" }
  };

  // Add data from the totalSales array
  arrayofsales.forEach((sale) => {
    const rowData = [
      sale.saleRef,
      sale.dateTransact,
      sale.totalAmount,
      sale.profit
    ];
    worksheet.addRow(rowData);
  });

  // Set the height of specific rows (rows 1 and 2)
  worksheet.getRow(2).height = 30;
  worksheet.getRow(3).height = 25;

  dialog
    .showSaveDialog({
      title: "Save Excel File",
      defaultPath: `EDZ Sales Report - ${beg} - ${end} .xlsx`,
      filters: [{ name: "Excel Files", extensions: ["xlsx"] }]
    })
    .then((result) => {
      if (!result.canceled && result.filePath) {
        workbook.xlsx
          .writeFile(result.filePath)
          .then(() => {
            console.log("Excel file saved successfully!");
            openExcelFile(result.filePath);
          })
          .catch((error) => {
            console.error("Error saving Excel file:", error);
          });
      }
    });
}

function openExcelFile(filePath) {
  // Use Electron's shell module to open the file with the default application
  shell
    .openPath(filePath)
    .then(() => {
      console.log("Excel file opened successfully!");
    })
    .catch((error) => {
      console.error("Error opening Excel file:", error);
    });
}

ipcMain.on("exporting", (e, args) => {
  console.log("message:", args);

  createAndOpenExcelFile(args.begDate, args.endDate, args.totalSales);
});

ipcMain.on("show-notification", (e, args) => {
  const win = new BrowserWindow({
    frame: false,
    modal: true,
    width: 500,
    height: 200,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: false,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  win.data = args;
  win.webContents.send("notification-data", "this data is from main");
  win.loadFile("./src/html/notification.html");

  ipcMain.on("getting-notication-data", (e, args) => {
    e.reply("notification-data", win.data);
  });

  console.log(win.data);

  setTimeout(() => {
    win.close();
  }, 3000);
});

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: false,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  const loginWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: false,
      contextIsolation: false,
      enableRemoteModule: true
    },
    modal: true,
    parent: mainWindow
  });

  console.log(mainWindow.webContents.getPrinters());

  mainWindow.loadFile("./src/html/index.html");
  loginWindow.loadFile("./src/html/login.html");

  const newProductWindow = () => {
    const win = new BrowserWindow({
      frame: false,
      modal: true,
      parent: mainWindow,
      width: 500,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    win.loadFile("./src/html/newProduct.html");
  };
  const productsList = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    win.loadFile("./src/html/productsList.html");
  };
  const productsInfoWindow = () => {
    const productInfo = new BrowserWindow({
      frame: false,
      modal: true,
      parent: mainWindow,
      fullscreen: true,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    productInfo.loadFile("./src/html/productInfo.html");
  };
  const payoutFormWindow = () => {
    const win = new BrowserWindow({
      frame: false,
      modal: true,
      parent: mainWindow,
      height: 600,
      width: 500,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    win.loadFile("./src/html/payoutForm.html");
  };
  const salesReportWindow = () => {
    const win = new BrowserWindow({
      fullscreen: true,
      frame: false,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    win.loadFile("./src/html/salesReport.html");
  };
  const addProduct = () => {
    const win = new BrowserWindow({
      width: 600,
      height: 700,
      frame: false,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    win.loadFile("./src/html/addProduct.html");
  };
  const productFlowWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    win.loadFile("./src/html/productFlow.html");
  };
  const pulloutFormWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    win.loadFile("./src/html/pulloutForm.html");
  };
  // IPC

  ipcMain.on("check-user", async (e, args) => {
    const auth = await User.find({ uname: args.uname, upass: args.upass });
    if (auth.length == 0) {
      e.reply("login-failed", auth);
    } else {
      e.reply("login-success", auth);
      loginWindow.close();
    }
  });
  ipcMain.on("queing-user", async (e, args) => {
    e.reply("current-user", user);
  });

  let refIdNo;

  let qtyOfOrder;
  let onstock;
  let soldOnProduct;

  let productToVoid;
  let voidQty;

  ipcMain.on("getting-products", async (e, args) => {
    const data = await Product.find();

    e.reply("all-products", JSON.stringify(data));
    e.reply("quatity-of-order", qtyOfOrder);
    e.reply("ref-id-no", refIdNo);
  });
  ipcMain.on("search-product", async (e, args) => {
    const data = await Product.find({
      productName: { $regex: args, $options: "i" }
    });
    e.reply("filtered-products", JSON.stringify(data));
  });

  // new punch product goes here.
  ipcMain.on("find-product", async (e, args) => {
    const product = await Product.find({ _id: args });

    console.log(`QTY of order: ${qtyOfOrder}`);
    console.log(`Sales itemized ref id: ${refIdNo}`);

    const findedProduct = await SalesItemized.findOne({
      productRef: refIdNo
    });

    if (findedProduct) {
      console.log("product find on current sales" + findedProduct);

      // add new flow
      product.map(async (p) => {
        onstock = p.StockRemaining - qtyOfOrder;

        const productFlow = {
          productRef: p.productRef,
          productName: p.productName,
          status: "Update sales itemized quantity and Sold",
          qty: qtyOfOrder,
          remaining: onstock,
          date: new Date()
        };

        const newProductFlow = new ProductFlow(productFlow);
        newProductFlow
          .save()
          .then((data) => console.log(data))
          .catch((e) => console.log(e));

        const newQuantity =
          parseInt(findedProduct.quantityOfOrder) + parseInt(qtyOfOrder);
        console.log(newQuantity);

        await SalesItemized.findOneAndUpdate(
          { productRef: refIdNo },
          {
            quantityOfOrder: newQuantity,
            totalAmount: parseInt(newQuantity) * parseInt(findedProduct.price)
          }
        );
        console.log("sales itemized is now updated");
        SalesItemized.find({
          productRef: refIdNo
        })
          .then((d) =>
            mainWindow.webContents.send(
              "updated-list-of-order",
              JSON.stringify(d)
            )
          )
          .catch((e) => console.log(e));
      });
      await Product.findOneAndUpdate(
        { _id: args },
        { $set: { StockRemaining: onstock, sold: soldOnProduct } }
      )
        .then(() => {
          console.log("product updated on new quantity in list");
        })
        .catch((error) => {
          console.log("Error updating product on list", error);
        });
    } else {
      product.map((p) => {
        onstock = p.StockRemaining - qtyOfOrder;
        soldOnProduct = p.sold + parseInt(qtyOfOrder);

        const sales = {
          productRef: refIdNo,
          quantityOfOrder: qtyOfOrder,
          productName: p.productName,
          price: p.sellingPrice,
          totalAmount: qtyOfOrder * p.sellingPrice,
          profit: (p.sellingPrice - p.productCos) * qtyOfOrder
        };
        const productFlow = {
          productRef: p.productRef,
          productName: p.productName,
          status: "Sold",
          qty: qtyOfOrder,
          remaining: onstock,
          date: new Date()
        };

        const newProductFlow = new ProductFlow(productFlow);
        newProductFlow
          .save()
          .then((data) => console.log(data))
          .catch((e) => console.log(e));

        const newSale = new SalesItemized(sales);
        newSale
          .save()
          .then((data) => {
            SalesItemized.find({
              productRef: refIdNo
            })
              .then((d) =>
                mainWindow.webContents.send(
                  "updated-list-of-order",
                  JSON.stringify(d)
                )
              )
              .catch((e) => console.log(e));
          })
          .catch((e) => console.log(e));
      });

      const productUpdated = await Product.findOneAndUpdate(
        { _id: args },
        { $set: { StockRemaining: onstock, sold: soldOnProduct } }
      );
    }
  });

  ipcMain.on("send-qty-of-order", (e, args) => {
    qtyOfOrder = args;
  });

  // New punch by barcode is here.
  ipcMain.on("find-barcode", async (e, args) => {
    const product = await Product.find({ barcode: args });

    console.log("finding using barcode: " + product);

    if (product.length == 0) {
      console.log("product not find!.");
      e.reply("barcord-not-found", "barcord not found");
    } else {
      console.log(`QTY of order: ${qtyOfOrder}`);
      console.log(`Sales itemized ref id: ${refIdNo}`);

      const findedProduct = await SalesItemized.findOne({
        productRef: refIdNo
      });

      if (findedProduct) {
        console.log("product find on current sales" + findedProduct);

        // add new flow
        product.map(async (p) => {
          onstock = p.StockRemaining - qtyOfOrder;

          const productFlow = {
            productRef: p.productRef,
            productName: p.productName,
            status: "Update sales itemized quantity and Sold",
            qty: qtyOfOrder,
            remaining: onstock,
            date: new Date()
          };

          const newProductFlow = new ProductFlow(productFlow);
          newProductFlow
            .save()
            .then((data) => console.log(data))
            .catch((e) => console.log(e));

          const newQuantity =
            parseInt(findedProduct.quantityOfOrder) + parseInt(qtyOfOrder);
          console.log(newQuantity);

          await SalesItemized.findOneAndUpdate(
            { productRef: refIdNo },
            {
              quantityOfOrder: newQuantity,
              totalAmount: parseInt(newQuantity) * parseInt(findedProduct.price)
            }
          );
          console.log("sales itemized is now updated");
          SalesItemized.find({
            productRef: refIdNo
          })
            .then((d) =>
              mainWindow.webContents.send(
                "updated-list-of-order",
                JSON.stringify(d)
              )
            )
            .catch((e) => console.log(e));
        });
        await Product.findOneAndUpdate(
          { barcode: args },
          { $set: { StockRemaining: onstock, sold: soldOnProduct } }
        )
          .then(() => {
            console.log("product updated on new quantity in list");
          })
          .catch((error) => {
            console.log("Error updating product on list", error);
          });
      } else {
        product.map((p) => {
          onstock = p.StockRemaining - qtyOfOrder;
          soldOnProduct = p.sold + parseInt(qtyOfOrder);

          const sales = {
            productRef: refIdNo,
            quantityOfOrder: qtyOfOrder,
            productName: p.productName,
            price: p.sellingPrice,
            totalAmount: qtyOfOrder * p.sellingPrice,
            profit: (p.sellingPrice - p.productCos) * qtyOfOrder
          };
          const productFlow = {
            productRef: p.productRef,
            productName: p.productName,
            status: "Sold",
            qty: qtyOfOrder,
            remaining: onstock,
            date: new Date()
          };

          const newProductFlow = new ProductFlow(productFlow);
          newProductFlow
            .save()
            .then((data) => console.log(data))
            .catch((e) => console.log(e));

          const newSale = new SalesItemized(sales);
          newSale
            .save()
            .then((data) => {
              SalesItemized.find({
                productRef: refIdNo
              })
                .then((d) =>
                  mainWindow.webContents.send(
                    "updated-list-of-order",
                    JSON.stringify(d)
                  )
                )
                .catch((e) => console.log(e));
            })
            .catch((e) => console.log(e));
        });

        const productUpdated = await Product.findOneAndUpdate(
          { barcode: args },
          { $set: { StockRemaining: onstock, sold: soldOnProduct } }
        );
      }
    }
  });
  // Show windows
  ipcMain.on("show-newProduct-form", (e, args) => {
    newProductWindow();
  });

  // Show pullout form
  let pulloutID;
  ipcMain.on("show-pullout-form", (e, args) => {
    pulloutID = args;
    pulloutFormWindow();
  });
  // Pullout Product
  let pulloutQTY;
  let pullouts;
  let productStock;
  let prodRef;
  ipcMain.on("getproductID-to-pullout", async (e, args) => {
    const prod = await Product.findById(pulloutID);
    pullouts = prod.pullout;
    productStock = prod.StockRemaining;
    prodRef = prod.productRef;

    console.log(pulloutQTY, productStock);

    e.reply("product-to-pullout", JSON.stringify(prod));
  });
  ipcMain.on("pullout-data", async (e, args) => {
    const newPullout = new Pullout(args);
    pulloutQTY = args.pulloutQty;
    let newPulloutQty = parseInt(pullouts) + parseInt(args.pulloutQty);
    let newStock = parseInt(productStock) - parseInt(args.pulloutQty);

    newPullout
      .save()
      .then((data) => console.log(data))
      .catch((e) => console.log(e));

    const productFlow = {
      productRef: prodRef,
      productName: args.productName,
      status: "Pullout",
      qty: pulloutQTY,
      remaining: newStock,
      date: args.date
    };

    const updatedProduct = await Product.findByIdAndUpdate(args.productID, {
      $set: { pullout: newPulloutQty, StockRemaining: newStock }
    });

    const newProductFlow = new ProductFlow(productFlow);
    newProductFlow
      .save()
      .then((data) => console.log(data))
      .catch((e) => console.log(e));

    productsInfoWindow();
  });

  ipcMain.on("show-products", async (e, args) => {
    console.log(args);
    refIdNo = args.refIdNo;
    qtyOfOrder = args.qtyOfOrder;
    productsList();
  });
  ipcMain.on("show-salesReport-form", (e, args) => {
    salesReportWindow();
  });

  let addProductRef;
  let addStockValue;
  ipcMain.on("add-product", (e, args) => {
    addProductRef = args;
    addProduct();
  });
  ipcMain.on("get-product-details", async (e, args) => {
    const productInfo = await Product.findById(addProductRef);
    addStockValue = productInfo.add;

    e.reply("product-details", JSON.stringify(productInfo));
  });
  ipcMain.on("add-product-qty", async (e, args) => {
    let newStock = parseInt(addStockValue) + parseInt(args.qty);
    console.log(newStock);
    const updatedProduct = await Product.updateOne(
      { productRef: args.productRef },
      { $set: { add: newStock, StockRemaining: args.remaining } }
    );
    console.log(updatedProduct);

    const addProductFlow = new ProductFlow(args);

    addProductFlow
      .save()
      .then((data) => {
        console.log(data);
        productsInfoWindow();
      })
      .catch((e) => console.log(e));
  });

  let productData;
  let productFlow;
  ipcMain.on("get-product-flow", async (e, args) => {
    const data = await Product.find({ productRef: args });
    const flows = await ProductFlow.find({ productRef: args });
    productData = JSON.stringify(data);
    productFlow = JSON.stringify(flows);
    productFlowWindow();
  });
  ipcMain.on("get-productflow-data", async (e, args) => {
    e.reply("product-data", productData);
    e.reply("productflow-data", productFlow);
  });

  // Delete product
  ipcMain.on("delete-product", async (e, args) => {
    const deletedProd = await Product.findByIdAndDelete(args);
    const updatedProductInfo = await Product.find();
    e.reply("updated-productInfo", JSON.stringify(updatedProductInfo));
  });

  ipcMain.on("get-ui-data", async (e, args) => {
    const UIdata = await IncrementOnSale.find();

    e.reply("ref-data", JSON.stringify(UIdata));
  });
  ipcMain.on("get-sales-by-ref", async (e, args) => {
    refIdNo = args;
    const itemDataByRef = await SalesItemized.find({ productRef: args });
    e.reply("sales-by-ref", JSON.stringify(itemDataByRef));
  });
  ipcMain.on(
    "get-all-sales-and-remaining-value-of-products",
    async (e, args) => {
      const totalSales = await SaleRecord.find();
      const productsInfo = await Product.find();
      const allData = {
        totalSalesData: totalSales,
        totalProductInfo: productsInfo
      };
      e.reply("all-data-report", JSON.stringify(allData));
    }
  );

  ipcMain.on("get-sales", async (e, args) => {
    console.log(args);
    const sales = await SaleRecord.find({
      dateTransact: { $gte: args.beg, $lte: args.end }
    });
    e.reply("sales-data", JSON.stringify(sales));
  });
  ipcMain.on("show-product-info-window", async (e, args) => {
    productsInfoWindow();
  });

  let payoutData;
  ipcMain.on("show-payout-form", (e, args) => {
    payoutFormWindow();

    payoutData = args;
  });
  ipcMain.on("get-sale-data", (e, args) => {
    e.reply("payout-data", payoutData);
  });

  ipcMain.on("new-sale-record", async (e, args) => {
    const newSaleRecord = new SaleRecord(args);
    console.log(refIdNo);
    const increment = parseInt(refIdNo) + 1;

    newSaleRecord
      .save()
      .then((data) => {
        console.log(data);
      })
      .catch((e) => console.log(e));
    console.log(increment);
    const up = await IncrementOnSale.findOneAndUpdate(
      { name: "autoRef" },
      { refIdNo: increment }
    );
    console.log(up);

    const UIdata = await IncrementOnSale.find();
    console.log(UIdata);
    mainWindow.webContents.send("ref-data", JSON.stringify(UIdata));
  });

  ipcMain.on("new-getFund-record", async (e, args) => {
    const newGetFund = new SaleRecord(args);

    newGetFund
      .save()
      .then((data) => {
        console.log(data);
        e.reply("done-save-getFund");
        salesReportWindow();
      })
      .catch((e) => console.log(e));
  });
  ipcMain.on("save-getFund-transaction", async (e, args) => {
    const newGetFundTransaction = new GetFundTransaction(args);
    newGetFundTransaction
      .save()
      .then((data) => {
        console.log(data);
        e.reply("done-saving-transaction");
      })
      .catch((e) => console.log(e));
  });
  ipcMain.on("get-fund-transactions", async (e, args) => {
    const filterdFundTrasactions = await GetFundTransaction.find({
      dateTransact: {
        $gte: args.beg,
        $lte: args.end
      }
    });

    e.reply("filterdFundTrasactions", JSON.stringify(filterdFundTrasactions));
  });

  ipcMain.on("get-product-info", async (e, args) => {
    const productInfo = await Product.find();

    e.reply("product-info", JSON.stringify(productInfo));
  });

  // Deleting Data
  ipcMain.on("void-product", async (e, args) => {
    const data = await SalesItemized.findByIdAndDelete(args.prodId);

    console.log("Data deleted: " + data);
    productToVoid = data.productName;

    const productData = await Product.find({ productName: productToVoid });
    voidQty = data.quantityOfOrder;
    console.log(productData);

    let ProductRef;
    productData.forEach((prod) => {
      console.log(prod);
      onstock = prod.StockRemaining + parseInt(voidQty);
      soldOnProduct = prod.sold - parseInt(voidQty);
      ProductRef = prod.productRef;
    });

    const updatedList = await SalesItemized.find({
      productRef: args.currentRef
    });

    const productUpdated = await Product.findOneAndUpdate(
      { productName: productToVoid },
      { $set: { StockRemaining: onstock, sold: soldOnProduct } }
    );
    console.log(productUpdated);

    console.log(ProductRef);
    const productFlow = {
      productRef: ProductRef,
      productName: data.productName,
      status: "Void Product",
      qty: voidQty,
      remaining: onstock,
      date: new Date()
    };

    const voidProduct = new ProductFlow(productFlow);
    voidProduct
      .save()
      .then((saved) => console.log(saved))
      .catch((e) => console.log(e));

    e.reply("updated-list-of-order", JSON.stringify(updatedList));
  });
  // Saving New Data
  ipcMain.on("new-product-data", async (e, args) => {
    console.log(args);
    const productFlow = {
      productRef: args.productRef,
      productName: args.productName,
      status: "New Entry",
      qty: args.startStock,
      remaining: args.startStock,
      date: new Date()
    };
    const newProduct = new Product(args);
    const newProductFlow = new ProductFlow(productFlow);
    const result = await newProduct.save();
    const resultFlow = await newProductFlow.save();

    console.log(result);
    console.log(resultFlow);
  });

  // getting pullout record
  ipcMain.on("get-pullout-record", async (e, args) => {
    console.log(args);
    const filteredPulloutRecord = await Pullout.find({
      date: { $gte: args.beg, $lte: args.end }
    });
    // const filteredPulloutRecord = await Pullout.find();

    console.log(filteredPulloutRecord);

    e.reply("filterd-pullout-records", JSON.stringify(filteredPulloutRecord));
  });

  // showing orders in ref
  ipcMain.on("show-orderlist-ref", async (e, args) => {
    console.log(args);
    const orders = await SalesItemized.find({ productRef: args });
    e.reply("orderlist-on-this-ref", JSON.stringify(orders));
  });

  // get funding
  const getFundWindow = () => {
    win = new BrowserWindow({
      width: 500,
      height: 500,
      frame: false,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    win.loadFile("./src/html/getFund.html");
  };
  const fundHistoryWindow = () => {
    win = new BrowserWindow({
      width: 900,
      height: 600,
      frame: false,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    win.loadFile("./src/html/fundHistory.html");
  };
  const pulloutRecordWindow = () => {
    win = new BrowserWindow({
      width: 900,
      height: 600,
      frame: false,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    win.loadFile("./src/html/pulloutRecord.html");
  };

  ipcMain.on("show-getFund-window", (e, args) => {
    getFundWindow();
  });
  ipcMain.on("show-fundHistory-window", () => {
    fundHistoryWindow();
  });
  ipcMain.on("show-pullout-record", () => {
    pulloutRecordWindow();
  });

  // Electron pos print
  ipcMain.on("print", (e, args) => {
    const data = JSON.parse(args);
    const options = {
      preview: false, // Preview in window or print
      width: "200px", //  width of content body
      margin: "0 0 0 0", // margin of content body
      copies: 1, // Number of copies to print
      printerName: "POS58 Printer", // printerName: string, check with webContent.getPrinters()
      timeOutPerLine: 400,
      pageSize: { height: 301000, width: 48000 }, // page size
      silent: true
    };
    console.log("printing ...");
    PosPrinter.print(data, options)
      .then(() => {})
      .catch((e) => console.log(e));
  });
  ipcMain.on("open-drawer", (e, args) => {
    const data = JSON.parse(args);
    const options = {
      preview: false, // Preview in window or print
      width: "250px", //  width of content body
      margin: "-10 0 0 0", // margin of content body
      copies: 1, // Number of copies to print
      printerName: "POS-58", // printerName: string, check with webContent.getPrinters()
      timeOutPerLine: 400,
      pageSize: { height: 301000, width: 71000 }, // page size
      silent: true
    };
    console.log("printing ...");
    PosPrinter.print(data, options)
      .then(() => {})
      .catch((e) => console.log(e));
  });
  ipcMain.on("print-inventory", (e, args) => {
    const data = JSON.parse(args);
    // console.log(data);
    // const newFilteredProducts = [];
    // data.forEach((prod) => {
    //   newFilteredProducts.push({
    //     "Product Name": prod.productName,
    //     "Stock Remaining": prod.StockRemaining,
    //   });
    // });
    // console.log(newFilteredProducts);
    const options = {
      preview: false, // Preview in window or print
      width: "200px", //  width of content body
      margin: "0 0 0 0", // margin of content body
      copies: 1, // Number of copies to print
      printerName: "POS58 Printer", // printerName: string, check with webContent.getPrinters()
      timeOutPerLine: 400,
      pageSize: { height: 301000, width: 48000 }, // page size
      silent: true
    };
    console.log("printing records...");
    PosPrinter.print(data, options)
      .then(() => {})
      .catch((e) => console.log(e));
  });
  // Electron pos print
  ipcMain.on("print-bills", (e, args) => {
    const data = JSON.parse(args);
    const options = {
      preview: false, // Preview in window or print
      width: "200px", //  width of content body
      margin: "0 0 0 0", // margin of content body
      copies: 1, // Number of copies to print
      printerName: "POS58 Printer", // printerName: string, check with webContent.getPrinters()
      timeOutPerLine: 400,
      pageSize: { height: 301000, width: 48000 }, // page size
      silent: true
    };
    console.log("printing bills counter...");
    PosPrinter.print(data, options)
      .then(() => {})
      .catch((e) => console.log(e));
  });

  ipcMain.on("get-ref-no", (e, args) => {
    e.reply("ref-no", refIdNo);
  });
  ipcMain.on("orders-data", (e, args) => {
    orders = JSON.parse(args);
  });
  ipcMain.on("get-order-data", (e, args) => {
    e.reply("orders-info", orders);
  });

  // Update Product
  ipcMain.on("update-product", async (e, args) => {
    console.log(args);
    const data = JSON.parse(args);
    const productUpdated = await Product.findOneAndUpdate(
      { _id: data.thisProductID },
      {
        $set: {
          barcode: data.newBarcode,
          productName: data.newProductName,
          productExpiry: data.newProductExpiry,
          productCos: data.newProductCos,
          sellingPrice: data.newSellingPrice
        }
      }
    );

    console.log(productUpdated);
    productsInfoWindow();
  });

  ipcMain.on("reload-main", (e, args) => {
    const mainWindow = new BrowserWindow({
      fullscreen: true,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        nativeWindowOpen: false,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });
    mainWindow.loadFile("./src/html/index.html");
  });

  ipcMain.on("minimize-app", () => {
    mainWindow.minimize();
  });
  ipcMain.on("exit-app", () => {
    app.quit();
  });
});

ipcMain.on("show-bills-counter", (e, args) => {
  const mainWindow = new BrowserWindow({
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: false,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  mainWindow.loadFile("./src/html/billsCounter.html");
});
