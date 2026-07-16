<script>
  /**
   * CorteVisual — o desenho da chapa com as medidas.
   *
   * Mostra a chapa em proporção real: cada peça cortada, a linha da serra
   * entre elas e a sobra hachurada no final. É o "como funciona" que o
   * cliente entende num relance.
   *
   * Props:
   *   tamanhoChapa — comprimento total (cm)
   *   cortes       — lista com o tamanho de cada peça (ex.: [35.7, 35.7])
   *   sobra        — o que resta no fim (cm)
   *   cor          — cor da chapa (hex do catálogo)
   */
  export let tamanhoChapa = 90;
  export let cortes = [35.7, 35.7];
  export let sobra = 18.6;
  export let cor = "#b98a4e";

  const LARGURA = 700;   // px do desenho (viewBox — a tela escala sozinha)
  const ALTURA = 96;

  $: escala = tamanhoChapa > 0 ? LARGURA / tamanhoChapa : 1;

  // posição x de cada peça, acumulando as anteriores
  $: pecas = cortes.reduce((lista, tamanho) => {
    const x = lista.length ? lista[lista.length - 1].x + lista[lista.length - 1].largura : 0;
    lista.push({ x, largura: tamanho * escala, tamanho });
    return lista;
  }, []);

  $: xSobra = pecas.length ? pecas[pecas.length - 1].x + pecas[pecas.length - 1].largura : 0;
  $: larguraSobra = Math.max(0, LARGURA - xSobra);

  const formato = (numero) =>
    Number(numero).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
</script>

<div class="corte-visual">
  <svg viewBox="0 0 {LARGURA} {ALTURA + 34}" xmlns="http://www.w3.org/2000/svg" role="img"
       aria-label="Desenho da chapa de {formato(tamanhoChapa)} cm com os cortes marcados">
    <defs>
      <!-- hachura da sobra -->
      <pattern id="hachura" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#fff7ed" />
        <line x1="0" y1="0" x2="0" y2="8" stroke="#ea580c" stroke-width="2.5" />
      </pattern>
      <!-- veio da madeira -->
      <pattern id="veio" width="46" height="14" patternUnits="userSpaceOnUse">
        <rect width="46" height="14" fill={cor} />
        <path d="M0 7 q 12 -4 23 0 t 23 0" stroke="rgba(0,0,0,0.13)" stroke-width="1.4" fill="none" />
      </pattern>
    </defs>

    <!-- as peças -->
    {#each pecas as peca, i}
      <rect x={peca.x} y="8" width={peca.largura} height={ALTURA - 16}
            fill="url(#veio)" stroke="#7c4a12" stroke-width="1.5" rx="3" />
      <text x={peca.x + peca.largura / 2} y={ALTURA / 2 + 6} text-anchor="middle"
            font-size="17" font-weight="800" fill="#3b2508" font-family="Segoe UI, sans-serif">
        {formato(peca.tamanho)}
      </text>
      <text x={peca.x + peca.largura / 2} y={ALTURA / 2 + 24} text-anchor="middle"
            font-size="11" fill="#6b4a2b" font-family="Segoe UI, sans-serif">
        peça {i + 1}
      </text>
      <!-- linha da serra -->
      {#if i < pecas.length - 1 || larguraSobra > 1}
        <line x1={peca.x + peca.largura} y1="0" x2={peca.x + peca.largura} y2={ALTURA}
              stroke="#dc2626" stroke-width="2.5" stroke-dasharray="6 5" />
        <text x={peca.x + peca.largura} y={ALTURA + 0} text-anchor="middle" font-size="13">✂️</text>
      {/if}
    {/each}

    <!-- a sobra -->
    {#if larguraSobra > 1}
      <rect x={xSobra} y="8" width={larguraSobra} height={ALTURA - 16}
            fill="url(#hachura)" stroke="#ea580c" stroke-width="1.5" rx="3" />
      <text x={xSobra + larguraSobra / 2} y={ALTURA / 2 + 6} text-anchor="middle"
            font-size="15" font-weight="800" fill="#9a3412" font-family="Segoe UI, sans-serif">
        {formato(sobra)}
      </text>
      <text x={xSobra + larguraSobra / 2} y={ALTURA / 2 + 24} text-anchor="middle"
            font-size="11" fill="#c2410c" font-family="Segoe UI, sans-serif">
        sobra
      </text>
    {/if}

    <!-- cota total embaixo -->
    <line x1="0" y1={ALTURA + 16} x2={LARGURA} y2={ALTURA + 16} stroke="#64748b" stroke-width="1.5" />
    <line x1="0" y1={ALTURA + 10} x2="0" y2={ALTURA + 22} stroke="#64748b" stroke-width="1.5" />
    <line x1={LARGURA} y1={ALTURA + 10} x2={LARGURA} y2={ALTURA + 22} stroke="#64748b" stroke-width="1.5" />
    <rect x={LARGURA / 2 - 60} y={ALTURA + 6} width="120" height="20" fill="#f8fafc" />
    <text x={LARGURA / 2} y={ALTURA + 21} text-anchor="middle" font-size="14" font-weight="700"
          fill="#334155" font-family="Segoe UI, sans-serif">
      chapa de {formato(tamanhoChapa)} cm
    </text>
  </svg>
</div>

<style>
  .corte-visual {
    margin-top: 0.7rem;
    background: #fff;
    border: 1px solid var(--borda, #e2e8f0);
    border-radius: 12px;
    padding: 0.7rem 0.9rem 0.3rem;
    overflow-x: auto;
  }
  svg { width: 100%; height: auto; display: block; min-width: 320px; }
</style>
