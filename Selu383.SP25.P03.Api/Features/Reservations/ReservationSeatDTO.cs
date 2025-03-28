// Features/Reservations/ReservationSeatDTO.cs
namespace Selu383.SP25.P03.Api.Features.Reservations
{
    public class ReservationSeatDTO
    {
        public int SeatId { get; set; }
        public string? Row { get; set; }
        public int Number { get; set; }
        public string? SeatType { get; set; }
        public decimal Price { get; set; }
    }
}