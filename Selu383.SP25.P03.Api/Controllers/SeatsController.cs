// Controllers/SeatsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Theaters;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/seats")]
    [ApiController]
    public class SeatsController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly DbSet<Seat> _seats;
        private readonly DbSet<TheaterRoom> _theaterRooms;

        public SeatsController(DataContext context)
        {
            _context = context;
            _seats = context.Set<Seat>();
            _theaterRooms = context.Set<TheaterRoom>();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SeatDTO>>> GetSeats()
        {
            var seats = await _seats
                .Include(s => s.TheaterRoom)
                .Select(s => new SeatDTO
                {
                    Id = s.Id,
                    TheaterRoomId = s.TheaterRoomId,
                    Row = s.Row,
                    Number = s.Number,
                    SeatType = s.SeatType,
                    IsAvailable = !s.ReservationSeats.Any()
                })
                .ToListAsync();

            return Ok(seats);
        }

        [HttpGet("room/{roomId}")]
        public async Task<ActionResult<IEnumerable<SeatDTO>>> GetSeatsByRoomId(int roomId)
        {
            var room = await _theaterRooms.FindAsync(roomId);
            if (room == null)
            {
                return NotFound("Theater room not found");
            }

            var seats = await _seats
                .Where(s => s.TheaterRoomId == roomId)
                .Select(s => new SeatDTO
                {
                    Id = s.Id,
                    TheaterRoomId = s.TheaterRoomId,
                    Row = s.Row,
                    Number = s.Number,
                    SeatType = s.SeatType,
                    IsAvailable = !s.ReservationSeats.Any()
                })
                .ToListAsync();

            return Ok(seats);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SeatDTO>> GetSeat(int id)
        {
            var seat = await _seats
                .Include(s => s.TheaterRoom)
                .Where(s => s.Id == id)
                .Select(s => new SeatDTO
                {
                    Id = s.Id,
                    TheaterRoomId = s.TheaterRoomId,
                    Row = s.Row,
                    Number = s.Number,
                    SeatType = s.SeatType,
                    IsAvailable = !s.ReservationSeats.Any()
                })
                .FirstOrDefaultAsync();

            if (seat == null)
            {
                return NotFound();
            }

            return Ok(seat);
        }

        [HttpPost]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<SeatDTO>> CreateSeat(SeatDTO seatDto)
        {
            if (string.IsNullOrWhiteSpace(seatDto.Row))
            {
                return BadRequest("Row is required");
            }

            var room = await _theaterRooms.FindAsync(seatDto.TheaterRoomId);
            if (room == null)
            {
                return BadRequest("Theater room not found");
            }

            // Check if seat already exists in this room
            var seatExists = await _seats.AnyAsync(s =>
                s.TheaterRoomId == seatDto.TheaterRoomId &&
                s.Row == seatDto.Row &&
                s.Number == seatDto.Number);

            if (seatExists)
            {
                return BadRequest("Seat already exists in this room");
            }

            var seat = new Seat
            {
                TheaterRoomId = seatDto.TheaterRoomId,
                Row = seatDto.Row,
                Number = seatDto.Number,
                SeatType = seatDto.SeatType
            };

            _seats.Add(seat);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSeat), new { id = seat.Id }, new SeatDTO
            {
                Id = seat.Id,
                TheaterRoomId = seat.TheaterRoomId,
                Row = seat.Row,
                Number = seat.Number,
                SeatType = seat.SeatType,
                IsAvailable = true
            });
        }

        [HttpPost("bulk")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<IEnumerable<SeatDTO>>> CreateBulkSeats([FromBody] BulkSeatCreationDTO request)
        {
            if (request.TheaterRoomId <= 0)
            {
                return BadRequest("Valid theater room ID is required");
            }

            var room = await _theaterRooms.FindAsync(request.TheaterRoomId);
            if (room == null)
            {
                return BadRequest("Theater room not found");
            }

            var seats = new List<Seat>();
            foreach (var row in request.Rows)
            {
                for (int number = request.StartNumber; number <= request.EndNumber; number++)
                {
                    // Check if seat already exists
                    var seatExists = await _seats.AnyAsync(s =>
                        s.TheaterRoomId == request.TheaterRoomId &&
                        s.Row == row &&
                        s.Number == number);

                    if (!seatExists)
                    {
                        seats.Add(new Seat
                        {
                            TheaterRoomId = request.TheaterRoomId,
                            Row = row,
                            Number = number,
                            SeatType = request.SeatType
                        });
                    }
                }
            }

            _seats.AddRange(seats);
            await _context.SaveChangesAsync();

            var createdSeats = seats.Select(s => new SeatDTO
            {
                Id = s.Id,
                TheaterRoomId = s.TheaterRoomId,
                Row = s.Row,
                Number = s.Number,
                SeatType = s.SeatType,
                IsAvailable = true
            }).ToList();

            return Ok(createdSeats);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<SeatDTO>> UpdateSeat(int id, SeatDTO seatDto)
        {
            if (id != seatDto.Id)
            {
                return BadRequest("ID mismatch");
            }

            var seat = await _seats.FindAsync(id);
            if (seat == null)
            {
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(seatDto.Row))
            {
                return BadRequest("Row is required");
            }

            var room = await _theaterRooms.FindAsync(seatDto.TheaterRoomId);
            if (room == null)
            {
                return BadRequest("Theater room not found");
            }

            // Check if updating would create a duplicate
            var seatExists = await _seats.AnyAsync(s =>
                s.TheaterRoomId == seatDto.TheaterRoomId &&
                s.Row == seatDto.Row &&
                s.Number == seatDto.Number &&
                s.Id != id);

            if (seatExists)
            {
                return BadRequest("Another seat with these details already exists in this room");
            }

            seat.TheaterRoomId = seatDto.TheaterRoomId;
            seat.Row = seatDto.Row;
            seat.Number = seatDto.Number;
            seat.SeatType = seatDto.SeatType;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SeatExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new SeatDTO
            {
                Id = seat.Id,
                TheaterRoomId = seat.TheaterRoomId,
                Row = seat.Row,
                Number = seat.Number,
                SeatType = seat.SeatType,
                IsAvailable = !seat.ReservationSeats.Any()
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<IActionResult> DeleteSeat(int id)
        {
            var seat = await _seats.FindAsync(id);
            if (seat == null)
            {
                return NotFound();
            }

            _seats.Remove(seat);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SeatExists(int id)
        {
            return _seats.Any(e => e.Id == id);
        }
    }

    public class BulkSeatCreationDTO
    {
        public int TheaterRoomId { get; set; }
        public List<string> Rows { get; set; } = new List<string>();
        public int StartNumber { get; set; }
        public int EndNumber { get; set; }
        public string? SeatType { get; set; }
    }
}