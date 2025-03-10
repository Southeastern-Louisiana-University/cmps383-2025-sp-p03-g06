namespace Selu383.SP25.P03.Api.Features.Showtimes
{
    public class ShowtimeDto
    {
        public int Id { get; set; } 
        public int MovieId { get; set; } 
        public required string MovieTitle { get; set; } 
        public int TheaterId { get; set; } 
        public required string TheaterName { get; set; } 
        public DateTime ShowtimeTime { get; set; } 
    }
}
