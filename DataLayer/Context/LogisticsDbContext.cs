using DataLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataLayer.Context;

public /*partial*/ class LogisticsDbContext : DbContext
{
    public LogisticsDbContext()
    {
    }

    public LogisticsDbContext(DbContextOptions<LogisticsDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Cargo> Cargos { get; set; }

    public virtual DbSet<Client> Clients { get; set; }

    public virtual DbSet<Company> Companies { get; set; }

    public virtual DbSet<CompanyEmployee> CompanyEmployees { get; set; }

    public virtual DbSet<Office> Offices { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {}

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("arrival_location_type", new[] { "Office", "Address" })
            .HasPostgresEnum("cargo_status", new[] { "Created", "Assigned", "PickedUp", "InTransit", "Delivered", "Cancelled" })
            .HasPostgresEnum("employee_role", new[] { "Office", "Courier" });

        modelBuilder.Entity<Cargo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Cargo_pkey");

            entity.ToTable("Cargo");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("ID");
            entity.Property(e => e.ArrivalDate).HasColumnType("timestamp without time zone");
            entity.Property(e => e.CompanyId).HasColumnName("CompanyID");
            entity.Property(e => e.EmployeeId).HasColumnName("EmployeeID");
            entity.Property(e => e.OfficeDeliveredToId).HasColumnName("OfficeDeliveredToID");
            entity.Property(e => e.Price).HasPrecision(10, 2);
            entity.Property(e => e.RecieverAddress).HasMaxLength(255);
            entity.Property(e => e.RecieverId).HasColumnName("RecieverID");
            entity.Property(e => e.SenderAddress).HasMaxLength(255);
            entity.Property(e => e.SenderId).HasColumnName("SenderID");
            entity.Property(e => e.Weight).HasPrecision(8, 3);

            entity.HasOne(d => d.Company).WithMany(p => p.Cargos)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_cargoCompany_company");

            entity.HasOne(d => d.Employee).WithMany(p => p.Cargos)
                .HasForeignKey(d => d.EmployeeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_cargo_employees");

            entity.HasOne(d => d.OfficeDeliveredTo).WithMany(p => p.Cargos)
                .HasForeignKey(d => d.OfficeDeliveredToId)
                .HasConstraintName("fk_cargoOfficeDeliveredTo_offices");

            entity.HasOne(d => d.Reciever).WithMany(p => p.CargoRecievers)
                .HasForeignKey(d => d.RecieverId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_cargoReciever_users");

            entity.HasOne(d => d.Sender).WithMany(p => p.CargoSenders)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_cargosender_users");
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Clients_pkey");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("ID");
            entity.Property(e => e.CompanyId).HasColumnName("CompanyID");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Company).WithMany(p => p.Clients)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_clients_company");

            entity.HasOne(d => d.User).WithMany(p => p.Clients)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_clients_users");
        });

        modelBuilder.Entity<Company>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Companies_pkey");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("ID");
            entity.Property(e => e.Name).HasMaxLength(45);
        });

        modelBuilder.Entity<CompanyEmployee>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Company_Employees_pkey");

            entity.ToTable("Company_Employees");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("ID");
            entity.Property(e => e.CompanyId).HasColumnName("CompanyID");
            entity.Property(e => e.OfficeId).HasColumnName("OfficeID");
            entity.Property(e => e.UserId).HasColumnName("UserID");

            entity.HasOne(d => d.Company).WithMany(p => p.CompanyEmployees)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_company_employees_company");

            entity.HasOne(d => d.User).WithMany(p => p.CompanyEmployees)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_company_employees_users");
        });

        modelBuilder.Entity<Office>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Offices_pkey");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("ID");
            entity.Property(e => e.CompanyId).HasColumnName("CompanyID");
            entity.Property(e => e.Location).HasMaxLength(255);

            entity.HasOne(d => d.Company).WithMany(p => p.Offices)
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_offices_companies");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Users_pkey");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("ID");
            entity.Property(e => e.Email)
                .HasMaxLength(45)
                .HasColumnName("email");
            entity.Property(e => e.Name).HasMaxLength(45);
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.Phone)
                .HasMaxLength(45)
                .HasColumnName("phone");
            entity.Property(e => e.Username).HasMaxLength(45);
        });
        
        modelBuilder.Entity<CompanyEmployee>()
            .Property(e => e.Role)
            .HasConversion(
                v => v.ToString(),
                v => Enum.Parse<EmployeeRoleEnum>(v, true)
            );

        modelBuilder.Entity<Cargo>()
            .Property(e => e.CargoStatus)
            .HasConversion(
                v => v.ToString(),
                v => Enum.Parse<CargoStatusEnum>(v, true)
            );

        modelBuilder.Entity<Cargo>()
            .Property(e => e.ArrivalLocationType)
            .HasConversion(
                v => v.ToString(),
                v => Enum.Parse<ArrivalLocationTypeEnum>(v, true)
            );
        
        //OnModelCreatingPartial(modelBuilder);
    }

    //partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
