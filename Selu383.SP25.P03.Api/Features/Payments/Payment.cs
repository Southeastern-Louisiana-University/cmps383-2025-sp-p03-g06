using Selu383.SP25.P03.Api.Features.Concessions;
using Selu383.SP25.P03.Api.Features.Reservations;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Selu383.SP25.P03.Api.Features.Payments;

public class Payment
{
    public int Id { get; set; }

    public int? ReservationId { get; set; }
    public virtual Reservation? Reservation { get; set; }

    public int? ConcessionOrderId { get; set; }
    public virtual ConcessionOrder? ConcessionOrder { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public DateTime PaymentTime { get; set; }

    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "Credit Card";

    [MaxLength(50)]
    public string PaymentStatus { get; set; } = "Pending";

    [MaxLength(100)]
    public string? TransactionId { get; set; }

    [MaxLength(500)]
    public string? PaymentDetails { get; set; }
} 