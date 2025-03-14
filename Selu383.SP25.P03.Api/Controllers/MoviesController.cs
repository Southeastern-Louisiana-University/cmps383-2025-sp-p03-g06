// Controllers/MoviesController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Movies;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/movies")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly DbSet<Movie> _movies;
        private readonly DbSet<Genre> _genres;
        private readonly DbSet<MovieGenre> _movieGenres;

        public MoviesController(DataContext context)
        {
            _context = context;
            _movies = context.Set<Movie>();
            _genres = context.Set<Genre>();
            _movieGenres = context.Set<MovieGenre>();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovieDTO>>> GetMovies()
        {
            // Ensure MovieGenres and Genre are properly loaded
            var movies = await _movies
                .Select(m => new MovieDTO
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    DurationMinutes = m.DurationMinutes,
                    Rating = m.Rating,
                    PosterImageUrl = m.PosterImageUrl,
                    ReleaseDate = m.ReleaseDate,
                    // Create an empty list by default
                    Genres = new List<string>()
                })
                .ToListAsync();

            // Then load the genres separately to avoid null reference issues
            var movieIds = movies.Select(m => m.Id).ToList();
            var movieGenres = await _context.Set<MovieGenre>()
                .Include(mg => mg.Genre)
                .Where(mg => movieIds.Contains(mg.MovieId))
                .ToListAsync();

            // Group and assign genres to movies
            var genresByMovieId = movieGenres
                .GroupBy(mg => mg.MovieId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(mg => mg.Genre?.Name ?? string.Empty).Where(name => !string.IsNullOrEmpty(name)).ToList()
                );

            // Update each movie with its genres
            foreach (var movie in movies)
            {
                if (genresByMovieId.TryGetValue(movie.Id, out var genres))
                {
                    movie.Genres = genres;
                }
            }

            return Ok(movies);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MovieDTO>> GetMovie(int id)
        {
            // First check if movie exists
            var movieExists = await _movies.AnyAsync(m => m.Id == id);
            if (!movieExists)
            {
                return NotFound();
            }

            // Get movie base information
            var movie = await _movies
                .Where(m => m.Id == id)
                .Select(m => new MovieDTO
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    DurationMinutes = m.DurationMinutes,
                    Rating = m.Rating,
                    PosterImageUrl = m.PosterImageUrl,
                    ReleaseDate = m.ReleaseDate,
                    Genres = new List<string>()
                })
                .FirstOrDefaultAsync();

            // Get genres separately
            var genres = await _movieGenres
                .Include(mg => mg.Genre)
                .Where(mg => mg.MovieId == id)
                .Select(mg => mg.Genre != null ? mg.Genre.Name : string.Empty)
                .Where(name => !string.IsNullOrEmpty(name))
                .ToListAsync();

            if (movie != null)
            {
                movie.Genres = genres;
            }

            return Ok(movie);
        }

        [HttpPost]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<MovieDTO>> CreateMovie(MovieDTO movieDto)
        {
            if (string.IsNullOrWhiteSpace(movieDto.Title))
            {
                return BadRequest("Title is required");
            }

            var movie = new Movie
            {
                Title = movieDto.Title,
                Description = movieDto.Description,
                DurationMinutes = movieDto.DurationMinutes,
                Rating = movieDto.Rating,
                PosterImageUrl = movieDto.PosterImageUrl,
                ReleaseDate = movieDto.ReleaseDate
            };

            _movies.Add(movie);
            await _context.SaveChangesAsync();

            // Add genres
            if (movieDto.Genres != null && movieDto.Genres.Any())
            {
                foreach (var genreName in movieDto.Genres)
                {
                    var genre = await _genres.FirstOrDefaultAsync(g => g.Name == genreName);
                    if (genre == null)
                    {
                        genre = new Genre { Name = genreName };
                        _genres.Add(genre);
                        await _context.SaveChangesAsync();
                    }

                    _movieGenres.Add(new MovieGenre
                    {
                        MovieId = movie.Id,
                        GenreId = genre.Id
                    });
                }
                await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetMovie), new { id = movie.Id }, new MovieDTO
            {
                Id = movie.Id,
                Title = movie.Title,
                Description = movie.Description,
                DurationMinutes = movie.DurationMinutes,
                Rating = movie.Rating,
                PosterImageUrl = movie.PosterImageUrl,
                ReleaseDate = movie.ReleaseDate,
                // Fix 3: Ensure we're not assigning null
                Genres = movieDto.Genres ?? new List<string>()
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<MovieDTO>> UpdateMovie(int id, MovieDTO movieDto)
        {
            if (id != movieDto.Id)
            {
                return BadRequest("ID mismatch");
            }

            var movie = await _movies
                .Include(m => m.MovieGenres)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (movie == null)
            {
                return NotFound();
            }

            movie.Title = movieDto.Title;
            movie.Description = movieDto.Description;
            movie.DurationMinutes = movieDto.DurationMinutes;
            movie.Rating = movieDto.Rating;
            movie.PosterImageUrl = movieDto.PosterImageUrl;
            movie.ReleaseDate = movieDto.ReleaseDate;

            // Update genres
            if (movieDto.Genres != null)
            {
                // Remove existing genres
                // Fix for Line 240: Add null check before accessing
                if (movie.MovieGenres != null)
                {
                    _movieGenres.RemoveRange(movie.MovieGenres);
                }

                // Add new genres
                foreach (var genreName in movieDto.Genres)
                {
                    var genre = await _genres.FirstOrDefaultAsync(g => g.Name == genreName);
                    if (genre == null)
                    {
                        genre = new Genre { Name = genreName };
                        _genres.Add(genre);
                        await _context.SaveChangesAsync();
                    }

                    _movieGenres.Add(new MovieGenre
                    {
                        MovieId = movie.Id,
                        GenreId = genre.Id
                    });
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MovieExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            var updatedMovie = await GetMovieDto(id);
            // Fix 4: Add null check before returning
            if (updatedMovie == null)
            {
                return NotFound();
            }

            return Ok(updatedMovie);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _movies.FindAsync(id);
            if (movie == null)
            {
                return NotFound();
            }

            _movies.Remove(movie);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MovieExists(int id)
        {
            return _movies.Any(e => e.Id == id);
        }

        private async Task<MovieDTO?> GetMovieDto(int id)
        {
            // Check if the movie exists
            var movieExists = await _movies.AnyAsync(m => m.Id == id);
            if (!movieExists)
            {
                return null;
            }

            // Get the movie details
            var movie = await _movies
                .Where(m => m.Id == id)
                .Select(m => new MovieDTO
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    DurationMinutes = m.DurationMinutes,
                    Rating = m.Rating,
                    PosterImageUrl = m.PosterImageUrl,
                    ReleaseDate = m.ReleaseDate,
                    Genres = new List<string>()
                })
                .FirstOrDefaultAsync();

            if (movie == null)
            {
                return null;
            }

            // Get genres separately
            var genres = await _movieGenres
                .Include(mg => mg.Genre)
                .Where(mg => mg.MovieId == id)
                .Select(mg => mg.Genre != null ? mg.Genre.Name : string.Empty)
                .Where(name => !string.IsNullOrEmpty(name))
                .ToListAsync();

            movie.Genres = genres;
            return movie;
        }
    }
}