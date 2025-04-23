// Features/Movies/Movie.cs
using Selu383.SP25.P03.Api.Features.Showtimes;
using System.ComponentModel.DataAnnotations;

namespace Selu383.SP25.P03.Api.Features.Movies
{
    public class Movie
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public required string Title { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public int DurationMinutes { get; set; }

        [MaxLength(10)]
        public string? Rating { get; set; } // G, PG, PG-13, R, etc.

        public string? PosterImageUrl { get; set; }

        public string? TrailerUrl { get; set; } //add trailer

        public DateTime ReleaseDate { get; set; }

        // Navigation properties
        public virtual ICollection<MovieGenre> MovieGenres { get; set; } = new List<MovieGenre>();
        public virtual ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
    }
}