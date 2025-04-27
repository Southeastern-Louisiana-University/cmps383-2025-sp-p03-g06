namespace Selu383.SP25.P03.Api.Features.Concessions;

public class Concession
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string Category { get; set; } = "Other";
} 