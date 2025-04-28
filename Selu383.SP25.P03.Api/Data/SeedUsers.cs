// Data/SeedUsers.cs (updated to add a manager)
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Users;
using Selu383.SP25.P03.Api.Features.Authorization;

namespace Selu383.SP25.P03.Api.Data
{
    public static class SeedUsers
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions<DataContext>>());

            // Look for any users
            if (context.Users.Any())
            {
                return;   // DB has been seeded
            }

            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<Role>>();

            // Ensure roles exist
            if (!await roleManager.RoleExistsAsync(UserRoleNames.Admin))
            {
                await roleManager.CreateAsync(new Role { Name = UserRoleNames.Admin, NormalizedName = UserRoleNames.Admin.ToUpper() });
            }
            if (!await roleManager.RoleExistsAsync(UserRoleNames.Manager))
            {
                await roleManager.CreateAsync(new Role { Name = UserRoleNames.Manager, NormalizedName = UserRoleNames.Manager.ToUpper() });
            }
            if (!await roleManager.RoleExistsAsync(UserRoleNames.User))
            {
                await roleManager.CreateAsync(new Role { Name = UserRoleNames.User, NormalizedName = UserRoleNames.User.ToUpper() });
            }
            if (!await roleManager.RoleExistsAsync(UserRoleNames.Guest))
            {
                await roleManager.CreateAsync(new Role { Name = UserRoleNames.Guest, NormalizedName = UserRoleNames.Guest.ToUpper() });
            }

            await CreateAdminUser(userManager, "galkadi", "Password123!");
            await CreateManagerUser(userManager, "manager", "Password123!");
            await CreateRegularUser(userManager, "bob", "Password123!");
            await CreateRegularUser(userManager, "sue", "Password123!");
            context.SaveChanges();
        }

        private static async Task CreateAdminUser(UserManager<User> userManager, string username, string password)
        {
            var user = new User { UserName = username };
            var createResult = await userManager.CreateAsync(user, password);
            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(user, UserRoleNames.Admin);
            }
            else
            {
                // Log the error or handle it appropriately
                Console.WriteLine($"Failed to create admin user {username}: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
            }
        }

        private static async Task CreateManagerUser(UserManager<User> userManager, string username, string password)
        {
            var user = new User { UserName = username };
            var createResult = await userManager.CreateAsync(user, password);
            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(user, UserRoleNames.Manager);
            }
            else
            {
                // Log the error or handle it appropriately
                Console.WriteLine($"Failed to create manager user {username}: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
            }
        }

        private static async Task CreateRegularUser(UserManager<User> userManager, string username, string password)
        {
            var user = new User { UserName = username };
            var createResult = await userManager.CreateAsync(user, password);
            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(user, UserRoleNames.User);
            }
            else
            {
                // Log the error or handle it appropriately
                Console.WriteLine($"Failed to create regular user {username}: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
            }
        }
    }
}