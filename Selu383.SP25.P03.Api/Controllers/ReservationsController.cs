// Controllers/ReservationsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Reservations;
using Selu383.SP25.P03.Api.Features.Showtimes;
using Selu383.SP25.P03.Api.Features.Users;
using Selu383.SP25.P03.Api.Services;
using System.Security.Cryptography;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/reservations")]
    [ApiController]
    [Authorize]
    public class ReservationsController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly DbSet<Reservation> _reservations;
        private readonly DbSet<Showtime> _showtimes;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IEmailService _emailService;

        public ReservationsController(
            DataContext context,
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IEmailService emailService)
        {
            _context = context;
            _reservations = context.Set<Reservation>();
            _showtimes = context.Set<Showtime>();
            _userManager = userManager;
            _signInManager = signInManager;
            _emailService = emailService;
        }

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
                    UserId = r.UserId.HasValue ? r.UserId.Value : 0,
                    UserName = r.User == null ? string.Empty : r.User.UserName ?? string.Empty,
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
                    UserId = r.UserId.HasValue ? r.UserId.Value : 0,
                    UserName = r.User == null ? string.Empty : r.User.UserName ?? string.Empty,
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
                    UserId = r.UserId.HasValue ? r.UserId.Value : 0,
                    UserName = r.User == null ? string.Empty : r.User.UserName ?? string.Empty,
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
                .Include(s => s.TheaterRoom)
                    .ThenInclude(tr => tr!.Theater)
                .FirstOrDefaultAsync(s => s.Id == dto.ShowtimeId);

            if (showtime == null)
                return NotFound("Showtime not found");

            // Validate seats
            var seats = await _context.Seats
                .Where(s => dto.SeatIds.Contains(s.Id))
                .ToListAsync();

            if (seats.Count != dto.SeatIds.Count)
                return BadRequest("One or more seats not found");

            // Check if seats are available
            var reservedSeats = await _context.ReservationSeats
                .Include(rs => rs.Reservation)
                .Where(rs => dto.SeatIds.Contains(rs.SeatId) && rs.Reservation!.ShowtimeId == dto.ShowtimeId)
                .Select(rs => rs.SeatId)
                .ToListAsync();

            if (reservedSeats.Any())
                return BadRequest("One or more seats are already reserved");

            // Calculate total price
            decimal totalPrice = 0;
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
                TicketCode = GenerateTicketCode(),
                // Store guest information if available
                GuestEmail = dto.GuestInfo?.Email,
                GuestPhone = dto.GuestInfo?.PhoneNumber
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

            // Send confirmation email
            var emailBody = $@"
                <h2>Reservation Confirmation</h2>
                <p>Thank you for your reservation!</p>
                <p><strong>Movie:</strong> {showtime.Movie!.Title}</p>
                <p><strong>Theater:</strong> {showtime.TheaterRoom!.Theater!.Name}</p>
                <p><strong>Room:</strong> {showtime.TheaterRoom.Name}</p>
                <p><strong>Showtime:</strong> {showtime.StartTime:g}</p>
                <p><strong>Ticket Code:</strong> {reservation.TicketCode}</p>
                <p><strong>Total Price:</strong> ${reservation.TotalPrice:F2}</p>
                <p><strong>Seats:</strong></p>
                <ul>
                    {string.Join("", seats.Select(s => $"<li>Row {s.Row}, Seat {s.Number} ({s.SeatType})</li>"))}
                </ul>
                <p>Please present your ticket code at the theater.</p>";

            await _emailService.SendEmailAsync(
                currentUser.Email!,
                "Movie Reservation Confirmation",
                emailBody
            );

            return Ok(reservation.ToDto());
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

        [HttpGet("lookup")]
        [AllowAnonymous]
        public async Task<ActionResult<List<ReservationDTO>>> LookupReservationsByEmail([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest("Email is required");
            }

            var reservations = await _reservations
                .Include(r => r.Showtime)
                    .ThenInclude(s => s!.Movie)
                .Include(r => r.Showtime)
                    .ThenInclude(s => s!.TheaterRoom)
                        .ThenInclude(tr => tr!.Theater)
                .Include(r => r.ReservationSeats)
                    .ThenInclude(rs => rs.Seat)
                .Where(r => r.GuestEmail == email || (r.User != null && r.User.Email == email))
                .OrderByDescending(r => r.ReservationTime)
                .ToListAsync();

            return Ok(reservations.Select(r => r.ToDto()));
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