// Features/Theaters/TheaterRoomDTO.cs
namespace Selu383.SP25.P03.Api.Features.Theaters
{
    public class TheaterRoomDTO
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public int TheaterId { get; set; }
        public int SeatCount { get; set; }
        public string? ScreenType { get; set; }
    }
}