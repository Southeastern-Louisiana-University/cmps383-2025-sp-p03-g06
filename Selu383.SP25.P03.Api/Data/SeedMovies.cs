// Data/SeedMovies.cs
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Movies;

namespace Selu383.SP25.P03.Api.Data
{
    public static class SeedMovies
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions<DataContext>>());

            // Look for any movies
            if (context.Movies.Any())
            {
                return;   // DB has been seeded
            }

            // Add genres first
            var genres = new List<Genre>
            {
                new() { Name = "Action" },
                new() { Name = "Adventure" },
                new() { Name = "Animation" },
                new() { Name = "Comedy" },
                new() { Name = "Drama" },
                new() { Name = "Fantasy" },
                new() { Name = "Horror" },
                new() { Name = "Science Fiction" },
                new() { Name = "Thriller" },
                new() { Name = "Romance" }
            };

            context.Genres.AddRange(genres);
            context.SaveChanges();

            // Add movies
            var movies = new List<Movie>
            {
                new()
                {
                    Title = "The Lion's Roar",
                    Description = "A thrilling adventure about a young lion finding his place in the world.",
                    DurationMinutes = 120,
                    Rating = "PG",
                    PosterImageUrl = "https://example.com/posters/lions-roar.jpg",
                    ReleaseDate = DateTime.Now.AddDays(-30)
                },
                new()
                {
                    Title = "Midnight Shadows",
                    Description = "A suspenseful thriller about a detective solving a series of mysterious disappearances.",
                    DurationMinutes = 135,
                    Rating = "PG-13",
                    PosterImageUrl = "https://example.com/posters/midnight-shadows.jpg",
                    ReleaseDate = DateTime.Now.AddDays(-15)
                },
                new()
                {
                    Title = "Laughter Lane",
                    Description = "A heartwarming comedy about a family's journey through life's ups and downs.",
                    DurationMinutes = 110,
                    Rating = "PG",
                    PosterImageUrl = "https://example.com/posters/laughter-lane.jpg",
                    ReleaseDate = DateTime.Now.AddDays(-45)
                },
                new()
                {
                    Title = "Galactic Voyager",
                    Description = "An epic science fiction adventure across the stars.",
                    DurationMinutes = 150,
                    Rating = "PG-13",
                    PosterImageUrl = "https://example.com/posters/galactic-voyager.jpg",
                    ReleaseDate = DateTime.Now.AddDays(-10)
                },
                new()
                {
                    Title = "Eternal Love",
                    Description = "A touching romance that spans generations.",
                    DurationMinutes = 125,
                    Rating = "PG-13",
                    PosterImageUrl = "https://example.com/posters/eternal-love.jpg",
                    ReleaseDate = DateTime.Now.AddDays(-60)
                }
            };

            context.Movies.AddRange(movies);
            context.SaveChanges();

            // Associate movies with genres
            var movieGenres = new List<MovieGenre>
            {
                new() { MovieId = 1, GenreId = 2 }, // The Lion's Roar - Adventure
                new() { MovieId = 1, GenreId = 6 }, // The Lion's Roar - Fantasy
                new() { MovieId = 2, GenreId = 9 }, // Midnight Shadows - Thriller
                new() { MovieId = 2, GenreId = 5 }, // Midnight Shadows - Drama
                new() { MovieId = 3, GenreId = 4 }, // Laughter Lane - Comedy
                new() { MovieId = 3, GenreId = 5 }, // Laughter Lane - Drama
                new() { MovieId = 4, GenreId = 1 }, // Galactic Voyager - Action
                new() { MovieId = 4, GenreId = 8 }, // Galactic Voyager - Science Fiction
                new() { MovieId = 5, GenreId = 5 }, // Eternal Love - Drama
                new() { MovieId = 5, GenreId = 10 }  // Eternal Love - Romance
            };

            context.MovieGenres.AddRange(movieGenres);
            context.SaveChanges();
        }
    }
}