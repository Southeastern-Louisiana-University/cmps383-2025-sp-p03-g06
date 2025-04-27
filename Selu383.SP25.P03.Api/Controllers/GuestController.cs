// Controllers/GuestController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Users;
using System;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/guest")]
    [ApiController]
    public class GuestController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly DataContext _dataContext;

        public GuestController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            DataContext dataContext)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _dataContext = dataContext;
        }

        // Create a temporary guest user
        [HttpPost("create")]
        public async Task<ActionResult<UserDto>> CreateGuestUser([FromBody] GuestUserDto guestInfo)
        {
            // Validate email
            if (string.IsNullOrWhiteSpace(guestInfo.Email))
            {
                return BadRequest("Email is required for guest checkout");
            }

            // Create a unique guest username
            string guestUsername = $"guest_{Guid.NewGuid().ToString("N").Substring(0, 8)}";

            // Create a temporary password
            string tempPassword = Guid.NewGuid().ToString("N").Substring(0, 12) + "!A9";

            // Create the guest user
            var user = new User
            {
                UserName = guestUsername,
                Email = guestInfo.Email,
                PhoneNumber = guestInfo.PhoneNumber
            };

            var createResult = await _userManager.CreateAsync(user, tempPassword);
            if (!createResult.Succeeded)
            {
                return BadRequest(createResult.Errors.Select(e => e.Description));
            }

            // Add the guest role
            await _userManager.AddToRoleAsync(user, UserRoleNames.Guest);

            // Sign in the guest user
            await _signInManager.PasswordSignInAsync(guestUsername, tempPassword, false, false);

            return new UserDto
            {
                Id = user.Id,
                UserName = user.UserName ?? string.Empty,
                Roles = new[] { UserRoleNames.Guest }
            };
        }
    }
}

// Add this new DTO class to the same file or create a separate file
public class GuestUserDto
{
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
}