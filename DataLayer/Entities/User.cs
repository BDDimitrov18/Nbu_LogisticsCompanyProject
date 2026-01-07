using System;
using System.Collections.Generic;

namespace DataLayer.Entities;

public partial class User
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public string Username { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string Email { get; set; } = null!;

    public virtual ICollection<Cargo> CargoRecievers { get; set; } = new List<Cargo>();

    public virtual ICollection<Cargo> CargoSenders { get; set; } = new List<Cargo>();

    public virtual ICollection<Client> Clients { get; set; } = new List<Client>();

    public virtual ICollection<CompanyEmployee> CompanyEmployees { get; set; } = new List<CompanyEmployee>();
}
