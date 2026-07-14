namespace CorteCerto.Api;

/// <summary>
/// Entidades do CorteCerto — o vocabulário de uma esquadria:
/// chapas no catálogo, pedidos dos clientes e estoque do fornecedor.
/// </summary>
public class Chapa
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public string CorNome { get; set; } = "";     // "Branco", "Bronze"...
    public string CorHex { get; set; } = "";      // para pintar o card no site
    public double EspessuraMm { get; set; }       // grossura da chapa
    public double TamanhoCm { get; set; }         // comprimento da barra/chapa
    public decimal PrecoPorChapa { get; set; }
}

public class Pedido
{
    public int Id { get; set; }
    public string NomeCliente { get; set; } = "";
    public string Contato { get; set; } = "";     // telefone ou email
    public int ChapaId { get; set; }
    public Chapa? Chapa { get; set; }
    public double MedidaCorteCm { get; set; }     // tamanho de cada peça
    public int QuantidadePecas { get; set; }
    public string Observacao { get; set; } = "";
    public string Status { get; set; } = "recebido"; // recebido → em_producao → pronto → entregue
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}

public class ItemEstoque
{
    public int Id { get; set; }
    public int ChapaId { get; set; }
    public Chapa? Chapa { get; set; }
    public int Quantidade { get; set; }           // chapas inteiras disponíveis
}

/* ==================== DTOs (a borda HTTP nunca vê as entidades) ==================== */

public record NovoPedidoDto(
    string NomeCliente, string Contato, int ChapaId,
    double MedidaCorteCm, int QuantidadePecas, string? Observacao);

public record AtualizarStatusDto(string Status);

public record NovoEstoqueDto(int ChapaId, int Quantidade);

/// <summary>Pedidos de cálculo repassados ao motor Python.</summary>
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
        if (pedido.ChapaId <= 0) return "Escolha uma chapa do catálogo";
        if (pedido.MedidaCorteCm <= 0) return "A medida do corte precisa ser maior que zero";
        if (pedido.QuantidadePecas <= 0) return "Peça pelo menos 1 peça";
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
}
