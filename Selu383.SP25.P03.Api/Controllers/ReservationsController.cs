// Controllers/ReservationsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Reservations;
using Selu383.SP25.P03.Api.Features.Showtimes;
using Selu383.SP25.P03.Api.Features.Users;
using System.Security.Cryptography;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/reservations")]
    [ApiController]
    [Authorize]
    public class ReservationsController(DataContext context, UserManager<User> userManager) : ControllerBase
    {
        private readonly DataContext _context = context;
        private readonly DbSet<Reservation> _reservations = context.Set<Reservation>();
        private readonly DbSet<Showtime> _showtimes = context.Set<Showtime>();
        private readonly UserManager<User> _userManager = userManager;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservationDTO>>> GetMyReservations()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var reservations = await _reservations
                .Include(r => r.User)
                .Include(r => r.Showtime)
                    .ThenInclude(s => s!.Movie)
                .Include(r => r.Showtime)
                    .ThenInclude(s => s!.TheaterRoom)
                        .ThenInclude(tr => tr!.Theater)
                .Include(r => r.ReservationSeats)
                    .ThenInclude(rs => rs.Seat)
                .Where(r => r.UserId == currentUser.Id)
                .Select(r => new ReservationDTO
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User!.UserName ?? string.Empty,
                    ShowtimeId = r.ShowtimeId,
                    ShowtimeStartTime = r.Showtime!.StartTime,
                    MovieTitle = r.Showtime!.Movie!.Title ?? string.Empty,
                    TheaterName = r.Showtime!.TheaterRoom!.Theater!.Name ?? string.Empty,
                    RoomName = r.Showtime!.TheaterRoom!.Name ?? string.Empty,
                    ReservationTime = r.ReservationTime,
                    TotalPrice = r.TotalPrice,
                    Status = r.Status ?? string.Empty,
                    TicketCode = r.TicketCode ?? string.Empty,
                    Seats = r.ReservationSeats.Select(rs => new ReservationSeatDTO
                    {
                        SeatId = rs.SeatId,
                        Row = rs.Seat!.Row,
                        Number = rs.Seat!.Number,
                        SeatType = rs.Seat!.SeatType ?? string.Empty,
                        Price = rs.Price
                    }).ToList()
                })
                .ToListAsync();

            return Ok(reservations);
        }

        [HttpGet("all")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<IEnumerable<ReservationDTO>>> GetAllReservations()
        {
            var reservations = await _reservations
                .Include(r => r.User)
                .Include(r => r.Showtime)
                    .ThenInclude(s => s!.Movie)
                .Include(r => r.Showtime)
                    .ThenInclude(s => s!.TheaterRoom)
                        .ThenInclude(tr => tr!.Theater)
                .Include(r => r.ReservationSeats)
                    .ThenInclude(rs => rs.Seat)
                .Select(r => new ReservationDTO
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User!.UserName ?? string.Empty,
                    ShowtimeId = r.ShowtimeId,
                    ShowtimeStartTime = r.Showtime!.StartTime,
                    MovieTitle = r.Showtime!.Movie!.Title ?? string.Empty,
                    TheaterName = r.Showtime!.TheaterRoom!.Theater!.Name ?? string.Empty,
                    RoomName = r.Showtime!.TheaterRoom!.Name ?? string.Empty,
                    ReservationTime = r.ReservationTime,
                    TotalPrice = r.TotalPrice,
                    Status = r.Status ?? string.Empty,
                    TicketCode = r.TicketCode ?? string.Empty,
                    Seats = r.ReservationSeats.Select(rs => new ReservationSeatDTO
                    {
                        SeatId = rs.SeatId,
                        Row = rs.Seat!.Row,
                        Number = rs.Seat!.Number,
                        SeatType = rs.Seat!.SeatType ?? string.Empty,
                        Price = rs.Price
                    }).ToList()
                })
                .ToListAsync();

            return Ok(reservations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReservationDTO>> GetReservation(int id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var reservation = await _reservations
                .Include(r => r.User)
                .Include(r => r.Showtime)
                    .ThenInclude(s => s!.Movie)
                .Include(r => r.Showtime)
                    .ThenInclude(s => s!.TheaterRoom)
                        .ThenInclude(tr => tr!.Theater)
                .Include(r => r.ReservationSeats)
                    .ThenInclude(rs => rs.Seat)
                .Where(r => r.Id == id)
                .Select(r => new ReservationDTO
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User!.UserName ?? string.Empty,
                    ShowtimeId = r.ShowtimeId,
                    ShowtimeStartTime = r.Showtime!.StartTime,
                    MovieTitle = r.Showtime!.Movie!.Title ?? string.Empty,
                    TheaterName = r.Showtime!.TheaterRoom!.Theater!.Name ?? string.Empty,
                    RoomName = r.Showtime!.TheaterRoom!.Name ?? string.Empty,
                    ReservationTime = r.ReservationTime,
                    TotalPrice = r.TotalPrice,
                    Status = r.Status ?? string.Empty,
                    TicketCode = r.TicketCode ?? string.Empty,
                    Seats = r.ReservationSeats.Select(rs => new ReservationSeatDTO
                    {
                        SeatId = rs.SeatId,
                        Row = rs.Seat!.Row,
                        Number = rs.Seat!.Number,
                        SeatType = rs.Seat!.SeatType ?? string.Empty,
                        Price = rs.Price
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (reservation == null)
            {
                return NotFound();
            }

            // Only admins and the reservation owner can view it
            if (reservation.UserId != currentUser.Id && !User.IsInRole(UserRoleNames.Admin) && !User.IsInRole(UserRoleNames.Manager))
            {
                return Forbid();
            }

            return Ok(reservation);
        }

        [HttpGet("verify/{ticketCode}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<ReservationDTO>> VerifyTicket(string ticketCode)
        {
            var reservation = await _reservations
                .Include(r => r.User)
                .Include(r => r.Showtime)
                    .ThenInclude(s => s!.Movie)
                .Include(r => r.Showtime)
                    .ThenInclude(s => s!.TheaterRoom)
                        .ThenInclude(tr => tr!.Theater)
                .Include(r => r.ReservationSeats)
                    .ThenInclude(rs => rs.Seat)
                .Where(r => r.TicketCode == ticketCode)
                .Select(r => new ReservationDTO
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    UserName = r.User!.UserName ?? string.Empty,
                    ShowtimeId = r.ShowtimeId,
                    ShowtimeStartTime = r.Showtime!.StartTime,
                    MovieTitle = r.Showtime!.Movie!.Title ?? string.Empty,
                    TheaterName = r.Showtime!.TheaterRoom!.Theater!.Name ?? string.Empty,
                    RoomName = r.Showtime!.TheaterRoom!.Name ?? string.Empty,
                    ReservationTime = r.ReservationTime,
                    TotalPrice = r.TotalPrice,
                    Status = r.Status ?? string.Empty,
                    TicketCode = r.TicketCode ?? string.Empty,
                    Seats = r.ReservationSeats.Select(rs => new ReservationSeatDTO
                    {
                        SeatId = rs.SeatId,
                        Row = rs.Seat!.Row,
                        Number = rs.Seat!.Number,
                        SeatType = rs.Seat!.SeatType ?? string.Empty,
                        Price = rs.Price
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (reservation == null)
            {
                return NotFound("Invalid ticket code");
            }

            if (reservation.ShowtimeStartTime < DateTime.UtcNow.AddMinutes(-30))
            {
                return BadRequest("Ticket has expired");
            }

            return Ok(reservation);
        }

        [HttpPost]
        public async Task<ActionResult<ReservationDTO>> CreateReservation(CreateReservationDTO reservationDto)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var showtime = await _showtimes
                .Include(s => s.Movie)
                .Include(s => s.TheaterRoom)
                    .ThenInclude(tr => tr!.Theater)
                .FirstOrDefaultAsync(s => s.Id == reservationDto.ShowtimeId);

            if (showtime == null)
            {
                return BadRequest("Showtime not found");
            }

            if (showtime.StartTime < DateTime.UtcNow)
            {
                return BadRequest("Cannot book tickets for past showtimes");
            }

            var selectedSeatIds = reservationDto.SeatIds;
            if (selectedSeatIds.Count == 0)
            {
                return BadRequest("At least one seat must be selected");
            }

            var seats = await _context.Seats
                .Where(s => selectedSeatIds.Contains(s.Id) && s.TheaterRoomId == showtime.TheaterRoomId)
                .ToListAsync();

            if (seats.Count != selectedSeatIds.Count)
            {
                return BadRequest("One or more selected seats are invalid");
            }

            var bookedSeatIds = await _context.ReservationSeats
                .Where(rs => rs.Reservation!.ShowtimeId == reservationDto.ShowtimeId && selectedSeatIds.Contains(rs.SeatId))
                .Select(rs => rs.SeatId)
                .ToListAsync();

            if (bookedSeatIds.Count > 0)
            {
                return BadRequest("One or more selected seats are already booked");
            }

            decimal totalPrice = 0;
            foreach (var seat in seats)
            {
                decimal seatPrice = showtime.BaseTicketPrice;
                if (seat.SeatType == "Premium")
                {
                    seatPrice *= 1.5m;
                }
                else if (seat.SeatType == "VIP")
                {
                    seatPrice *= 2.0m;
                }
                totalPrice += seatPrice;
            }

            string ticketCode = GenerateTicketCode();

            var reservation = new Reservation
            {
                UserId = currentUser.Id,
                ShowtimeId = reservationDto.ShowtimeId,
                ReservationTime = DateTime.UtcNow,
                TotalPrice = totalPrice,
                Status = "Confirmed",
                TicketCode = ticketCode
            };

            _reservations.Add(reservation);
            await _context.SaveChangesAsync();

            foreach (var seat in seats)
            {
                decimal seatPrice = showtime.BaseTicketPrice;
                if (seat.SeatType == "Premium")
                {
                    seatPrice *= 1.5m;
                }
                else if (seat.SeatType == "VIP")
                {
                    seatPrice *= 2.0m;
                }

                _context.ReservationSeats.Add(new ReservationSeat
                {
                    ReservationId = reservation.Id,
                    SeatId = seat.Id,
                    Price = seatPrice
                });
            }

            await _context.SaveChangesAsync();

            return await GetReservation(reservation.Id);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var reservation = await _reservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound();
            }

            if (reservation.UserId != currentUser.Id && !User.IsInRole(UserRoleNames.Admin) && !User.IsInRole(UserRoleNames.Manager))
            {
                return Forbid();
            }

            var showtime = await _showtimes.FindAsync(reservation.ShowtimeId);
            if (showtime != null && showtime.StartTime <= DateTime.UtcNow.AddHours(1))
            {
                return BadRequest("Cannot cancel reservation less than 1 hour before showtime");
            }

            reservation.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static string GenerateTicketCode()
        {
            using RandomNumberGenerator rng = RandomNumberGenerator.Create();
            var bytes = new byte[8];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes).Replace("/", "_").Replace("+", "-")[..12];
        }
    }

    public class CreateReservationDTO
    {
        public int ShowtimeId { get; set; }
        public List<int> SeatIds { get; init; } = [];
    }
}