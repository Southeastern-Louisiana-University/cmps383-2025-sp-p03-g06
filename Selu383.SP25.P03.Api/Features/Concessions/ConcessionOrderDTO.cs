// Features/Concessions/ConcessionOrderDTO.cs
namespace Selu383.SP25.P03.Api.Features.Concessions
{
    public class ConcessionOrderDTO
    {
        public int Id { get; set; }
        public int ReservationId { get; set; }
        public DateTime OrderTime { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Status { get; set; }
        public List<OrderItemDTO> Items { get; set; } = new List<OrderItemDTO>();
    }
}