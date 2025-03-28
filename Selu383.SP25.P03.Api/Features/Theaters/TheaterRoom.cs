// Features/Theaters/TheaterRoom.cs
using Selu383.SP25.P03.Api.Features.Showtimes;
using System.ComponentModel.DataAnnotations;

namespace Selu383.SP25.P03.Api.Features.Theaters
{
    public class TheaterRoom
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        public int TheaterId { get; set; }
        public virtual Theater? Theater { get; set; }

        public int SeatCount { get; set; }

        [MaxLength(50)]
        public string? ScreenType { get; set; } // e.g., "Standard", "IMAX", "4D"

        // Navigation properties
        public virtual ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
        public virtual ICollection<Seat> Seats { get; set; } = new List<Seat>();
    }
}