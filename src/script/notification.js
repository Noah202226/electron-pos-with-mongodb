const { ipcRenderer } = require("electron");

const notification = document.querySelector("#notification");

ipcRenderer.send("getting-notication-data", "getting data.");
ipcRenderer.on("notification-data", (e, args) => {
  console.log(args);
  notification.innerHTML = args;
});
