using System.Security.Claims;
using DataLayer;
using DataLayer.Repositories.ClientRepository;
using DataLayer.Repositories.CompanyEmployeeRepository;

namespace Logistics.Services.Authorization;

public class UserAuthorizationService : IUserAuthorizationService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ICompanyEmployeeRepository _employeeRepository;
    private readonly IClientRepository _clientRepository;

    public UserAuthorizationService(
        IHttpContextAccessor httpContextAccessor,
        ICompanyEmployeeRepository employeeRepository,
        IClientRepository clientRepository)
    {
        _httpContextAccessor = httpContextAccessor;
        _employeeRepository = employeeRepository;
        _clientRepository = clientRepository;
    }

    public int GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(
            ClaimTypes.NameIdentifier);

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            throw new UnauthorizedAccessException("User not authenticated");
        }

        return userId;
    }

    public async Task<bool> IsAdminOfCompany(int userId, int companyId)
    {
        var employees = await _employeeRepository.GetByUserIdAsync(userId);
        return employees.Any(e => e.CompanyId == companyId && e.Role == EmployeeRoleEnum.Admin);
    }

    /// <summary>
    /// Checks if user is an admin of ANY company (has global view access)
    /// </summary>
    public async Task<bool> IsAdminOfAnyCompany(int userId)
    {
        var employees = await _employeeRepository.GetByUserIdAsync(userId);
        return employees.Any(e => e.Role == EmployeeRoleEnum.Admin);
    }

    public async Task<bool> IsEmployeeOfCompany(int userId, int companyId)
    {
        var employees = await _employeeRepository.GetByUserIdAsync(userId);
        return employees.Any(e => e.CompanyId == companyId);
    }

    public async Task<bool> IsClientOfCompany(int userId, int companyId)
    {
        var clients = await _clientRepository.GetByUserIdAsync(userId);
        return clients.Any(c => c.CompanyId == companyId);
    }

    /// <summary>
    /// Checks if user is associated with a company (as employee OR client).
    /// Users can only view data from companies they're directly associated with.
    /// </summary>
    public async Task<bool> IsAssociatedWithCompany(int userId, int companyId)
    {
        return await IsEmployeeOfCompany(userId, companyId) ||
               await IsClientOfCompany(userId, companyId);
    }

    public async Task<EmployeeRoleEnum?> GetRoleInCompany(int userId, int companyId)
    {
        var employees = await _employeeRepository.GetByUserIdAsync(userId);
        var employee = employees.FirstOrDefault(e => e.CompanyId == companyId);
        return employee?.Role;
    }

    public async Task<IEnumerable<int>> GetUserCompanyIds(int userId)
    {
        var employeeCompanies = (await _employeeRepository.GetByUserIdAsync(userId))
            .Select(e => e.CompanyId);
        var clientCompanies = (await _clientRepository.GetByUserIdAsync(userId))
            .Select(c => c.CompanyId);

        return employeeCompanies.Union(clientCompanies).Distinct();
    }
}
