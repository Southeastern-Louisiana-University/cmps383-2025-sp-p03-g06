// Controllers/TheaterMoviesController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Movies;
using Selu383.SP25.P03.Api.Features.Theaters;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/theater-movies")]
    [ApiController]
    [AllowAnonymous]
    public class TheaterMoviesController(DataContext context) : ControllerBase
    {
        private readonly DataContext _context = context;
        private readonly DbSet<TheaterMovie> _theaterMovies = context.Set<TheaterMovie>();
        private readonly DbSet<Movie> _movies = context.Set<Movie>();
        private readonly DbSet<Theater> _theaters = context.Set<Theater>();

        [HttpGet("movie/{movieId}")]
        public async Task<ActionResult<IEnumerable<int>>> GetTheatersByMovie(int movieId)
        {
            var movie = await _movies.FindAsync(movieId);
            if (movie == null)
            {
                return NotFound("Movie not found");
            }

            var theaterIds = await _theaterMovies
                .Where(tm => tm.MovieId == movieId)
                .Select(tm => tm.TheaterId)
                .ToListAsync();

            return Ok(theaterIds);
        }

        [HttpGet("theater/{theaterId}")]
        public async Task<ActionResult<IEnumerable<int>>> GetMoviesByTheater(int theaterId)
        {
            var theater = await _theaters.FindAsync(theaterId);
            if (theater == null)
            {
                return NotFound("Theater not found");
            }

            var movieIds = await _theaterMovies
                .Where(tm => tm.TheaterId == theaterId)
                .Select(tm => tm.MovieId)
                .ToListAsync();

            return Ok(movieIds);
        }

        [HttpPost("assign")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult> AssignMovieToTheater(TheaterMovieDTO dto)
        {
            var movie = await _movies.FindAsync(dto.MovieId);
            if (movie == null)
            {
                return BadRequest("Movie not found");
            }

            var theater = await _theaters.FindAsync(dto.TheaterId);
            if (theater == null)
            {
                return BadRequest("Theater not found");
            }

            // Check if relationship already exists
            var existing = await _theaterMovies
                .FirstOrDefaultAsync(tm => tm.MovieId == dto.MovieId && tm.TheaterId == dto.TheaterId);

            if (existing != null)
            {
                return BadRequest("This movie is already assigned to this theater");
            }

            _theaterMovies.Add(new TheaterMovie
            {
                MovieId = dto.MovieId,
                TheaterId = dto.TheaterId
            });

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("unassign")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult> UnassignMovieFromTheater(TheaterMovieDTO dto)
        {
            var entry = await _theaterMovies
                .FirstOrDefaultAsync(tm => tm.MovieId == dto.MovieId && tm.TheaterId == dto.TheaterId);

            if (entry == null)
            {
                return NotFound("This movie is not assigned to this theater");
            }

            _theaterMovies.Remove(entry);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    public class TheaterMovieDTO
    {
        public int MovieId { get; set; }
        public int TheaterId { get; set; }
    }
}