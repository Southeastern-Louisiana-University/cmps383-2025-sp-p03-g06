using Selu383.SP25.P03.Api.Features.OrderItems;
using Selu383.SP25.P03.Api.Features.Reservations;
using Selu383.SP25.P03.Api.Features.Showtimes;
using System.ComponentModel.DataAnnotations;

namespace Selu383.SP25.P03.Api.Features.Concessions;

public class ConcessionOrder
{
    public int Id { get; set; }
    public int ReservationId { get; set; }
    public virtual Reservation? Reservation { get; set; }
    public DateTime OrderTime { get; set; }
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = "Pending";

    // Guest information
    [MaxLength(100)]
    public string? GuestName { get; set; }
    [MaxLength(255)]
    public string? GuestEmail { get; set; }
    [MaxLength(20)]
    public string? GuestPhone { get; set; }
    [MaxLength(50)]
    public string? SeatNumber { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public bool IsValidOrderTime()
    {
        // Only check if the reservation and showtime exist
        if (Reservation?.Showtime == null)
        {
            return false;
        }

        // Allow orders at any time
        return true;
    }
}