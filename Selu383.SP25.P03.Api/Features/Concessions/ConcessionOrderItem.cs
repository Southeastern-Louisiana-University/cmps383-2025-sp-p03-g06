namespace Selu383.SP25.P03.Api.Features.Concessions;

public class ConcessionOrderItem
{
    public int Id { get; set; }
    public int ConcessionOrderId { get; set; }
    public ConcessionOrder? ConcessionOrder { get; set; }
    public int ConcessionId { get; set; }
    public Concession? Concession { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
} 