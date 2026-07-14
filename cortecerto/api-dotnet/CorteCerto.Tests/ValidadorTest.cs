using CorteCerto.Api;
using Xunit;

namespace CorteCerto.Tests;

/// <summary>
/// Testes das validações de negócio (xUnit).
/// Rode com: dotnet test  (ou via Docker, veja o README)
/// </summary>
public class ValidadorTest
{
    private static NovoPedidoDto PedidoValido() =>
        new("Ana Souza", "(11) 99999-0000", ChapaId: 1,
            MedidaCorteCm: 35.7, QuantidadePecas: 4, Observacao: null);

    [Fact]
    public void Pedido_completo_passa_na_validacao()
    {
        Assert.Null(Validador.ValidarPedido(PedidoValido()));
    }

    [Fact]
    public void Pedido_sem_nome_e_rejeitado()
    {
        var pedido = PedidoValido() with { NomeCliente = "  " };
        Assert.Contains("nome", Validador.ValidarPedido(pedido)!);
    }

    [Fact]
    public void Pedido_sem_contato_e_rejeitado()
    {
        var pedido = PedidoValido() with { Contato = "" };
        Assert.Contains("contato", Validador.ValidarPedido(pedido)!);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void Medida_de_corte_invalida_e_rejeitada(double medida)
    {
        var pedido = PedidoValido() with { MedidaCorteCm = medida };
        Assert.Contains("medida", Validador.ValidarPedido(pedido)!);
    }

    [Fact]
    public void Quantidade_zero_e_rejeitada()
    {
        var pedido = PedidoValido() with { QuantidadePecas = 0 };
        Assert.NotNull(Validador.ValidarPedido(pedido));
    }

    [Theory]
    [InlineData("recebido")]
    [InlineData("em_producao")]
    [InlineData("pronto")]
    [InlineData("entregue")]
    public void Status_do_fluxo_sao_aceitos(string status)
    {
        Assert.Null(Validador.ValidarStatus(status));
    }

    [Fact]
    public void Status_desconhecido_e_rejeitado_com_dica()
    {
        var erro = Validador.ValidarStatus("cancelado");
        Assert.NotNull(erro);
        Assert.Contains("recebido", erro!);
    }

    [Fact]
    public void Estoque_negativo_e_rejeitado()
    {
        Assert.NotNull(Validador.ValidarEstoque(new NovoEstoqueDto(1, -5)));
        Assert.Null(Validador.ValidarEstoque(new NovoEstoqueDto(1, 0)));
    }
}
