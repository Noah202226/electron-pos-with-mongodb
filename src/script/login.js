const { ipcRenderer } = require("electron");

const userForm = document.querySelector("#userForm");
const user = document.querySelector("#user");
const pass = document.querySelector("#pass");
const txtWarn = document.querySelector("#txtWarn");

const exitApp = document.querySelector("#exitApp");

addEventListener("DOMContentLoaded", () => {
  user.focus();
});
exitApp.addEventListener("click", () => ipcRenderer.send("exit-app"));

userForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const userObject = {
    uname: user.value,
    upass: pass.value,
  };

  ipcRenderer.send("check-user", userObject);
  userForm.reset();
});

ipcRenderer.on("login-success", (e, args) => {
  txtWarn.innerHTML = "Login Successfully";
  txtWarn.style.display = "block";
  user.focus();
  setTimeout(() => {
    txtWarn.style.display = "none";
  }, 3000);
  ipcRenderer.send("set-user", args);
  window.close();
});
ipcRenderer.on("login-failed", (e, args) => {
  txtWarn.innerHTML = "User not found. Check input or ask for admins";
  txtWarn.style.display = "block";
  user.focus();
  setTimeout(() => {
    txtWarn.style.display = "none";
  }, 3000);
});
