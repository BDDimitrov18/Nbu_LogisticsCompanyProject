using DataLayer;
using DataLayer.DTOs.Create;
using DataLayer.DTOs.Edit;
using DataLayer.Entities;
using DataLayer.Repositories.CargoRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CargosController(ICargoRepository cargoRepository) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cargo = await cargoRepository.GetByIdAsync(id);
        if (cargo == null)
        {
            return NotFound();
        }

        return Ok(cargo);
    }

    [HttpGet("by-company/{companyId:int}")]
    public async Task<IActionResult> GetByCompanyId(int companyId)
    {
        var cargos = await cargoRepository.GetByCompanyIdAsync(companyId);
        return Ok(cargos);
    }

    [HttpGet("by-sender/{senderId:int}")]
    public async Task<IActionResult> GetBySenderId(int senderId)
    {
        var cargos = await cargoRepository.GetBySenderIdAsync(senderId);
        return Ok(cargos);
    }

    [HttpGet("by-reciever/{recieverId:int}")]
    public async Task<IActionResult> GetByRecieverId(int recieverId)
    {
        var cargos = await cargoRepository.GetByRecieverIdAsync(recieverId);
        return Ok(cargos);
    }

    [HttpGet("by-employee/{employeeId:int}")]
    public async Task<IActionResult> GetByEmployeeId(int employeeId)
    {
        var cargos = await cargoRepository.GetByEmployeeIdAsync(employeeId);
        return Ok(cargos);
    }

    [HttpGet("by-status/{status}")]
    public async Task<IActionResult> GetByStatus(CargoStatusEnum status)
    {
        var cargos = await cargoRepository.GetByStatusAsync(status);
        return Ok(cargos);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCargoDto dto)
    {
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
            return BadRequest(new { Message = "Id mismatch" });
        }

        var cargo = await cargoRepository.GetByIdAsync(id);
        if (cargo == null)
        {
            return NotFound();
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

        await cargoRepository.DeleteAsync(cargo);

        return NoContent();
    }
}
