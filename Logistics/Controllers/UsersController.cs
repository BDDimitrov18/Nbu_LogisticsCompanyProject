using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    // GET
    [HttpGet]
    public IActionResult Get()
    {
        return Ok();
    }
}