using Microsoft.AspNetCore.Identity;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Features.Authorization;

public class UserRole : IdentityUserRole<int>
{
    public virtual User? User { get; set; }
    public virtual Role? Role { get; set; }
} 