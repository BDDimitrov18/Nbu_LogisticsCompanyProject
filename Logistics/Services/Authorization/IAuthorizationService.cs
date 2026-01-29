using DataLayer;

namespace Logistics.Services.Authorization;

public interface IUserAuthorizationService
{
    int GetCurrentUserId();
    Task<bool> IsAdminOfCompany(int userId, int companyId);
    Task<bool> IsAdminOfAnyCompany(int userId);
    Task<bool> IsEmployeeOfCompany(int userId, int companyId);
    Task<bool> IsClientOfCompany(int userId, int companyId);
    Task<bool> IsAssociatedWithCompany(int userId, int companyId);
    Task<EmployeeRoleEnum?> GetRoleInCompany(int userId, int companyId);
    Task<IEnumerable<int>> GetUserCompanyIds(int userId);
}
