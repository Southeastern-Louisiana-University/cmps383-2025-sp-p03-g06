using Selu383.SP25.P03.Api.Features.Concessions;
using System.ComponentModel.DataAnnotations;

namespace Selu383.SP25.P03.Api.Features.OrderItems;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public virtual ConcessionOrder? Order { get; set; }
    public int ConcessionItemId { get; set; }
    public virtual ConcessionItem? ConcessionItem { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    [MaxLength(500)]
    public string? SpecialInstructions { get; set; }
} 