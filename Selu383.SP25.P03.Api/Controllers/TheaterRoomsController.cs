// Controllers/TheaterRoomsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Theaters;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/theater-rooms")]
    [ApiController]
    public class TheaterRoomsController(DataContext context) : ControllerBase
    {
        private readonly DataContext _context = context;
        private readonly DbSet<TheaterRoom> _theaterRooms = context.Set<TheaterRoom>();
        private readonly DbSet<Theater> _theaters = context.Set<Theater>();

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TheaterRoomDTO>>> GetTheaterRooms()
        {
            var theaterRooms = await _theaterRooms
                .Include(tr => tr.Theater)
                .Select(tr => new TheaterRoomDTO
                {
                    Id = tr.Id,
                    Name = tr.Name,
                    TheaterId = tr.TheaterId,
                    SeatCount = tr.SeatCount,
                    ScreenType = tr.ScreenType
                })
                .ToListAsync();

            return Ok(theaterRooms);
        }

        [HttpGet("theater/{theaterId}")]
        public async Task<ActionResult<IEnumerable<TheaterRoomDTO>>> GetTheaterRoomsByTheaterId(int theaterId)
        {
            var theater = await _theaters.FindAsync(theaterId);
            if (theater == null)
            {
                return NotFound("Theater not found");
            }

            var theaterRooms = await _theaterRooms
                .Where(tr => tr.TheaterId == theaterId)
                .Select(tr => new TheaterRoomDTO
                {
                    Id = tr.Id,
                    Name = tr.Name,
                    TheaterId = tr.TheaterId,
                    SeatCount = tr.SeatCount,
                    ScreenType = tr.ScreenType
                })
                .ToListAsync();

            return Ok(theaterRooms);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TheaterRoomDTO>> GetTheaterRoom(int id)
        {
            var theaterRoom = await _theaterRooms
                .Include(tr => tr.Theater)
                .Where(tr => tr.Id == id)
                .Select(tr => new TheaterRoomDTO
                {
                    Id = tr.Id,
                    Name = tr.Name,
                    TheaterId = tr.TheaterId,
                    SeatCount = tr.SeatCount,
                    ScreenType = tr.ScreenType
                })
                .FirstOrDefaultAsync();

            if (theaterRoom == null)
            {
                return NotFound();
            }

            return Ok(theaterRoom);
        }

        [HttpPost]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<TheaterRoomDTO>> CreateTheaterRoom(TheaterRoomDTO theaterRoomDto)
        {
            if (string.IsNullOrWhiteSpace(theaterRoomDto.Name))
            {
                return BadRequest("Name is required");
            }

            var theater = await _theaters.FindAsync(theaterRoomDto.TheaterId);
            if (theater == null)
            {
                return BadRequest("Theater not found");
            }

            var theaterRoom = new TheaterRoom
            {
                Name = theaterRoomDto.Name,
                TheaterId = theaterRoomDto.TheaterId,
                SeatCount = theaterRoomDto.SeatCount,
                ScreenType = theaterRoomDto.ScreenType
            };

            _theaterRooms.Add(theaterRoom);
            await _context.SaveChangesAsync();

            theater.SeatCount += theaterRoom.SeatCount;
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTheaterRoom), new { id = theaterRoom.Id }, new TheaterRoomDTO
            {
                Id = theaterRoom.Id,
                Name = theaterRoom.Name,
                TheaterId = theaterRoom.TheaterId,
                SeatCount = theaterRoom.SeatCount,
                ScreenType = theaterRoom.ScreenType
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<TheaterRoomDTO>> UpdateTheaterRoom(int id, TheaterRoomDTO theaterRoomDto)
        {
            if (id != theaterRoomDto.Id)
            {
                return BadRequest("ID mismatch");
            }

            var theaterRoom = await _theaterRooms.FindAsync(id);
            if (theaterRoom == null)
            {
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(theaterRoomDto.Name))
            {
                return BadRequest("Name is required");
            }

            var theater = await _theaters.FindAsync(theaterRoomDto.TheaterId);
            if (theater == null)
            {
                return BadRequest("Theater not found");
            }

            var oldSeatCount = theaterRoom.SeatCount;
            var currentTheater = await _theaters.FindAsync(theaterRoom.TheaterId);
            if (currentTheater != null)
            {
                currentTheater.SeatCount = currentTheater.SeatCount - oldSeatCount + theaterRoomDto.SeatCount;
            }

            theaterRoom.Name = theaterRoomDto.Name;
            theaterRoom.TheaterId = theaterRoomDto.TheaterId;
            theaterRoom.SeatCount = theaterRoomDto.SeatCount;
            theaterRoom.ScreenType = theaterRoomDto.ScreenType;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TheaterRoomExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new TheaterRoomDTO
            {
                Id = theaterRoom.Id,
                Name = theaterRoom.Name,
                TheaterId = theaterRoom.TheaterId,
                SeatCount = theaterRoom.SeatCount,
                ScreenType = theaterRoom.ScreenType
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<IActionResult> DeleteTheaterRoom(int id)
        {
            var theaterRoom = await _theaterRooms.FindAsync(id);
            if (theaterRoom == null)
            {
                return NotFound();
            }

            var theater = await _theaters.FindAsync(theaterRoom.TheaterId);
            if (theater != null)
            {
                theater.SeatCount -= theaterRoom.SeatCount;
            }

            _theaterRooms.Remove(theaterRoom);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool TheaterRoomExists(int id)
        {
            return _theaterRooms.Any(e => e.Id == id);
        }
    }
}