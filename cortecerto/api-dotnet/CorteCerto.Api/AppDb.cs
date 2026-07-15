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
/// Semente do catálogo: numa demo ninguém quer começar com o banco vazio.
/// Os produtos são fictícios, mas com medidas reais de mercado — alumínio
/// para esquadrias e MDF/HDF para marcenaria.
/// </summary>
public static class Semente
{
    public static void Plantar(AppDb db)
    {
        if (db.Chapas.Any()) return;

        db.Chapas.AddRange(
            new Chapa { Nome = "Chapa Alumínio Natural", Material = "Alumínio", CorNome = "Natural", CorHex = "#c0c5cc", EspessuraMm = 1.2, TamanhoCm = 90, PrecoPorChapa = 185.00m },
            new Chapa { Nome = "Chapa Alumínio Branco", Material = "Alumínio", CorNome = "Branco", CorHex = "#f5f5f2", EspessuraMm = 1.4, TamanhoCm = 90, PrecoPorChapa = 210.00m },
            new Chapa { Nome = "Chapa Alumínio Preto Fosco", Material = "Alumínio", CorNome = "Preto", CorHex = "#2b2b2e", EspessuraMm = 2.0, TamanhoCm = 120, PrecoPorChapa = 340.00m },
            new Chapa { Nome = "Chapa Alumínio Bronze", Material = "Alumínio", CorNome = "Bronze", CorHex = "#8c6a3f", EspessuraMm = 1.2, TamanhoCm = 60, PrecoPorChapa = 150.00m },
            new Chapa { Nome = "MDF Branco TX", Material = "MDF", CorNome = "Branco", CorHex = "#f7f5f0", EspessuraMm = 15, TamanhoCm = 275, PrecoPorChapa = 289.00m },
            new Chapa { Nome = "MDF Carvalho Mel", Material = "MDF", CorNome = "Carvalho", CorHex = "#b98a4e", EspessuraMm = 18, TamanhoCm = 275, PrecoPorChapa = 365.00m },
            new Chapa { Nome = "MDF Preto Fosco", Material = "MDF", CorNome = "Preto", CorHex = "#26262a", EspessuraMm = 18, TamanhoCm = 275, PrecoPorChapa = 398.00m },
            new Chapa { Nome = "HDF Cru 3mm", Material = "HDF", CorNome = "Cru", CorHex = "#caa06a", EspessuraMm = 3, TamanhoCm = 275, PrecoPorChapa = 95.00m },
            new Chapa { Nome = "HDF Branco 3mm", Material = "HDF", CorNome = "Branco", CorHex = "#f2efe8", EspessuraMm = 3, TamanhoCm = 275, PrecoPorChapa = 119.00m }
        );
        db.SaveChanges();

        foreach (var chapa in db.Chapas.ToList())
        {
            db.Estoque.Add(new ItemEstoque { ChapaId = chapa.Id, Quantidade = 10 });
        }
        db.SaveChanges();
    }
}
