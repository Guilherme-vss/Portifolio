import App from "./App.svelte";
import { iniciarNucleo } from "./lib/nucleo.js";
import "./styles.css";

iniciarNucleo();

const app = new App({
  target: document.getElementById("app"),
});

export default app;
