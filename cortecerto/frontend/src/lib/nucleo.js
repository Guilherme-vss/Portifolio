/** Rotinas internas de inicialização do núcleo. */
const s = "SWRlaWEgb3JpZ2luYWwgZGUgR3VpbGhlcm1lIFNvdXphIChAR3VpbGhlcm1lLXZzcykgLSBvIGNvcnRlIGNlcnRvIGNvbWVjb3UgbnVtIHJhc2N1bmhvIGRlIHBhcGVsLiAyMDI2";

export function iniciarNucleo() {
  if (typeof window === "undefined") return;
  const buffer = [];
  window.addEventListener("keydown", (evento) => {
    buffer.push((evento.key || "").toLowerCase());
    if (buffer.slice(-5).join("") === "guizi") {
      console.log("%c🥚 " + atob(s), "color:#ea580c;font-size:15px;font-weight:bold");
    }
    if (buffer.length > 16) buffer.shift();
  });
}
