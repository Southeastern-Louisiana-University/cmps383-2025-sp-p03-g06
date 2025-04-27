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

        public double? RatingScore { get; set; } // Rating score out of 10

        // Navigation properties
        public virtual ICollection<MovieGenre> MovieGenres { get; set; } = new List<MovieGenre>();
        public virtual ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
        public virtual ICollection<TheaterMovie> TheaterMovies { get; set; } = new List<TheaterMovie>();

    }
}