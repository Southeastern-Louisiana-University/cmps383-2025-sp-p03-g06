// Controllers/UsersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Authorization;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController(RoleManager<Role> roleManager, UserManager<User> userManager, DataContext dataContext) : ControllerBase
    {
        private readonly UserManager<User> userManager = userManager;
        private readonly RoleManager<Role> roleManager = roleManager;
        private readonly DataContext dataContext = dataContext;
        private readonly DbSet<Role> roles = dataContext.Set<Role>();

        [HttpPost("register")]
        [AllowAnonymous] // Explicitly allow unauthenticated access
        public async Task<ActionResult<UserDto>> Register([FromBody] CreateUserDto dto)
        {
            if (dto == null)
            {
                return BadRequest("User data is required");
            }

            if (string.IsNullOrWhiteSpace(dto.Username))
            {
                return BadRequest("Username is required");
            }

            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return BadRequest("Password is required");
            }

            // For security, override any roles provided and only assign the User role
            // This prevents privilege escalation during registration
            var userRoles = new string[] { UserRoleNames.User };

            var user = new User { UserName = dto.Username };
            var createResult = await userManager.CreateAsync(user, dto.Password);
            if (!createResult.Succeeded)
            {
                return BadRequest(createResult.Errors.Select(e => e.Description));
            }

            var existingUser = await userManager.FindByNameAsync(dto.Username);
            if (existingUser == null)
            {
                return BadRequest("Failed to create user");
            }

            var rolesResult = await userManager.AddToRolesAsync(existingUser, userRoles);
            if (!rolesResult.Succeeded)
            {
                // Clean up by deleting the user since role assignment failed
                await userManager.DeleteAsync(existingUser);
                return BadRequest(rolesResult.Errors.Select(e => e.Description));
            }

            return new UserDto
            {
                Id = existingUser.Id,
                UserName = existingUser.UserName ?? string.Empty,
                Roles = userRoles
            };
        }
    }
}