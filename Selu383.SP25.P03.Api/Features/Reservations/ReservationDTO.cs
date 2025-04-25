// Features/Reservations/ReservationDTO.cs
namespace Selu383.SP25.P03.Api.Features.Reservations
{
    public class ReservationDTO
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
        public int ShowtimeId { get; set; }
        public DateTime ShowtimeStartTime { get; set; }
        public string? MovieTitle { get; set; }
        public string? TheaterName { get; set; }
        public string? RoomName { get; set; }
        public DateTime ReservationTime { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Status { get; set; }
        public string? TicketCode { get; set; }
        public List<ReservationSeatDTO> Seats { get; set; } = new List<ReservationSeatDTO>();
    }
}