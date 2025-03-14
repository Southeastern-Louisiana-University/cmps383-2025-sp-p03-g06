// Features/Reservations/ReservationSeat.cs
using Selu383.SP25.P03.Api.Features.Theaters;
using System.ComponentModel.DataAnnotations.Schema;

namespace Selu383.SP25.P03.Api.Features.Reservations
{
    public class ReservationSeat
    {
        public int ReservationId { get; set; }
        public virtual Reservation? Reservation { get; set; }

        public int SeatId { get; set; }
        public virtual Seat? Seat { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
    }
}