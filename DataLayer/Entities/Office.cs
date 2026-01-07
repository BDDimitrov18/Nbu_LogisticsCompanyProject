using System;
using System.Collections.Generic;

namespace DataLayer.Entities;

public partial class Office
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string Location { get; set; } = null!;

    public virtual ICollection<Cargo> Cargos { get; set; } = new List<Cargo>();

    public virtual Company Company { get; set; } = null!;
}
