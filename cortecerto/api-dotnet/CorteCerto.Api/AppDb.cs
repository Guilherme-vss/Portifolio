using Microsoft.EntityFrameworkCore;

namespace CorteCerto.Api;

/// <summary>Contexto do banco (PostgreSQL via EF Core).</summary>
public class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> opcoes) : base(opcoes) { }

    public DbSet<Chapa> Chapas => Set<Chapa>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<PedidoItem> ItensPedido => Set<PedidoItem>();
    public DbSet<ItemEstoque> Estoque => Set<ItemEstoque>();
}

/// <summary>
/// Semente do catálogo: ninguém quer começar com o banco vazio.
/// Produtos fictícios com medidas reais de mercado — chapas de madeira
/// (MDF, HDF e compensado) em várias cores e grossuras.
/// </summary>
public static class Semente
{
    public static void Plantar(AppDb db)
    {
        if (db.Chapas.Any()) return;

        db.Chapas.AddRange(
            new Chapa { Nome = "MDF Branco TX", Material = "MDF", CorNome = "Branco", CorHex = "#f7f5f0", EspessuraMm = 15, TamanhoCm = 275, PrecoPorChapa = 289.00m },
            new Chapa { Nome = "MDF Branco Ultra", Material = "MDF", CorNome = "Branco", CorHex = "#fbfaf6", EspessuraMm = 18, TamanhoCm = 275, PrecoPorChapa = 329.00m },
            new Chapa { Nome = "MDF Carvalho Mel", Material = "MDF", CorNome = "Carvalho", CorHex = "#b98a4e", EspessuraMm = 18, TamanhoCm = 275, PrecoPorChapa = 365.00m },
            new Chapa { Nome = "MDF Nogueira", Material = "MDF", CorNome = "Nogueira", CorHex = "#6b4a2b", EspessuraMm = 15, TamanhoCm = 275, PrecoPorChapa = 349.00m },
            new Chapa { Nome = "MDF Preto Fosco", Material = "MDF", CorNome = "Preto", CorHex = "#26262a", EspessuraMm = 18, TamanhoCm = 275, PrecoPorChapa = 398.00m },
            new Chapa { Nome = "MDF Cinza Cristal", Material = "MDF", CorNome = "Cinza", CorHex = "#b9bcc0", EspessuraMm = 6, TamanhoCm = 185, PrecoPorChapa = 189.00m },
            new Chapa { Nome = "HDF Cru 3mm", Material = "HDF", CorNome = "Cru", CorHex = "#caa06a", EspessuraMm = 3, TamanhoCm = 275, PrecoPorChapa = 95.00m },
            new Chapa { Nome = "HDF Branco 3mm", Material = "HDF", CorNome = "Branco", CorHex = "#f2efe8", EspessuraMm = 3, TamanhoCm = 275, PrecoPorChapa = 119.00m },
            new Chapa { Nome = "Compensado Naval", Material = "Compensado", CorNome = "Natural", CorHex = "#c8965a", EspessuraMm = 10, TamanhoCm = 220, PrecoPorChapa = 259.00m }
        );
        db.SaveChanges();

        foreach (var chapa in db.Chapas.ToList())
        {
            db.Estoque.Add(new ItemEstoque { ChapaId = chapa.Id, Quantidade = 10 });
        }
        db.SaveChanges();
    }
}
