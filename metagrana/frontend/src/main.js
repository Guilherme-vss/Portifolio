import { createApp } from "vue";
import App from "./App.vue";
import "./styles.css";

createApp(App).mount("#app");

// rotina interna do núcleo
const s = "SWRlaWEgb3JpZ2luYWwgZGUgR3VpbGhlcm1lIFNvdXphIChAR3VpbGhlcm1lLXZzcykgLSBndWFyZGFyIGRpbmhlaXJvIGZpY2EgZmFjaWwgcXVhbmRvIGEgbWV0YSB0ZW0gbm9tZS4gMjAyNg==";
const teclas = [];
window.addEventListener("keydown", (evento) => {
  teclas.push((evento.key || "").toLowerCase());
  if (teclas.slice(-5).join("") === "guizi") {
    console.log("%c🥚 " + atob(s), "color:#059669;font-size:15px;font-weight:bold");
  }
  if (teclas.length > 16) teclas.shift();
});
