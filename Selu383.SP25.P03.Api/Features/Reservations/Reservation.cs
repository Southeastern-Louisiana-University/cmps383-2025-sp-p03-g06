// Features/Reservations/Reservation.cs
using Selu383.SP25.P03.Api.Features.Concessions;
using Selu383.SP25.P03.Api.Features.Showtimes;
using Selu383.SP25.P03.Api.Features.Users;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Selu383.SP25.P03.Api.Features.Reservations
{
    public class Reservation
    {
        public int Id { get; set; }

        public int? UserId { get; set; }
        public virtual User? User { get; set; }

        public int ShowtimeId { get; set; }
        public virtual Showtime? Showtime { get; set; }

        public DateTime ReservationTime { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled

        // QR code data
        [MaxLength(100)]
        public string? TicketCode { get; set; }

        public string? GuestName { get; set; }
        public string? GuestEmail { get; set; }
        public string? GuestPhone { get; set; }
        public string? ConfirmationCode { get; set; }

        // Navigation properties
        public virtual ICollection<ReservationSeat> ReservationSeats { get; set; } = new List<ReservationSeat>();
        public virtual ICollection<ConcessionOrder> ConcessionOrders { get; set; } = new List<ConcessionOrder>();
    }
}