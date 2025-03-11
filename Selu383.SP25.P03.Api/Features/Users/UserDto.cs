namespace Selu383.SP25.P03.Api.Features.Users
{
    public class UserDto
    {
        public int Id { get; set; }
        public required string UserName { get; set; } = string.Empty;
        public string[] Roles { get; set; } = Array.Empty<string>();
    }
}