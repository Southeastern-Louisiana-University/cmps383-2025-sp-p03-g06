// Features/Theaters/SeatDTO.cs
namespace Selu383.SP25.P03.Api.Features.Theaters
{
    public class SeatDTO
    {
        public int Id { get; set; }
        public int TheaterRoomId { get; set; }
        public required string Row { get; set; }
        public int Number { get; set; }
        public string? SeatType { get; set; }
        public bool IsAvailable { get; set; }
    }
}