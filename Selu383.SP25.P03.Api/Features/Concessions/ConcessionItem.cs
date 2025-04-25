// Features/Concessions/ConcessionItem.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Selu383.SP25.P03.Api.Features.OrderItems;

namespace Selu383.SP25.P03.Api.Features.Concessions
{
    public class ConcessionItem
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public string? ImageUrl { get; set; }

        public int CategoryId { get; set; }
        public virtual ConcessionCategory? Category { get; set; }

        public bool IsAvailable { get; set; } = true;

        // Navigation properties
        public virtual ICollection<OrderItem> OrderItems { get; set; } = [];
    }
}