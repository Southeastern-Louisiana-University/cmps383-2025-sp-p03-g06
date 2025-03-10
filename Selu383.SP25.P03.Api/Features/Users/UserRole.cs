using Microsoft.AspNetCore.Identity;

namespace Selu383.SP25.P03.Api.Features.Users
{
    public class UserRole : IdentityUserRole<int>
    {
        public virtual required User User { get; set; } 
        public virtual required Role Role { get; set; }
    }
}
