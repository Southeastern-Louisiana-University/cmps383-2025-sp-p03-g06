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

            // Get the actual genres and movies from the database to ensure we have correct IDs
            var actionGenre = context.Genres.Single(g => g.Name == "Action");
            var adventureGenre = context.Genres.Single(g => g.Name == "Adventure");
            var animationGenre = context.Genres.Single(g => g.Name == "Animation");
            var comedyGenre = context.Genres.Single(g => g.Name == "Comedy");
            var dramaGenre = context.Genres.Single(g => g.Name == "Drama");
            var fantasyGenre = context.Genres.Single(g => g.Name == "Fantasy");
            var horrorGenre = context.Genres.Single(g => g.Name == "Horror");
            var sciFiGenre = context.Genres.Single(g => g.Name == "Science Fiction");
            var thrillerGenre = context.Genres.Single(g => g.Name == "Thriller");
            var romanceGenre = context.Genres.Single(g => g.Name == "Romance");

            var lionsRoar = context.Movies.Single(m => m.Title == "The Lion's Roar");
            var midnightShadows = context.Movies.Single(m => m.Title == "Midnight Shadows");
            var laughterLane = context.Movies.Single(m => m.Title == "Laughter Lane");
            var galacticVoyager = context.Movies.Single(m => m.Title == "Galactic Voyager");
            var eternalLove = context.Movies.Single(m => m.Title == "Eternal Love");

            // Associate movies with genres using the fetched entities
            var movieGenres = new List<MovieGenre>
    {
        new() { Movie = lionsRoar, Genre = adventureGenre },
        new() { Movie = lionsRoar, Genre = fantasyGenre },
        new() { Movie = midnightShadows, Genre = thrillerGenre },
        new() { Movie = midnightShadows, Genre = dramaGenre },
        new() { Movie = laughterLane, Genre = comedyGenre },
        new() { Movie = laughterLane, Genre = dramaGenre },
        new() { Movie = galacticVoyager, Genre = actionGenre },
        new() { Movie = galacticVoyager, Genre = sciFiGenre },
        new() { Movie = eternalLove, Genre = dramaGenre },
        new() { Movie = eternalLove, Genre = romanceGenre }
    };

            context.MovieGenres.AddRange(movieGenres);
            context.SaveChanges();
        }
    }
}