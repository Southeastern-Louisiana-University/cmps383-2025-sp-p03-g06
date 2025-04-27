using Selu383.SP25.P03.Api.Features.Showtimes;

namespace Selu383.SP25.P03.Api.Features.Reservations;

public static class ReservationExtensions
{
    public static ReservationDTO ToDto(this Reservation reservation)
    {
        return new ReservationDTO
        {
            Id = reservation.Id,
            ShowtimeId = reservation.ShowtimeId,
            ReservationTime = reservation.ReservationTime,
            TotalPrice = reservation.TotalPrice,
            Status = reservation.Status,
            TicketCode = reservation.TicketCode,
            MovieTitle = reservation.Showtime?.Movie?.Title ?? "Unknown Movie",
            TheaterName = reservation.Showtime?.TheaterRoom?.Theater?.Name ?? "Unknown Theater",
            RoomName = reservation.Showtime?.TheaterRoom?.Name ?? "Unknown Room",
            ShowtimeStartTime = reservation.Showtime?.StartTime ?? DateTime.MinValue,
            GuestEmail = reservation.GuestEmail,
            GuestPhone = reservation.GuestPhone,
            Seats = reservation.ReservationSeats
                .Select(rs => new ReservationSeatDTO
                {
                    SeatId = rs.SeatId,
                    Row = rs.Seat?.Row ?? string.Empty,
                    Number = rs.Seat?.Number ?? 0,
                    SeatType = rs.Seat?.SeatType ?? "Standard",
                    Price = rs.Price
                })
                .ToList()
        };
    }
} 