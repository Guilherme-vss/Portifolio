<script>
  /**
   * CorteVisual — o desenho da chapa com as medidas.
   *
   * Mostra a chapa em proporção real: cada peça cortada, a linha da serra
   * entre elas e a sobra ao final.
   *
   * REGRA DE NEGÓCIO (pedido do Guilherme): a SOBRA só interessa a quem corta.
   * Para o cliente, mostrar "sobra 18,6 cm" só gera dúvida ("estou pagando por
   * isso?"). Então `mostrarSobra` controla isso — cliente vê as peças, o
   * produtor vê as peças + a sobra aproveitável.
   *
   * Props:
   *   tamanhoChapa — comprimento total (cm)
   *   cortes       — lista com o tamanho de cada peça (ex.: [35.7, 35.7])
   *   sobra        — o que resta no fim (cm)
   *   cor          — cor da chapa (hex do catálogo)
   *   mostrarSobra — true só na visão do produtor/fornecedor
   *   grande       — desenho maior, "a placa inteira ali na frente"
   */
  export let tamanhoChapa = 90;
  export let cortes = [35.7, 35.7];
  export let sobra = 18.6;
  export let cor = "#b98a4e";
  export let mostrarSobra = false;
  export let grande = false;

  $: LARGURA = grande ? 960 : 700;
  $: ALTURA = grande ? 150 : 96;

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

  $: fonteMedida = grande ? 24 : 17;
  $: fontePeca = grande ? 14 : 11;
</script>

<div class="corte-visual" class:grande>
  <svg viewBox="0 0 {LARGURA} {ALTURA + 44}" xmlns="http://www.w3.org/2000/svg" role="img"
       aria-label="Chapa de {formato(tamanhoChapa)} cm com os cortes marcados">
    <defs>
      <pattern id="hachura" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <rect width="8" height="8" fill="#fff7ed" />
        <line x1="0" y1="0" x2="0" y2="8" stroke="#ea580c" stroke-width="2.5" />
      </pattern>
      <pattern id="veio" width="{grande ? 64 : 46}" height="{grande ? 20 : 14}" patternUnits="userSpaceOnUse">
        <rect width="{grande ? 64 : 46}" height="{grande ? 20 : 14}" fill={cor} />
        <path d="M0 {grande ? 10 : 7} q {grande ? 16 : 12} -5 {grande ? 32 : 23} 0 t {grande ? 32 : 23} 0"
              stroke="rgba(0,0,0,0.13)" stroke-width="1.6" fill="none" />
      </pattern>
      <!-- leve sombra para dar a sensação de "a placa está aqui" -->
      <filter id="sombra" x="-2%" y="-2%" width="104%" height="115%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="rgba(60,40,10,0.35)" />
      </filter>
    </defs>

    <!-- moldura da chapa inteira (dá a noção do tamanho real) -->
    <rect x="0" y="8" width={LARGURA} height={ALTURA - 16} rx="4"
          fill={cor} stroke="#5c3a12" stroke-width="2.5" filter="url(#sombra)" />

    <!-- as peças -->
    {#each pecas as peca, i}
      <rect x={peca.x} y="8" width={peca.largura} height={ALTURA - 16}
            fill="url(#veio)" stroke="#7c4a12" stroke-width="1.5" />
      <text x={peca.x + peca.largura / 2} y={ALTURA / 2 + fonteMedida / 3} text-anchor="middle"
            font-size={fonteMedida} font-weight="800" fill="#3b2508" font-family="Segoe UI, sans-serif">
        {formato(peca.tamanho)}
      </text>
      <text x={peca.x + peca.largura / 2} y={ALTURA / 2 + fonteMedida} text-anchor="middle"
            font-size={fontePeca} fill="#6b4a2b" font-family="Segoe UI, sans-serif">
        peça {i + 1}
      </text>
      {#if i < pecas.length - 1 || (mostrarSobra && larguraSobra > 1)}
        <line x1={peca.x + peca.largura} y1="0" x2={peca.x + peca.largura} y2={ALTURA + 6}
              stroke="#dc2626" stroke-width="2.5" stroke-dasharray="7 5" />
        <text x={peca.x + peca.largura} y={ALTURA + 4} text-anchor="middle" font-size={grande ? 17 : 13}>✂️</text>
      {/if}
    {/each}

    <!-- a sobra: SÓ para o produtor -->
    {#if mostrarSobra && larguraSobra > 1}
      <rect x={xSobra} y="8" width={larguraSobra} height={ALTURA - 16}
            fill="url(#hachura)" stroke="#ea580c" stroke-width="1.5" />
      <text x={xSobra + larguraSobra / 2} y={ALTURA / 2 + fonteMedida / 3} text-anchor="middle"
            font-size={grande ? 20 : 15} font-weight="800" fill="#9a3412" font-family="Segoe UI, sans-serif">
        {formato(sobra)}
      </text>
      <text x={xSobra + larguraSobra / 2} y={ALTURA / 2 + fonteMedida} text-anchor="middle"
            font-size={fontePeca} fill="#c2410c" font-family="Segoe UI, sans-serif">
        sobra p/ reaproveitar
      </text>
    {/if}

    <!-- cota total embaixo -->
    <line x1="0" y1={ALTURA + 22} x2={LARGURA} y2={ALTURA + 22} stroke="#64748b" stroke-width="1.5" />
    <line x1="0" y1={ALTURA + 16} x2="0" y2={ALTURA + 28} stroke="#64748b" stroke-width="1.5" />
    <line x1={LARGURA} y1={ALTURA + 16} x2={LARGURA} y2={ALTURA + 28} stroke="#64748b" stroke-width="1.5" />
    <rect x={LARGURA / 2 - 80} y={ALTURA + 12} width="160" height="22" fill="#fff" />
    <text x={LARGURA / 2} y={ALTURA + 28} text-anchor="middle" font-size={grande ? 16 : 14} font-weight="700"
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
  .corte-visual.grande {
    padding: 1.2rem;
    background: linear-gradient(180deg, #faf7f2, #fff);
  }
  svg { width: 100%; height: auto; display: block; min-width: 320px; }
</style>
