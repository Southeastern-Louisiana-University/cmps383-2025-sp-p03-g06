// Features/Concessions/ConcessionOrder.cs
using Selu383.SP25.P03.Api.Features.Reservations;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Selu383.SP25.P03.Api.Features.Concessions
{
    public class ConcessionOrder
    {
        public int Id { get; set; }

        public int ReservationId { get; set; }
        public virtual Reservation? Reservation { get; set; }

        public DateTime OrderTime { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        [MaxLength(50)]
        public string? Status { get; set; } // e.g., "Pending", "Preparing", "Delivered"

        {MaxLength(50)]
            public string? SeatNumber { get; set; } 

        // Navigation properties
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}