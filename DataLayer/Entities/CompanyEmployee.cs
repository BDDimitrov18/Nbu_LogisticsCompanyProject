using System;
using System.Collections.Generic;

namespace DataLayer.Entities;

public partial class CompanyEmployee
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int CompanyId { get; set; }

    public int OfficeId { get; set; }

    public virtual ICollection<Cargo> Cargos { get; set; } = new List<Cargo>();

    public virtual Company Company { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
