// Features/Reservations/ReservationSeatDTO.cs
namespace Selu383.SP25.P03.Api.Features.Reservations
{
    public class ReservationSeatDTO
    {
        public int SeatId { get; set; }
        public string Row { get; set; } = string.Empty;
        public int Number { get; set; }
        public string SeatNumber { get; set; } = string.Empty;
        public string SeatType { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}