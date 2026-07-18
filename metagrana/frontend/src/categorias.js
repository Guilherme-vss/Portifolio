/**
 * categorias.js — a árvore do que dá para desejar.
 *
 * O pedido do Guilherme: a pessoa escolhe categoria → subcategoria → detalhe
 * (carro > marca > modelo; PC > tipo; imóvel > tipo). Isso não é enfeite: um
 * termo de busca preciso ("Honda Civic" em vez de "carro") é o que faz o
 * caçador de preço trazer o produto certo, e não lixo.
 *
 * Estrutura em árvore de 2 a 3 níveis. As folhas viram o termo de busca.
 */

export const CATEGORIAS = [
  {
    id: "carro",
    nome: "Carro",
    icone: "🚗",
    filhos: [
      { id: "fiat", nome: "Fiat", filhos: ["Argo", "Pulse", "Toro", "Mobi", "Strada"] },
      { id: "vw", nome: "Volkswagen", filhos: ["Gol", "Polo", "T-Cross", "Nivus", "Virtus"] },
      { id: "chevrolet", nome: "Chevrolet", filhos: ["Onix", "Tracker", "Spin", "Montana"] },
      { id: "honda", nome: "Honda", filhos: ["Civic", "City", "HR-V", "Fit"] },
      { id: "toyota", nome: "Toyota", filhos: ["Corolla", "Yaris", "Hilux", "Corolla Cross"] },
      { id: "hyundai", nome: "Hyundai", filhos: ["HB20", "Creta", "Tucson"] },
    ],
  },
  {
    id: "moto",
    nome: "Moto",
    icone: "🏍️",
    filhos: [
      { id: "honda-moto", nome: "Honda", filhos: ["CG 160", "Biz 125", "PCX", "CB 500"] },
      { id: "yamaha", nome: "Yamaha", filhos: ["Fazer 250", "Factor 150", "NMax", "MT-03"] },
    ],
  },
  {
    id: "imovel",
    nome: "Imóvel",
    icone: "🏠",
    filhos: [
      { id: "apto", nome: "Apartamento", filhos: ["1 dormitório", "2 dormitórios", "3 dormitórios", "Cobertura"] },
      { id: "casa", nome: "Casa", filhos: ["Casa térrea", "Sobrado", "Casa de condomínio"] },
      { id: "terreno", nome: "Terreno", filhos: ["Terreno urbano", "Chácara"] },
    ],
  },
  {
    id: "pc",
    nome: "Computador",
    icone: "💻",
    filhos: [
      { id: "notebook", nome: "Notebook", filhos: ["Notebook i3", "Notebook i5", "Notebook i7", "Notebook Gamer", "MacBook"] },
      { id: "desktop", nome: "PC de mesa", filhos: ["PC Gamer", "PC Office", "All in One"] },
      { id: "peca", nome: "Peças", filhos: ["Placa de vídeo", "Processador", "SSD 1TB", "Memória RAM"] },
    ],
  },
  {
    id: "game",
    nome: "Video game",
    icone: "🎮",
    filhos: [
      { id: "console", nome: "Console", filhos: ["PlayStation 5", "Xbox Series X", "Nintendo Switch", "Steam Deck"] },
      { id: "acessorio", nome: "Acessório", filhos: ["Controle DualSense", "Headset gamer", "Volante"] },
    ],
  },
  {
    id: "celular",
    nome: "Celular",
    icone: "📱",
    filhos: [
      { id: "samsung", nome: "Samsung", filhos: ["Galaxy S24", "Galaxy A55", "Galaxy M35"] },
      { id: "apple", nome: "Apple", filhos: ["iPhone 15", "iPhone 14", "iPhone 13"] },
      { id: "motorola", nome: "Motorola", filhos: ["Moto G84", "Edge 50", "Moto G34"] },
    ],
  },
  {
    id: "eletro",
    nome: "Eletrodoméstico",
    icone: "🔌",
    filhos: [
      { id: "cozinha", nome: "Cozinha", filhos: ["Geladeira Frost Free", "Fogão 5 bocas", "Micro-ondas", "Air Fryer"] },
      { id: "limpeza", nome: "Limpeza", filhos: ["Máquina de lavar", "Aspirador robô", "Lava e seca"] },
      { id: "climatizacao", nome: "Climatização", filhos: ["Ar-condicionado split", "Ventilador de torre"] },
    ],
  },
];

/**
 * Monta o termo de busca a partir do caminho escolhido.
 * A folha já é específica ("Honda Civic"); só juntamos com a categoria quando
 * a folha sozinha seria ambígua ("2 dormitórios" → "Apartamento 2 dormitórios").
 */
export function termoDeBusca(categoria, sub, folha) {
  if (!folha) return "";
  // Imóvel: a folha precisa do tipo na frente para não virar busca genérica.
  if (categoria?.id === "imovel") return `${sub.nome} ${folha}`.trim();
  if (categoria?.id === "pc" && sub?.id === "peca") return folha;
  return folha; // carro/moto/celular: a folha já é "Marca Modelo"
}

/** Ícone de uma categoria pelo id (para os cards de resultado). */
export function iconeCategoria(id) {
  return CATEGORIAS.find((c) => c.id === id)?.icone ?? "🛒";
}
