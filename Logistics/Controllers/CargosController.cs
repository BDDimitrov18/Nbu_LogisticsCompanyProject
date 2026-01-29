using DataLayer;
using DataLayer.DTOs.Create;
using DataLayer.DTOs.Edit;
using DataLayer.Entities;
using DataLayer.Repositories.CargoRepository;
using DataLayer.Repositories.ClientRepository;
using Logistics.Services.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CargosController(
    ICargoRepository cargoRepository,
    IClientRepository clientRepository,
    IUserAuthorizationService authService) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cargo = await cargoRepository.GetByIdAsync(id);
        if (cargo == null)
        {
            return NotFound();
        }

        var userId = authService.GetCurrentUserId();
        // User can see cargo if they're associated with the company OR they're the sender
        if (cargo.SenderId != userId && !await authService.IsAssociatedWithCompany(userId, cargo.CompanyId))
        {
            return Forbid();
        }

        return Ok(cargo);
    }
]
    [HttpGet("by-company/{companyId:int}")
    public async Task<IActionResult> GetByCompanyId(int companyId)
    {
        var userId = authService.GetCurrentUserId();

        // Check if user is associated with this company
        if (!await authService.IsAssociatedWithCompany(userId, companyId))
        {
            return Forbid();
        }

        var cargos = await cargoRepository.GetByCompanyIdAsync(companyId);
        return Ok(cargos);
    }

    [HttpGet("by-sender/{senderId:int}")]
    public async Task<IActionResult> GetBySenderId(int senderId)
    {
        var userId = authService.GetCurrentUserId();
        var cargos = await cargoRepository.GetBySenderIdAsync(senderId);

        // Users can see their own sent cargo
        if (userId == senderId)
        {
            return Ok(cargos);
        }

        // Others can only see cargo for companies they're associated with
        var visibleCargos = new List<Cargo>();
        foreach (var cargo in cargos)
        {
            if (await authService.IsAssociatedWithCompany(userId, cargo.CompanyId))
            {
                visibleCargos.Add(cargo);
            }
        }

        return Ok(visibleCargos);
    }

    [HttpGet("by-reciever/{recieverId:int}")]
    public async Task<IActionResult> GetByRecieverId(int recieverId)
    {
        var userId = authService.GetCurrentUserId();
        var cargos = await cargoRepository.GetByRecieverIdAsync(recieverId);

        // Filter to cargo the user can see
        var visibleCargos = new List<Cargo>();
        foreach (var cargo in cargos)
        {
            if (cargo.SenderId == userId || await authService.IsAssociatedWithCompany(userId, cargo.CompanyId))
            {
                visibleCargos.Add(cargo);
            }
        }

        return Ok(visibleCargos);
    }

    [HttpGet("by-employee/{employeeId:int}")]
    public async Task<IActionResult> GetByEmployeeId(int employeeId)
    {
        var userId = authService.GetCurrentUserId();
        var cargos = await cargoRepository.GetByEmployeeIdAsync(employeeId);

        // Filter to cargo the user can see
        var visibleCargos = new List<Cargo>();
        foreach (var cargo in cargos)
        {
            if (cargo.SenderId == userId || await authService.IsAssociatedWithCompany(userId, cargo.CompanyId))
            {
                visibleCargos.Add(cargo);
            }
        }

        return Ok(visibleCargos);
    }

    [HttpGet("by-status/{status}")]
    public async Task<IActionResult> GetByStatus(CargoStatusEnum status)
    {
        var userId = authService.GetCurrentUserId();
        var cargos = await cargoRepository.GetByStatusAsync(status);

        // Filter to cargo the user can see
        var visibleCargos = new List<Cargo>();
        foreach (var cargo in cargos)
        {
            if (cargo.SenderId == userId || await authService.IsAssociatedWithCompany(userId, cargo.CompanyId))
            {
                visibleCargos.Add(cargo);
            }
        }

        return Ok(visibleCargos);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCargoDto dto)
    {
        var userId = authService.GetCurrentUserId();

        // Only Admin or Office employees can create cargo (not couriers)
        var role = await authService.GetRoleInCompany(userId, dto.CompanyId);
        if (role == null || role == EmployeeRoleEnum.Courier)
        {
            return Forbid();
        }

        // Auto-create client records for sender and receiver if they don't exist
        await EnsureClientExists(dto.SenderId, dto.CompanyId);
        await EnsureClientExists(dto.RecieverId, dto.CompanyId);

        var cargo = new Cargo
        {
            EmployeeId = dto.EmployeeId,
            SenderId = dto.SenderId,
            RecieverId = dto.RecieverId,
            CompanyId = dto.CompanyId,
            SenderAddress = dto.SenderAddress,
            RecieverAddress = dto.RecieverAddress,
            CargoStatus = dto.CargoStatus,
            Weight = dto.Weight,
            Price = dto.Price,
            ArrivalDate = dto.ArrivalDate,
            ArrivalLocationType = dto.ArrivalLocationType,
            OfficeDeliveredToId = dto.OfficeDeliveredToId
        };

        await cargoRepository.InsertAsync(cargo);

        return CreatedAtAction(nameof(GetById), new { id = cargo.Id }, cargo);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CargoDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest(new { Message = "Несъответствие на ID" });
        }

        var cargo = await cargoRepository.GetByIdAsync(id);
        if (cargo == null)
        {
            return NotFound();
        }

        var userId = authService.GetCurrentUserId();

        // Only Admin or Office employees can edit cargo (not couriers)
        var role = await authService.GetRoleInCompany(userId, cargo.CompanyId);
        if (role == null || role == EmployeeRoleEnum.Courier)
        {
            return Forbid();
        }

        cargo.EmployeeId = dto.EmployeeId;
        cargo.SenderId = dto.SenderId;
        cargo.RecieverId = dto.RecieverId;
        cargo.CompanyId = dto.CompanyId;
        cargo.SenderAddress = dto.SenderAddress;
        cargo.RecieverAddress = dto.RecieverAddress;
        cargo.CargoStatus = dto.CargoStatus;
        cargo.Weight = dto.Weight;
        cargo.Price = dto.Price;
        cargo.ArrivalDate = dto.ArrivalDate;
        cargo.ArrivalLocationType = dto.ArrivalLocationType;
        cargo.OfficeDeliveredToId = dto.OfficeDeliveredToId;

        await cargoRepository.UpdateAsync(cargo);

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cargo = await cargoRepository.GetByIdAsync(id);
        if (cargo == null)
        {
            return NotFound();
        }

        var userId = authService.GetCurrentUserId();

        // Only Admin or Office employees can delete cargo (not couriers)
        var role = await authService.GetRoleInCompany(userId, cargo.CompanyId);
        if (role == null || role == EmployeeRoleEnum.Courier)
        {
            return Forbid();
        }

        await cargoRepository.DeleteAsync(cargo);

        return NoContent();
    }

    private async Task EnsureClientExists(int userId, int companyId)
    {
        var existingClients = await clientRepository.GetByUserIdAsync(userId);
        if (!existingClients.Any(c => c.CompanyId == companyId))
        {
            var client = new Client
            {
                UserId = userId,
                CompanyId = companyId
            };
            await clientRepository.InsertAsync(client);
        }
    }
}
