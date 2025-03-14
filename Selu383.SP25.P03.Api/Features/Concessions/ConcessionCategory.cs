// Features/Concessions/ConcessionCategory.cs
using System.ComponentModel.DataAnnotations;

namespace Selu383.SP25.P03.Api.Features.Concessions
{
    public class ConcessionCategory
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        // Navigation properties
        public virtual ICollection<ConcessionItem> Items { get; set; } = new List<ConcessionItem>();
    }
}