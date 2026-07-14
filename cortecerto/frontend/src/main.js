import App from "./App.svelte";
import { mostrarFaixaDemo } from "./lib/demo.js";
import "./styles.css";

mostrarFaixaDemo();

const app = new App({
  target: document.getElementById("app"),
});

export default app;
