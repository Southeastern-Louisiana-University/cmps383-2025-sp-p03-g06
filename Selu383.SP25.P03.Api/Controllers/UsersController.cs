using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<User> userManager;
        private readonly RoleManager<Role> roleManager;
        private readonly DataContext dataContext;
        private DbSet<Role> roles;

        public UsersController(
            RoleManager<Role> roleManager,
            UserManager<User> userManager,
            DataContext dataContext)
        {
            this.roleManager = roleManager;
            this.userManager = userManager;
            this.dataContext = dataContext;
            roles = dataContext.Set<Role>();
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto dto)
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

            if (dto.Roles == null || !dto.Roles.Any())
            {
                return BadRequest("At least one role is required");
            }

            // Check if all specified roles exist
            if (!dto.Roles.All(x => roles.Any(y => x == y.Name)))
            {
                return BadRequest("One or more roles do not exist");
            }

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

            var rolesResult = await userManager.AddToRolesAsync(existingUser, dto.Roles);
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
                Roles = dto.Roles ?? Array.Empty<string>() 
            };
        }
    }
}