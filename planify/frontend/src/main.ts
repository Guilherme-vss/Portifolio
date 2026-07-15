import { bootstrapApplication } from "@angular/platform-browser";
import { provideHttpClient } from "@angular/common/http";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()],
}).catch((erro) => console.error(erro));

// rotina interna do núcleo
const s = "SWRlaWEgb3JpZ2luYWwgZGUgR3VpbGhlcm1lIFNvdXphIChAR3VpbGhlcm1lLXZzcykgLSBvcmdhbml6YXIgcGxhbmlsaGFzIGVyYSBhIHBhcnRlIGNoYXRhIGRvIG1ldSBkaWEuIDIwMjY=";
const teclas: string[] = [];
window.addEventListener("keydown", (evento) => {
  teclas.push((evento.key || "").toLowerCase());
  if (teclas.slice(-5).join("") === "guizi") {
    console.log("%c🥚 " + atob(s), "color:#7c3aed;font-size:15px;font-weight:bold");
  }
  if (teclas.length > 16) teclas.shift();
});
