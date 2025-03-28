// Features/Theaters/Seat.cs
using Selu383.SP25.P03.Api.Features.Reservations;
using System.ComponentModel.DataAnnotations;

namespace Selu383.SP25.P03.Api.Features.Theaters
{
    public class Seat
    {
        public int Id { get; set; }

        public int TheaterRoomId { get; set; }
        public virtual TheaterRoom? TheaterRoom { get; set; }

        [Required]
        [MaxLength(10)]
        public required string Row { get; set; } // e.g., "A", "B", etc.

        public int Number { get; set; } // e.g., 1, 2, 3, etc.

        [MaxLength(50)]
        public string? SeatType { get; set; } // e.g., "Standard", "Premium", "Accessible"

        // Navigation properties
        public virtual ICollection<ReservationSeat> ReservationSeats { get; set; } = new List<ReservationSeat>();
    }
}