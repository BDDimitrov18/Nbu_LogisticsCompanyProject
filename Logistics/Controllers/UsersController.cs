using Microsoft.AspNetCore.Mvc;

namespace Logistics.Controllers;

public class UsersController : Controller
{
    // GET
    public IActionResult Index()
    {
        return View();
    }
}