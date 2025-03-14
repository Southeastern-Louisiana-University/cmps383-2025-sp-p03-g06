// Features/Showtimes/Showtime.cs
using Selu383.SP25.P03.Api.Features.Movies;
using Selu383.SP25.P03.Api.Features.Reservations;
using Selu383.SP25.P03.Api.Features.Theaters;
using System.ComponentModel.DataAnnotations.Schema;

namespace Selu383.SP25.P03.Api.Features.Showtimes
{
    public class Showtime
    {
        public int Id { get; set; }

        public int MovieId { get; set; }
        public virtual Movie? Movie { get; set; }

        public int TheaterRoomId { get; set; }
        public virtual TheaterRoom? TheaterRoom { get; set; }

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal BaseTicketPrice { get; set; }

        // Navigation properties
        public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}