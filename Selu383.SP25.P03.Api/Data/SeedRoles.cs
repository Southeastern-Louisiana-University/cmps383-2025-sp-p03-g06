// Data/SeedRoles.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Authorization;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Data
{
    public static class SeedRoles
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions<DataContext>>());
            {
                // Look for any roles.
                if (context.Roles.Any())
                {
                    return;   // DB has been seeded
                }
                var roleManager = serviceProvider.GetRequiredService<RoleManager<Role>>();
                
                // Create roles with proper normalized names
                await roleManager.CreateAsync(new Role { Name = UserRoleNames.Admin, NormalizedName = UserRoleNames.Admin.ToUpper() });
                await roleManager.CreateAsync(new Role { Name = UserRoleNames.Manager, NormalizedName = UserRoleNames.Manager.ToUpper() });
                await roleManager.CreateAsync(new Role { Name = UserRoleNames.User, NormalizedName = UserRoleNames.User.ToUpper() });
                await roleManager.CreateAsync(new Role { Name = UserRoleNames.Guest, NormalizedName = UserRoleNames.Guest.ToUpper() });
                
                context.SaveChanges();
            }
        }
    }
}