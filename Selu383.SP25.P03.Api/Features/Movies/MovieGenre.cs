// Features/Movies/MovieGenre.cs
namespace Selu383.SP25.P03.Api.Features.Movies
{
    public class MovieGenre
    {
        public int MovieId { get; set; }
        public int GenreId { get; set; }

        // Navigation properties
        public virtual Movie? Movie { get; set; }
        public virtual Genre? Genre { get; set; }
    }
}