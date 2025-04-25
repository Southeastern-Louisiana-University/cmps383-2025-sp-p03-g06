using Microsoft.AspNetCore.Identity;

namespace Selu383.SP25.P03.Api.Features.Authorization;

public class Role : IdentityRole<int>
{
    public virtual ICollection<UserRole> UserRoles { get; set; }
} 