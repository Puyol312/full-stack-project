import { initRouter } from "./router";
(function () {
  const root = document.querySelector("#root");
  root? initRouter(root) : null ;
})()