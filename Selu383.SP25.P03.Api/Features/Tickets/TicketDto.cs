namespace Selu383.SP25.P03.Api.Features.Tickets
{
    public class TicketDto
    {
        public int Id { get; set; }
        public int ShowtimeId { get; set; }
        public int UserId { get; set; }
        public bool IsPurchased { get; set; }
        public DateTime PurchaseDate { get; set; }

        public required string ShowtimeTime { get; set; } 
        public required string MovieTitle { get; set; }
    }
}

