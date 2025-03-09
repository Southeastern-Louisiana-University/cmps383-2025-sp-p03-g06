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
            if (dto.Roles == null || !dto.Roles.Any() || !dto.Roles.All(x => roles.Any(y => x == y.Name)))
            {
                return BadRequest();
            }

            var createResult = await userManager.CreateAsync(new User { UserName = dto.Username }, dto.Password);
            if (!createResult.Succeeded)
            {
                return BadRequest();

            }

            var existingUser = await userManager.FindByNameAsync(dto.Username);
            if (existingUser == null)
            {
                return BadRequest();
            }

            var rolesResult = await userManager.AddToRolesAsync(existingUser, dto.Roles);
            if (!rolesResult.Succeeded)
            {
                return BadRequest();
            }

            return new UserDto
            {
                Id = existingUser.Id,
                UserName = existingUser.UserName,
                Roles = dto.Roles
            };
        }
    }
}