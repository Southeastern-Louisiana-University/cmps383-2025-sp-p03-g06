// Features/Concessions/OrderItemDTO.cs
namespace Selu383.SP25.P03.Api.Features.Concessions
{
    public class OrderItemDTO
    {
        public int Id { get; set; }
        public int ConcessionItemId { get; set; }
        public string? ItemName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? SpecialInstructions { get; set; }
    }
}