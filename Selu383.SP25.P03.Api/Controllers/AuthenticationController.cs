// Controllers/AuthenticationController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/authentication")]
    public class AuthenticationController(SignInManager<User> signInManager, UserManager<User> userManager, DataContext dataContext) : ControllerBase
    {
        private readonly SignInManager<User> signInManager = signInManager;
        private readonly UserManager<User> userManager = userManager;
        private readonly DataContext dataContext = dataContext;
        private readonly DbSet<User> users = dataContext.Set<User>();

        [HttpPost]
        [Route("login")]
        public async Task<ActionResult<UserDto>> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.UserName) || string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("Username and password are required");
            }
            var result = await signInManager.PasswordSignInAsync(dto.UserName, dto.Password, false, false);
            if (result.Succeeded)
            {
                var user = await userManager.FindByNameAsync(dto.UserName);
                if (user == null)
                {
                    return BadRequest("User not found");
                }
                return new UserDto
                {
                    Id = user.Id,
                    UserName = user.UserName ?? string.Empty,
                    Roles = (await userManager.GetRolesAsync(user)).ToArray() ?? []
                };
            }
            return BadRequest("Invalid login attempt");
        }

        [HttpGet]
        [Route("me")]
        [Authorize]
        public async Task<ActionResult<UserDto>> Me()
        {
            var user = await userManager.GetUserAsync(User);
            if (user == null)
            {
                return BadRequest("User not found");
            }
            var roles = await userManager.GetRolesAsync(user);
            return new UserDto
            {
                Id = user.Id,
                UserName = user.UserName ?? string.Empty,
                Roles = roles?.ToArray() ?? []
            };
        }

        [HttpPost]
        [Route("logout")]
        [Authorize]
        public async Task<ActionResult> Logout()
        {
            await signInManager.SignOutAsync();
            return Ok();
        }
    }
}