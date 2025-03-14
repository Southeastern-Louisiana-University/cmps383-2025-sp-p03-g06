// Controllers/GenresController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Movies;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/genres")]
    [ApiController]
    public class GenresController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly DbSet<Genre> _genres;

        public GenresController(DataContext context)
        {
            _context = context;
            _genres = context.Set<Genre>();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GenreDTO>>> GetGenres()
        {
            var genres = await _genres
                .Select(g => new GenreDTO
                {
                    Id = g.Id,
                    Name = g.Name
                })
                .ToListAsync();

            return Ok(genres);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GenreDTO>> GetGenre(int id)
        {
            var genre = await _genres
                .Where(g => g.Id == id)
                .Select(g => new GenreDTO
                {
                    Id = g.Id,
                    Name = g.Name
                })
                .FirstOrDefaultAsync();

            if (genre == null)
            {
                return NotFound();
            }

            return Ok(genre);
        }

        [HttpPost]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<GenreDTO>> CreateGenre(GenreDTO genreDto)
        {
            if (string.IsNullOrWhiteSpace(genreDto.Name))
            {
                return BadRequest("Name is required");
            }

            if (await _genres.AnyAsync(g => g.Name == genreDto.Name))
            {
                return BadRequest("Genre already exists");
            }

            var genre = new Genre
            {
                Name = genreDto.Name
            };

            _genres.Add(genre);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGenre), new { id = genre.Id }, new GenreDTO
            {
                Id = genre.Id,
                Name = genre.Name
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<GenreDTO>> UpdateGenre(int id, GenreDTO genreDto)
        {
            if (id != genreDto.Id)
            {
                return BadRequest("ID mismatch");
            }

            var genre = await _genres.FindAsync(id);
            if (genre == null)
            {
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(genreDto.Name))
            {
                return BadRequest("Name is required");
            }

            if (await _genres.AnyAsync(g => g.Name == genreDto.Name && g.Id != id))
            {
                return BadRequest("Genre name already exists");
            }

            genre.Name = genreDto.Name;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GenreExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new GenreDTO
            {
                Id = genre.Id,
                Name = genre.Name
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<IActionResult> DeleteGenre(int id)
        {
            var genre = await _genres.FindAsync(id);
            if (genre == null)
            {
                return NotFound();
            }

            _genres.Remove(genre);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool GenreExists(int id)
        {
            return _genres.Any(e => e.Id == id);
        }
    }
}