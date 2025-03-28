// Features/Showtimes/ShowtimeDTO.cs
namespace Selu383.SP25.P03.Api.Features.Showtimes
{
    public class ShowtimeDTO
    {
        public int Id { get; set; }
        public int MovieId { get; set; }
        public string? MovieTitle { get; set; }
        public int TheaterRoomId { get; set; }
        public string? TheaterRoomName { get; set; }
        public int TheaterId { get; set; }
        public string? TheaterName { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal BaseTicketPrice { get; set; }
    }
}