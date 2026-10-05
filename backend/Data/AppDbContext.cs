using Microsoft.EntityFrameworkCore;
using IDataApi.DTOs;

namespace IDataApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Registados sem chave primária para receberem o retorno das consultas SQL diretas
    public DbSet<ProcessoQuestao2Dto> ProcessosQuestao2 => Set<ProcessoQuestao2Dto>();
    public DbSet<ProcessoQuestao3Dto> ProcessosQuestao3 => Set<ProcessoQuestao3Dto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProcessoQuestao2Dto>().HasNoKey();
        modelBuilder.Entity<ProcessoQuestao3Dto>().HasNoKey();
    }
}