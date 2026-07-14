using CorteCerto.Api;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ---------- Serviços ----------
var conexao = builder.Configuration.GetConnectionString("Default")
    ?? "Host=localhost;Port=5432;Database=cortecerto;Username=cortecerto;Password=cortecerto";
builder.Services.AddDbContext<AppDb>(opcoes => opcoes.UseNpgsql(conexao));

// O motor de corte (Python) é outro serviço — a URL vem do ambiente
var motorUrl = Environment.GetEnvironmentVariable("MOTOR_URL") ?? "http://localhost:8001";
builder.Services.AddHttpClient("motor", cliente => cliente.BaseAddress = new Uri(motorUrl));

var app = builder.Build();

// Cria as tabelas e planta o catálogo de demonstração na primeira subida
using (var escopo = app.Services.CreateScope())
{
    var db = escopo.ServiceProvider.GetRequiredService<AppDb>();
    db.Database.EnsureCreated();
    Semente.Plantar(db);
}

// O site (Svelte compilado) é servido pela própria API a partir de wwwroot/
app.UseDefaultFiles();
app.UseStaticFiles();

// ---------- Saúde ----------
app.MapGet("/api/saude", () => Results.Ok(new { ok = true, servico = "cortecerto-api" }));

// ---------- Catálogo (cliente vê tamanho, cor e grossura) ----------
app.MapGet("/api/chapas", async (AppDb db) =>
    await db.Chapas.OrderBy(chapa => chapa.Nome).ToListAsync());

// ---------- Pedidos ----------
app.MapPost("/api/pedidos", async (NovoPedidoDto dto, AppDb db) =>
{
    var erro = Validador.ValidarPedido(dto);
    if (erro != null) return Results.BadRequest(new { erro });

    var chapa = await db.Chapas.FindAsync(dto.ChapaId);
    if (chapa == null) return Results.BadRequest(new { erro = "Chapa não encontrada no catálogo" });
    if (dto.MedidaCorteCm > chapa.TamanhoCm)
        return Results.BadRequest(new { erro = $"O corte ({dto.MedidaCorteCm} cm) é maior que a chapa ({chapa.TamanhoCm} cm)" });

    var pedido = new Pedido
    {
        NomeCliente = dto.NomeCliente.Trim(),
        Contato = dto.Contato.Trim(),
        ChapaId = dto.ChapaId,
        MedidaCorteCm = dto.MedidaCorteCm,
        QuantidadePecas = dto.QuantidadePecas,
        Observacao = dto.Observacao?.Trim() ?? "",
    };
    db.Pedidos.Add(pedido);
    await db.SaveChangesAsync();
    return Results.Created($"/api/pedidos/{pedido.Id}",
        new { pedido.Id, mensagem = "Pedido recebido! A esquadria entrará em contato. 🤝" });
});

app.MapGet("/api/pedidos", async (AppDb db) =>
    await db.Pedidos.Include(pedido => pedido.Chapa)
        .OrderByDescending(pedido => pedido.CriadoEm)
        .ToListAsync());

app.MapPut("/api/pedidos/{id:int}/status", async (int id, AtualizarStatusDto dto, AppDb db) =>
{
    var erro = Validador.ValidarStatus(dto.Status);
    if (erro != null) return Results.BadRequest(new { erro });

    var pedido = await db.Pedidos.FindAsync(id);
    if (pedido == null) return Results.NotFound(new { erro = "Pedido não encontrado" });

    pedido.Status = dto.Status;
    await db.SaveChangesAsync();
    return Results.Ok(new { ok = true });
});

// ---------- Estoque do fornecedor ----------
app.MapGet("/api/estoque", async (AppDb db) =>
    await db.Estoque.Include(item => item.Chapa)
        .OrderBy(item => item.Chapa!.Nome)
        .ToListAsync());

app.MapPost("/api/estoque", async (NovoEstoqueDto dto, AppDb db) =>
{
    var erro = Validador.ValidarEstoque(dto);
    if (erro != null) return Results.BadRequest(new { erro });

    var existente = await db.Estoque.FirstOrDefaultAsync(item => item.ChapaId == dto.ChapaId);
    if (existente != null)
    {
        existente.Quantidade = dto.Quantidade;
    }
    else
    {
        db.Estoque.Add(new ItemEstoque { ChapaId = dto.ChapaId, Quantidade = dto.Quantidade });
    }
    await db.SaveChangesAsync();
    return Results.Ok(new { ok = true });
});

// ---------- Cálculos de corte (repassados ao motor Python) ----------
app.MapPost("/api/corte", async (CorteDto dto, IHttpClientFactory clientes) =>
    await RepassarAoMotor(clientes, "/corte", new
    {
        tamanho_chapa = dto.TamanhoChapa,
        tamanho_corte = dto.TamanhoCorte,
        kerf = dto.Kerf,
    }));

app.MapPost("/api/corte/chapas-necessarias", async (ChapasNecessariasDto dto, IHttpClientFactory clientes) =>
    await RepassarAoMotor(clientes, "/chapas-necessarias", new
    {
        tamanho_chapa = dto.TamanhoChapa,
        tamanho_corte = dto.TamanhoCorte,
        pecas_necessarias = dto.PecasNecessarias,
        kerf = dto.Kerf,
    }));

app.MapPost("/api/corte/plano", async (PlanoDto dto, IHttpClientFactory clientes) =>
    await RepassarAoMotor(clientes, "/plano", new
    {
        tamanho_chapa = dto.TamanhoChapa,
        cortes = dto.Cortes,
        kerf = dto.Kerf,
    }));

app.Run();

/// <summary>Chama o motor Python e devolve a resposta como veio (JSON).</summary>
static async Task<IResult> RepassarAoMotor(IHttpClientFactory clientes, string caminho, object corpo)
{
    try
    {
        var motor = clientes.CreateClient("motor");
        var resposta = await motor.PostAsJsonAsync(caminho, corpo);
        var conteudo = await resposta.Content.ReadAsStringAsync();
        return Results.Content(conteudo, "application/json", statusCode: (int)resposta.StatusCode);
    }
    catch (HttpRequestException)
    {
        return Results.Problem("O motor de corte está fora do ar — tente novamente.", statusCode: 503);
    }
}
