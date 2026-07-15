using CorteCerto.Api;
using Xunit;

namespace CorteCerto.Tests;

/// <summary>
/// Testes das validações de negócio (xUnit).
/// Rode com: dotnet test  (ou via Docker, veja o README)
/// </summary>
public class ValidadorTest
{
    private static NovoItemDto ItemValido() =>
        new(ChapaId: 1, MedidaCorteCm: 35.7, QuantidadePecas: 4);

    private static NovoPedidoDto PedidoValido() =>
        new("Ana Souza", "(11) 99999-0000", Observacao: null,
            Itens: new List<NovoItemDto> { ItemValido(), new(5, 120, 2) });

    [Fact]
    public void Pedido_completo_com_varios_itens_passa_na_validacao()
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

    [Fact]
    public void Pedido_sem_itens_e_rejeitado()
    {
        var pedido = PedidoValido() with { Itens = new List<NovoItemDto>() };
        Assert.Contains("pelo menos uma chapa", Validador.ValidarPedido(pedido)!);
    }

    [Fact]
    public void Um_item_invalido_derruba_o_pedido_inteiro()
    {
        var pedido = PedidoValido() with
        {
            Itens = new List<NovoItemDto> { ItemValido(), new(1, 0, 3) },
        };
        Assert.Contains("medida", Validador.ValidarPedido(pedido)!);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    public void Medida_de_corte_invalida_e_rejeitada(double medida)
    {
        Assert.Contains("medida", Validador.ValidarItem(ItemValido() with { MedidaCorteCm = medida })!);
    }

    [Fact]
    public void Quantidade_zero_e_rejeitada()
    {
        Assert.NotNull(Validador.ValidarItem(ItemValido() with { QuantidadePecas = 0 }));
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

    [Fact]
    public void Codigo_de_acompanhamento_tem_formato_AF_XXXXX()
    {
        var codigo = Validador.GerarCodigo(new Random(42));
        Assert.Matches(@"^AF-[A-Z2-9]{5}$", codigo);
        Assert.DoesNotContain("0", codigo);
        Assert.DoesNotContain("O", codigo.Substring(3));
    }
}
