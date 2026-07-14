using Microsoft.EntityFrameworkCore;

namespace CorteCerto.Api;

/// <summary>Contexto do banco (PostgreSQL via EF Core).</summary>
public class AppDb : DbContext
{
    public AppDb(DbContextOptions<AppDb> opcoes) : base(opcoes) { }

    public DbSet<Chapa> Chapas => Set<Chapa>();
    public DbSet<Pedido> Pedidos => Set<Pedido>();
    public DbSet<ItemEstoque> Estoque => Set<ItemEstoque>();
}

/// <summary>
/// Semente do catálogo: numa demo ninguém quer começar com o banco vazio.
/// Os produtos são fictícios, mas com medidas reais de mercado.
/// </summary>
public static class Semente
{
    public static void Plantar(AppDb db)
    {
        if (db.Chapas.Any()) return;

        db.Chapas.AddRange(
            new Chapa { Nome = "Chapa Alumínio Natural", CorNome = "Natural", CorHex = "#c0c5cc", EspessuraMm = 1.2, TamanhoCm = 90, PrecoPorChapa = 185.00m },
            new Chapa { Nome = "Chapa Alumínio Branco", CorNome = "Branco", CorHex = "#f5f5f2", EspessuraMm = 1.4, TamanhoCm = 90, PrecoPorChapa = 210.00m },
            new Chapa { Nome = "Chapa Alumínio Preto Fosco", CorNome = "Preto", CorHex = "#2b2b2e", EspessuraMm = 2.0, TamanhoCm = 120, PrecoPorChapa = 340.00m },
            new Chapa { Nome = "Chapa Alumínio Bronze", CorNome = "Bronze", CorHex = "#8c6a3f", EspessuraMm = 1.2, TamanhoCm = 60, PrecoPorChapa = 150.00m },
            new Chapa { Nome = "Chapa Alumínio Anodizado", CorNome = "Fosco", CorHex = "#9aa2ab", EspessuraMm = 1.8, TamanhoCm = 120, PrecoPorChapa = 295.00m }
        );
        db.SaveChanges();

        // Estoque inicial do fornecedor para a demo já nascer viva
        foreach (var chapa in db.Chapas.ToList())
        {
            db.Estoque.Add(new ItemEstoque { ChapaId = chapa.Id, Quantidade = 10 });
        }
        db.SaveChanges();
    }
}
