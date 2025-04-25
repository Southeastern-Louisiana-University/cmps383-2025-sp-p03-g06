// Features/Movies/MovieDTO.cs
namespace Selu383.SP25.P03.Api.Features.Movies
{
    public class MovieDTO
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public int DurationMinutes { get; set; }
        public string? Rating { get; set; }
        public string? PosterImageUrl { get; set; }
        public string? TrailerUrl { get; set; } // Added trailer
        public DateTime ReleaseDate { get; set; }
        public double? RatingScore { get; set; } // Rating score out of 10
        public List<string> Genres { get; set; } = new List<string>();
    }
}