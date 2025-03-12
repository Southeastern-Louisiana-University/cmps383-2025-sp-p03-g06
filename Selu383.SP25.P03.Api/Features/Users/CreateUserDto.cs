namespace Selu383.SP25.P03.Api.Features.Users
{
    public class CreateUserDto
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string[] Roles { get; set; } = Array.Empty<string>();
    }
}