// Features/Concessions/ConcessionItemDTO.cs
namespace Selu383.SP25.P03.Api.Features.Concessions
{
    public class ConcessionItemDTO
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public bool IsAvailable { get; set; }
    }
}