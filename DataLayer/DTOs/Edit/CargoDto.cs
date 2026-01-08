namespace DataLayer.DTOs.Edit;

public class CargoDto
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public int SenderId { get; set; }

    public int RecieverId { get; set; }

    public int CompanyId { get; set; }

    public string? SenderAddress { get; set; }

    public string? RecieverAddress { get; set; }
    
    public CargoStatusEnum CargoStatus { get; set; }

    public decimal? Weight { get; set; }

    public decimal? Price { get; set; }

    public DateTime? ArrivalDate { get; set; }
    
    public ArrivalLocationTypeEnum ArrivalLocationType { get; set; }

    public int? OfficeDeliveredToId { get; set; }
}