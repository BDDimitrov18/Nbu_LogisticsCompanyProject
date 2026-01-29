namespace DataLayer.DTOs.Edit;

public class CompanyEmployeeDto
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int CompanyId { get; set; }

    public int OfficeId { get; set; }

    public EmployeeRoleEnum Role { get; set; }
}