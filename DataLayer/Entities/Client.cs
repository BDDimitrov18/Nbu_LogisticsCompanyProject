using System;
using System.Collections.Generic;

namespace DataLayer.Entities;

public partial class Client
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int CompanyId { get; set; }

    public virtual Company Company { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
