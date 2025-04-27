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
    [AllowAnonymous]
    public class MoviesController(DataContext context) : ControllerBase
    {
        private readonly DataContext _context = context;
        private readonly DbSet<Movie> _movies = context.Set<Movie>();
        private readonly DbSet<Genre> _genres = context.Set<Genre>();
        private readonly DbSet<MovieGenre> _movieGenres = context.Set<MovieGenre>();

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MovieDTO>>> GetMovies()
        {
            var movies = await _movies
                .Select(m => new MovieDTO
                {
                    Id = m.Id,
                    Title = m.Title,
                    Description = m.Description,
                    DurationMinutes = m.DurationMinutes,
                    Rating = m.Rating,
                    PosterImageUrl = m.PosterImageUrl,
                    TrailerUrl = m.TrailerUrl,
                    ReleaseDate = m.ReleaseDate,
                    RatingScore = m.RatingScore,
                    Genres = new List<string>()
                })
                .ToListAsync();

            var movieIds = movies.Select(m => m.Id).ToList();
            var movieGenres = await _context.Set<MovieGenre>()
                .Include(mg => mg.Genre)
                .Where(mg => movieIds.Contains(mg.MovieId))
                .ToListAsync();

            var genresByMovieId = movieGenres
                .GroupBy(mg => mg.MovieId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(mg => mg.Genre?.Name ?? string.Empty).Where(name => !string.IsNullOrEmpty(name)).ToList()
                );

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
            var movieExists = await _movies.AnyAsync(m => m.Id == id);
            if (!movieExists)
            {
                return NotFound();
            }

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
                    TrailerUrl = m.TrailerUrl,
                    ReleaseDate = m.ReleaseDate,
                    RatingScore = m.RatingScore,
                    Genres = new List<string>()
                })
                .FirstOrDefaultAsync();

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
                TrailerUrl = movieDto.TrailerUrl,
                ReleaseDate = movieDto.ReleaseDate,
                RatingScore = movieDto.RatingScore
            };

            _movies.Add(movie);
            await _context.SaveChangesAsync();

            if (movieDto.Genres != null && movieDto.Genres.Count > 0)
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
                TrailerUrl = movie.TrailerUrl,
                ReleaseDate = movie.ReleaseDate,
                RatingScore = movie.RatingScore,
                Genres = movieDto.Genres ?? []
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
            movie.TrailerUrl = movieDto.TrailerUrl;
            movie.ReleaseDate = movieDto.ReleaseDate;
            movie.RatingScore = movieDto.RatingScore;

            if (movieDto.Genres != null)
            {
                if (movie.MovieGenres != null)
                {
                    _movieGenres.RemoveRange(movie.MovieGenres);
                }

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
            var movieExists = await _movies.AnyAsync(m => m.Id == id);
            if (!movieExists)
            {
                return null;
            }

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
                    TrailerUrl = m.TrailerUrl,
                    ReleaseDate = m.ReleaseDate,
                    RatingScore = m.RatingScore,
                    Genres = new List<string>()
                })
                .FirstOrDefaultAsync();

            if (movie == null)
            {
                return null;
            }

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