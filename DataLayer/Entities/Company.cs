using System;
using System.Collections.Generic;

namespace DataLayer.Entities;

public partial class Company
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Cargo> Cargos { get; set; } = new List<Cargo>();

    public virtual ICollection<Client> Clients { get; set; } = new List<Client>();

    public virtual ICollection<CompanyEmployee> CompanyEmployees { get; set; } = new List<CompanyEmployee>();

    public virtual ICollection<Office> Offices { get; set; } = new List<Office>();
}
