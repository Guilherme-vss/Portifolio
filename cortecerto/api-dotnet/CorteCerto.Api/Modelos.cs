namespace CorteCerto.Api;

/// <summary>
/// Entidades do CorteCerto — o vocabulário de uma esquadria/marcenaria:
/// chapas no catálogo (alumínio, MDF e HDF), pedidos com LISTA de itens
/// e estoque do fornecedor.
/// </summary>
public class Chapa
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public string Material { get; set; } = "Alumínio"; // Alumínio | MDF | HDF
    public string CorNome { get; set; } = "";          // "Branco", "Bronze", "Carvalho"...
    public string CorHex { get; set; } = "";           // para pintar o card no site
    public double EspessuraMm { get; set; }            // grossura da chapa
    public double TamanhoCm { get; set; }              // comprimento da barra/chapa
    public decimal PrecoPorChapa { get; set; }
}

public class Pedido
{
    public int Id { get; set; }
    public string Codigo { get; set; } = "";           // código de acompanhamento (ex.: MF-3F9K2)
    public string NomeCliente { get; set; } = "";
    public string Contato { get; set; } = "";
    public string Observacao { get; set; } = "";
    public string Status { get; set; } = "recebido";   // recebido → em_producao → pronto → entregue
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public List<PedidoItem> Itens { get; set; } = new();
}

/// <summary>Cada linha do pedido: uma chapa, uma medida, uma quantidade.</summary>
public class PedidoItem
{
    public int Id { get; set; }
    public int PedidoId { get; set; }
    public int ChapaId { get; set; }
    public Chapa? Chapa { get; set; }
    public double MedidaCorteCm { get; set; }
    public int QuantidadePecas { get; set; }
    public bool Feito { get; set; }                    // o fornecedor marca conforme produz
}

public class ItemEstoque
{
    public int Id { get; set; }
    public int ChapaId { get; set; }
    public Chapa? Chapa { get; set; }
    public int Quantidade { get; set; }
}

/* ==================== DTOs (a borda HTTP nunca vê as entidades) ==================== */

public record NovoItemDto(int ChapaId, double MedidaCorteCm, int QuantidadePecas);

public record NovoPedidoDto(
    string NomeCliente, string Contato, string? Observacao, List<NovoItemDto> Itens);

public record AtualizarStatusDto(string Status);

public record MarcarFeitoDto(bool Feito);

public record NovoEstoqueDto(int ChapaId, int Quantidade);

public record CorteDto(double TamanhoChapa, double TamanhoCorte, double Kerf = 0);

public record ChapasNecessariasDto(
    double TamanhoChapa, double TamanhoCorte, int PecasNecessarias, double Kerf = 0);

public record PlanoDto(double TamanhoChapa, double[] Cortes, double Kerf = 0);

/// <summary>Validações de negócio dos DTOs — puras e testáveis.</summary>
public static class Validador
{
    public static readonly string[] StatusValidos =
        { "recebido", "em_producao", "pronto", "entregue" };

    public static string? ValidarPedido(NovoPedidoDto pedido)
    {
        if (string.IsNullOrWhiteSpace(pedido.NomeCliente)) return "Informe o nome do cliente";
        if (string.IsNullOrWhiteSpace(pedido.Contato)) return "Informe um contato (telefone ou email)";
        if (pedido.Itens == null || pedido.Itens.Count == 0)
            return "Adicione pelo menos uma chapa à lista do pedido";
        foreach (var item in pedido.Itens)
        {
            var erro = ValidarItem(item);
            if (erro != null) return erro;
        }
        return null;
    }

    public static string? ValidarItem(NovoItemDto item)
    {
        if (item.ChapaId <= 0) return "Escolha uma chapa do catálogo em cada item";
        if (item.MedidaCorteCm <= 0) return "A medida do corte precisa ser maior que zero";
        if (item.QuantidadePecas <= 0) return "Cada item precisa de pelo menos 1 peça";
        return null;
    }

    public static string? ValidarStatus(string status) =>
        StatusValidos.Contains(status) ? null
            : $"Status inválido — use: {string.Join(", ", StatusValidos)}";

    public static string? ValidarEstoque(NovoEstoqueDto item)
    {
        if (item.ChapaId <= 0) return "Escolha uma chapa do catálogo";
        if (item.Quantidade < 0) return "A quantidade não pode ser negativa";
        return null;
    }

    /// <summary>Gera o código de acompanhamento (curto e sem caracteres ambíguos).</summary>
    public static string GerarCodigo(Random? sorteio = null)
    {
        const string letras = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sem 0/O, 1/I/L
        var aleatorio = sorteio ?? Random.Shared;
        var sufixo = new string(Enumerable.Range(0, 5)
            .Select(_ => letras[aleatorio.Next(letras.Length)]).ToArray());
        return $"MF-{sufixo}"; // MF = MadeiraFort
    }
}
