using Microsoft.AspNetCore.Identity;
using Selu383.SP25.P03.Api.Features.Authorization;

namespace Selu383.SP25.P03.Api.Features.Users
{
    public class User : IdentityUser<int>
    {
        /// <summary>
        /// Navigation property for the roles this user belongs to.
        /// </summary>
        public string? Name { get; set; }
        public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}