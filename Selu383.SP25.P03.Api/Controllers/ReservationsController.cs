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
    public class ReservationsController(DataContext context, UserManager<User> userManager, SignInManager<User> signInManager) : ControllerBase
    {
        private readonly DataContext _context = context;
        private readonly DbSet<Reservation> _reservations = context.Set<Reservation>();
        private readonly DbSet<Showtime> _showtimes = context.Set<Showtime>();
        private readonly UserManager<User> _userManager = userManager;
        private readonly SignInManager<User> _signInManager = signInManager;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservationDTO>>> GetMyReservations()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
                return Unauthorized();

            var reservations = await _reservations
                .Include(r => r.User)
                .Include(r => r.Showtime).ThenInclude(s => s!.Movie)
                .Include(r => r.Showtime).ThenInclude(s => s!.TheaterRoom).ThenInclude(tr => tr!.Theater)
                .Include(r => r.ReservationSeats).ThenInclude(rs => rs.Seat)
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
                .Include(r => r.Showtime).ThenInclude(s => s!.Movie)
                .Include(r => r.Showtime).ThenInclude(s => s!.TheaterRoom).ThenInclude(tr => tr!.Theater)
                .Include(r => r.ReservationSeats).ThenInclude(rs => rs.Seat)
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
        [AllowAnonymous]
        public async Task<ActionResult<ReservationDTO>> GetReservation(int id)
        {
            // Look up the reservation directly first
            var reservation = await _reservations
                .Include(r => r.User)
                .Include(r => r.Showtime).ThenInclude(s => s!.Movie)
                .Include(r => r.Showtime).ThenInclude(s => s!.TheaterRoom).ThenInclude(tr => tr!.Theater)
                .Include(r => r.ReservationSeats).ThenInclude(rs => rs.Seat)
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
                return NotFound();

            // For authenticated users, check authorization
            if (User.Identity?.IsAuthenticated == true)
            {
                var currentUser = await _userManager.GetUserAsync(User);
                if (currentUser == null)
                    return Unauthorized();

                if (reservation.UserId != currentUser.Id
                    && !User.IsInRole(UserRoleNames.Admin)
                    && !User.IsInRole(UserRoleNames.Manager))
                {
                    return Forbid();
                }
            }
            // For guest users, we'll allow access to newly created reservations
            // You might want to add additional security measures here

            return Ok(reservation);
        }

        [HttpGet("verify/{ticketCode}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<ReservationDTO>> VerifyTicket(string ticketCode)
        {
            var reservation = await _reservations
                .Include(r => r.User)
                .Include(r => r.Showtime).ThenInclude(s => s!.Movie)
                .Include(r => r.Showtime).ThenInclude(s => s!.TheaterRoom).ThenInclude(tr => tr!.Theater)
                .Include(r => r.ReservationSeats).ThenInclude(rs => rs.Seat)
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
                return NotFound("Invalid ticket code");

            if (reservation.ShowtimeStartTime < DateTime.UtcNow.AddMinutes(-30))
                return BadRequest("Ticket has expired");

            return Ok(reservation);
        }

        [HttpPost]
        [AllowAnonymous] // Allow guest checkout
        public async Task<ActionResult<ReservationDTO>> CreateReservation([FromBody] CreateReservationDTO dto)
        {
            User? currentUser = null;

            if (User.Identity?.IsAuthenticated == true)
            {
                currentUser = await _userManager.GetUserAsync(User);
                if (currentUser == null)
                    return Unauthorized();
            }
            else if (dto.GuestInfo != null)
            {
                string guestUsername = $"guest_{Guid.NewGuid():N}".Substring(0, 8);
                string tempPassword = $"{Guid.NewGuid():N}".Substring(0, 12) + "!A9";

                var guestUser = new User
                {
                    UserName = guestUsername,
                    Email = dto.GuestInfo.Email,
                    PhoneNumber = dto.GuestInfo.PhoneNumber
                };

                var createResult = await _userManager.CreateAsync(guestUser, tempPassword);
                if (!createResult.Succeeded)
                    return BadRequest("Failed to create guest user");

                var roleResult = await _userManager.AddToRoleAsync(guestUser, UserRoleNames.Guest);
                if (!roleResult.Succeeded)
                    return BadRequest($"Failed to assign guest role: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");

                // Set the current user to the guest user
                currentUser = guestUser;

                // Skip sign-in for guests - we'll use the user ID directly
            }
            else
            {
                return BadRequest("Must provide guest information or be logged in");
            }

            // Validate showtime exists
            var showtime = await _showtimes
                .Include(s => s.Movie)
                .Include(s => s.TheaterRoom).ThenInclude(tr => tr!.Theater)
                .FirstOrDefaultAsync(s => s.Id == dto.ShowtimeId);

            if (showtime == null)
                return BadRequest("Showtime not found");
            if (showtime.StartTime < DateTime.UtcNow)
                return BadRequest("Cannot book tickets for past showtimes");

            // Validate seat selection
            var selectedSeatIds = dto.SeatIds;
            if (!selectedSeatIds.Any())
                return BadRequest("At least one seat must be selected");

            var seats = await _context.Seats
                .Where(s => selectedSeatIds.Contains(s.Id) && s.TheaterRoomId == showtime.TheaterRoomId)
                .ToListAsync();
            if (seats.Count != selectedSeatIds.Count)
                return BadRequest("One or more selected seats are invalid");

            // Check if seats are already booked
            var bookedSeatIds = await _context.ReservationSeats
                .Where(rs => rs.Reservation!.ShowtimeId == dto.ShowtimeId && selectedSeatIds.Contains(rs.SeatId))
                .Select(rs => rs.SeatId)
                .ToListAsync();
            if (bookedSeatIds.Any())
                return BadRequest("One or more selected seats are already booked");

            // Calculate total price
            decimal totalPrice = 0m;
            foreach (var seat in seats)
            {
                var seatPrice = showtime.BaseTicketPrice;
                if (seat.SeatType == "Premium") seatPrice *= 1.5m;
                else if (seat.SeatType == "VIP") seatPrice *= 2.0m;
                totalPrice += seatPrice;
            }

            // Create reservation
            var reservation = new Reservation
            {
                UserId = currentUser.Id,
                ShowtimeId = dto.ShowtimeId,
                ReservationTime = DateTime.UtcNow,
                TotalPrice = totalPrice,
                Status = "Confirmed",
                TicketCode = GenerateTicketCode()
            };

            _reservations.Add(reservation);
            await _context.SaveChangesAsync();

            // Add reservation seats
            foreach (var seat in seats)
            {
                var seatPrice = showtime.BaseTicketPrice;
                if (seat.SeatType == "Premium") seatPrice *= 1.5m;
                else if (seat.SeatType == "VIP") seatPrice *= 2.0m;

                _context.ReservationSeats.Add(new ReservationSeat
                {
                    ReservationId = reservation.Id,
                    SeatId = seat.Id,
                    Price = seatPrice
                });
            }

            await _context.SaveChangesAsync();

            // Return full reservation details
            var result = await _reservations
                .Include(r => r.User)
                .Include(r => r.Showtime).ThenInclude(s => s!.Movie)
                .Include(r => r.Showtime).ThenInclude(s => s!.TheaterRoom).ThenInclude(tr => tr!.Theater)
                .Include(r => r.ReservationSeats).ThenInclude(rs => rs.Seat)
                .Where(r => r.Id == reservation.Id)
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

            if (result == null)
                return StatusCode(500, "Reservation was created but details could not be retrieved");

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
                return Unauthorized();

            var reservation = await _reservations.FindAsync(id);
            if (reservation == null)
                return NotFound();
            if (reservation.UserId != currentUser.Id
                && !User.IsInRole(UserRoleNames.Admin)
                && !User.IsInRole(UserRoleNames.Manager))
                return Forbid();

            var showtime = await _showtimes.FindAsync(reservation.ShowtimeId);
            if (showtime != null && showtime.StartTime <= DateTime.UtcNow.AddHours(1))
                return BadRequest("Cannot cancel reservation less than 1 hour before showtime");

            reservation.Status = "Cancelled";
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private static string GenerateTicketCode()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[8];
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes)
                         .Replace("/", "_")
                         .Replace("+", "-")[..12];
        }
    }

    public class CreateReservationDTO
    {
        public int ShowtimeId { get; set; }
        public List<int> SeatIds { get; init; } = new();
        public GuestInfoDTO? GuestInfo { get; set; }
    }

    public class GuestInfoDTO
    {
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
    }
}