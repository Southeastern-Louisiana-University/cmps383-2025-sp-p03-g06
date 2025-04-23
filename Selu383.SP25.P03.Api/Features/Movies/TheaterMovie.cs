// Features/Movies/TheaterMovie.cs
using Selu383.SP25.P03.Api.Features.Theaters;

namespace Selu383.SP25.P03.Api.Features.Movies
{
    public class TheaterMovie
    {
        public int MovieId { get; set; }
        public int TheaterId { get; set; }

        // Navigation properties
        public virtual Movie? Movie { get; set; }
        public virtual Theater? Theater { get; set; }
    }
}