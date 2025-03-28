// Features/Movies/Genre.cs
using System.ComponentModel.DataAnnotations;

namespace Selu383.SP25.P03.Api.Features.Movies
{
    public class Genre
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        // Navigation properties
        public virtual ICollection<MovieGenre> MovieGenres { get; set; } = new List<MovieGenre>();
    }
}