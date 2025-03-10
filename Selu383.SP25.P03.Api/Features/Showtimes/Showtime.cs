using Selu383.SP25.P03.Api.Features.Movies;
using Selu383.SP25.P03.Api.Features.Theaters;

namespace Selu383.SP25.P03.Api.Features.Showtimes
{
    public class Showtime
    {
        public int Id { get; set; } 
        public int MovieId { get; set; }
        public int TheaterId { get; set; }
        public DateTime ShowtimeTime { get; set; }

        public Movie Movie { get; set; }
        public Theater Theater { get; set; }
    }
}
    

