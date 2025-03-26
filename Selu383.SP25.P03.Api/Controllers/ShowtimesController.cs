// Controllers/ShowtimesController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Movies;
using Selu383.SP25.P03.Api.Features.Showtimes;
using Selu383.SP25.P03.Api.Features.Theaters;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/showtimes")]
    [ApiController]
    public class ShowtimesController(DataContext context) : ControllerBase
    {
        private readonly DataContext _context = context;
        private readonly DbSet<Showtime> _showtimes = context.Set<Showtime>();
        private readonly DbSet<Movie> _movies = context.Set<Movie>();
        private readonly DbSet<TheaterRoom> _theaterRooms = context.Set<TheaterRoom>();

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShowtimeDTO>>> GetShowtimes()
        {
            var showtimes = await _showtimes
                .Include(s => s.Movie)
                .Include(s => s.TheaterRoom)
                .ThenInclude(tr => tr!.Theater)
                .Select(s => new ShowtimeDTO
                {
                    Id = s.Id,
                    MovieId = s.MovieId,
                    MovieTitle = s.Movie!.Title ?? string.Empty,
                    TheaterRoomId = s.TheaterRoomId,
                    TheaterRoomName = s.TheaterRoom!.Name ?? string.Empty,
                    TheaterId = s.TheaterRoom!.TheaterId,
                    TheaterName = s.TheaterRoom!.Theater!.Name ?? string.Empty,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    BaseTicketPrice = s.BaseTicketPrice
                })
                .ToListAsync();

            return Ok(showtimes);
        }

        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<ShowtimeDTO>>> GetUpcomingShowtimes()
        {
            var now = DateTime.UtcNow;
            var showtimes = await _showtimes
                .Include(s => s.Movie)
                .Include(s => s.TheaterRoom)
                .ThenInclude(tr => tr!.Theater)
                .Where(s => s.StartTime > now)
                .OrderBy(s => s.StartTime)
                .Select(s => new ShowtimeDTO
                {
                    Id = s.Id,
                    MovieId = s.MovieId,
                    MovieTitle = s.Movie!.Title ?? string.Empty,
                    TheaterRoomId = s.TheaterRoomId,
                    TheaterRoomName = s.TheaterRoom!.Name ?? string.Empty,
                    TheaterId = s.TheaterRoom!.TheaterId,
                    TheaterName = s.TheaterRoom!.Theater!.Name ?? string.Empty,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    BaseTicketPrice = s.BaseTicketPrice
                })
                .ToListAsync();

            return Ok(showtimes);
        }

        [HttpGet("movie/{movieId}")]
        public async Task<ActionResult<IEnumerable<ShowtimeDTO>>> GetShowtimesByMovie(int movieId)
        {
            var movie = await _movies.FindAsync(movieId);
            if (movie == null)
            {
                return NotFound("Movie not found");
            }

            var showtimes = await _showtimes
                .Include(s => s.Movie)
                .Include(s => s.TheaterRoom)
                .ThenInclude(tr => tr!.Theater)
                .Where(s => s.MovieId == movieId && s.StartTime > DateTime.UtcNow)
                .OrderBy(s => s.StartTime)
                .Select(s => new ShowtimeDTO
                {
                    Id = s.Id,
                    MovieId = s.MovieId,
                    MovieTitle = s.Movie!.Title ?? string.Empty,
                    TheaterRoomId = s.TheaterRoomId,
                    TheaterRoomName = s.TheaterRoom!.Name ?? string.Empty,
                    TheaterId = s.TheaterRoom!.TheaterId,
                    TheaterName = s.TheaterRoom!.Theater!.Name ?? string.Empty,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    BaseTicketPrice = s.BaseTicketPrice
                })
                .ToListAsync();

            return Ok(showtimes);
        }

        [HttpGet("theater/{theaterId}")]
        public async Task<ActionResult<IEnumerable<ShowtimeDTO>>> GetShowtimesByTheater(int theaterId)
        {
            var showtimes = await _showtimes
                .Include(s => s.Movie)
                .Include(s => s.TheaterRoom)
                .ThenInclude(tr => tr!.Theater)
                .Where(s => s.TheaterRoom!.TheaterId == theaterId && s.StartTime > DateTime.UtcNow)
                .OrderBy(s => s.StartTime)
                .Select(s => new ShowtimeDTO
                {
                    Id = s.Id,
                    MovieId = s.MovieId,
                    MovieTitle = s.Movie!.Title ?? string.Empty,
                    TheaterRoomId = s.TheaterRoomId,
                    TheaterRoomName = s.TheaterRoom!.Name ?? string.Empty,
                    TheaterId = s.TheaterRoom!.TheaterId,
                    TheaterName = s.TheaterRoom!.Theater!.Name ?? string.Empty,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    BaseTicketPrice = s.BaseTicketPrice
                })
                .ToListAsync();

            return Ok(showtimes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ShowtimeDTO>> GetShowtime(int id)
        {
            var showtime = await _showtimes
                .Include(s => s.Movie)
                .Include(s => s.TheaterRoom)
                .ThenInclude(tr => tr!.Theater)
                .Where(s => s.Id == id)
                .Select(s => new ShowtimeDTO
                {
                    Id = s.Id,
                    MovieId = s.MovieId,
                    MovieTitle = s.Movie!.Title ?? string.Empty,
                    TheaterRoomId = s.TheaterRoomId,
                    TheaterRoomName = s.TheaterRoom!.Name ?? string.Empty,
                    TheaterId = s.TheaterRoom!.TheaterId,
                    TheaterName = s.TheaterRoom!.Theater!.Name ?? string.Empty,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    BaseTicketPrice = s.BaseTicketPrice
                })
                .FirstOrDefaultAsync();

            if (showtime == null)
            {
                return NotFound();
            }

            return Ok(showtime);
        }

        [HttpPost]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<ShowtimeDTO>> CreateShowtime(ShowtimeDTO showtimeDto)
        {
            var movie = await _movies.FindAsync(showtimeDto.MovieId);
            if (movie == null)
            {
                return BadRequest("Movie not found");
            }

            var theaterRoom = await _theaterRooms
                .Include(tr => tr.Theater)
                .FirstOrDefaultAsync(tr => tr.Id == showtimeDto.TheaterRoomId);

            if (theaterRoom == null)
            {
                return BadRequest("Theater room not found");
            }

            var endTime = showtimeDto.StartTime.AddMinutes(movie.DurationMinutes);

            var hasConflict = await _showtimes
                .Where(s => s.TheaterRoomId == showtimeDto.TheaterRoomId)
                .AnyAsync(s =>
                    (showtimeDto.StartTime >= s.StartTime && showtimeDto.StartTime < s.EndTime) ||
                    (endTime > s.StartTime && endTime <= s.EndTime) ||
                    (showtimeDto.StartTime <= s.StartTime && endTime >= s.EndTime));

            if (hasConflict)
            {
                return BadRequest("Time slot conflicts with another showtime in this room");
            }

            var showtime = new Showtime
            {
                MovieId = showtimeDto.MovieId,
                TheaterRoomId = showtimeDto.TheaterRoomId,
                StartTime = showtimeDto.StartTime,
                EndTime = endTime,
                BaseTicketPrice = showtimeDto.BaseTicketPrice
            };

            _showtimes.Add(showtime);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetShowtime), new { id = showtime.Id }, new ShowtimeDTO
            {
                Id = showtime.Id,
                MovieId = showtime.MovieId,
                MovieTitle = movie.Title ?? string.Empty,
                TheaterRoomId = showtime.TheaterRoomId,
                TheaterRoomName = theaterRoom.Name ?? string.Empty,
                TheaterId = theaterRoom.TheaterId,
                TheaterName = theaterRoom.Theater?.Name ?? string.Empty,
                StartTime = showtime.StartTime,
                EndTime = showtime.EndTime,
                BaseTicketPrice = showtime.BaseTicketPrice
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<ShowtimeDTO>> UpdateShowtime(int id, ShowtimeDTO showtimeDto)
        {
            if (id != showtimeDto.Id)
            {
                return BadRequest("ID mismatch");
            }

            var showtime = await _showtimes.FindAsync(id);
            if (showtime == null)
            {
                return NotFound();
            }

            var movie = await _movies.FindAsync(showtimeDto.MovieId);
            if (movie == null)
            {
                return BadRequest("Movie not found");
            }

            var theaterRoom = await _theaterRooms.FindAsync(showtimeDto.TheaterRoomId);
            if (theaterRoom == null)
            {
                return BadRequest("Theater room not found");
            }

            var endTime = showtimeDto.StartTime.AddMinutes(movie.DurationMinutes);

            var hasConflict = await _showtimes
                .Where(s => s.TheaterRoomId == showtimeDto.TheaterRoomId && s.Id != id)
                .AnyAsync(s =>
                    (showtimeDto.StartTime >= s.StartTime && showtimeDto.StartTime < s.EndTime) ||
                    (endTime > s.StartTime && endTime <= s.EndTime) ||
                    (showtimeDto.StartTime <= s.StartTime && endTime >= s.EndTime));

            if (hasConflict)
            {
                return BadRequest("Time slot conflicts with another showtime in this room");
            }

            showtime.MovieId = showtimeDto.MovieId;
            showtime.TheaterRoomId = showtimeDto.TheaterRoomId;
            showtime.StartTime = showtimeDto.StartTime;
            showtime.EndTime = endTime;
            showtime.BaseTicketPrice = showtimeDto.BaseTicketPrice;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ShowtimeExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(await GetShowtimeDto(id));
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<IActionResult> DeleteShowtime(int id)
        {
            var showtime = await _showtimes.FindAsync(id);
            if (showtime == null)
            {
                return NotFound();
            }

            _showtimes.Remove(showtime);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ShowtimeExists(int id)
        {
            return _showtimes.FirstOrDefault(e => e.Id == id) != null;
        }

        private async Task<ShowtimeDTO?> GetShowtimeDto(int id)
        {
            return await _showtimes
                .Include(s => s.Movie)
                .Include(s => s.TheaterRoom)
                .ThenInclude(tr => tr!.Theater)
                .Where(s => s.Id == id)
                .Select(s => new ShowtimeDTO
                {
                    Id = s.Id,
                    MovieId = s.MovieId,
                    MovieTitle = s.Movie!.Title ?? string.Empty,
                    TheaterRoomId = s.TheaterRoomId,
                    TheaterRoomName = s.TheaterRoom!.Name ?? string.Empty,
                    TheaterId = s.TheaterRoom!.TheaterId,
                    TheaterName = s.TheaterRoom!.Theater!.Name ?? string.Empty,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    BaseTicketPrice = s.BaseTicketPrice
                })
                .FirstOrDefaultAsync();
        }
    }
}