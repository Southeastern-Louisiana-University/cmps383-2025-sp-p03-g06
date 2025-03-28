// Features/Concessions/OrderItem.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Selu383.SP25.P03.Api.Features.Concessions
{
    public class OrderItem
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public virtual ConcessionOrder? Order { get; set; }

        public int ConcessionItemId { get; set; }
        public virtual ConcessionItem? ConcessionItem { get; set; }

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [MaxLength(200)]
        public string? SpecialInstructions { get; set; }
    }
}