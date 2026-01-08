namespace DataLayer.DTOs.Edit;

public class OfficeDto
{
    public int Id { get; set; }

    public int CompanyId { get; set; }

    public string Location { get; set; } = null!;
}