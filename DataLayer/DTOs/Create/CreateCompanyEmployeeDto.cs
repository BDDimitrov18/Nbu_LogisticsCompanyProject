namespace DataLayer.DTOs.Create;

public class CreateCompanyEmployeeDto
{
    public int UserId { get; set; }

    public int CompanyId { get; set; }

    public int OfficeId { get; set; }

    public EmployeeRoleEnum Role { get; set; } = EmployeeRoleEnum.Office;
}