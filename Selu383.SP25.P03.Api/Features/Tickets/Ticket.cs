using Selu383.SP25.P03.Api.Features.Showtimes;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Features.Tickets
{
    public class Ticket
    {
        public int Id { get; set; }
        public int ShowtimeId { get; set; }
        public int UserId { get; set; }
        public bool IsPurchased { get; set; }
        public DateTime PurchaseDate { get; set; }

        public Showtime? Showtime { get; set; }
        public User? User { get; set; }
    }
}
