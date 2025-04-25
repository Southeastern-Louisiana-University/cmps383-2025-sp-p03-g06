using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Movies;

namespace Selu383.SP25.P03.Api.Data
{
    public static class SeedTheaterMovies
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions<DataContext>>());

            // Clear existing theater-movie relationships if any
            if (context.TheaterMovies.Any())
            {
                context.TheaterMovies.RemoveRange(context.TheaterMovies);
                context.SaveChanges();
            }

            // Get all theaters and movies
            var theaters = context.Theaters.ToList();
            var movies = context.Movies.ToList();

            if (!theaters.Any() || !movies.Any())
            {
                return; // Can't create relationships without theaters and movies
            }

            var theaterMovies = new List<TheaterMovie>();

            // Assign movies to theaters based on release dates and theater characteristics
            foreach (var theater in theaters)
            {
                // Get movies that are releasing within the next 30 days or released in the last 30 days
                var recentAndUpcomingMovies = movies.Where(m => 
                    Math.Abs((m.ReleaseDate - DateTime.UtcNow).TotalDays) <= 30).ToList();

                // Get older movies that are still showing
                var olderMovies = movies.Where(m => 
                    (DateTime.UtcNow - m.ReleaseDate).TotalDays > 30 && 
                    (DateTime.UtcNow - m.ReleaseDate).TotalDays <= 90).ToList();

                // Each theater gets 4-6 recent/upcoming movies
                var selectedRecentMovies = recentAndUpcomingMovies
                    .OrderBy(x => Guid.NewGuid()) // Random selection
                    .Take(Random.Shared.Next(4, 7))
                    .ToList();

                // Each theater gets 2-3 older movies
                var selectedOlderMovies = olderMovies
                    .OrderBy(x => Guid.NewGuid()) // Random selection
                    .Take(Random.Shared.Next(2, 4))
                    .ToList();

                // Combine all selected movies
                var selectedMovies = selectedRecentMovies.Concat(selectedOlderMovies);

                // Create theater-movie relationships
                foreach (var movie in selectedMovies)
                {
                    theaterMovies.Add(new TheaterMovie
                    {
                        TheaterId = theater.Id,
                        MovieId = movie.Id
                    });
                }
            }

            context.TheaterMovies.AddRange(theaterMovies);
            context.SaveChanges();
        }
    }
} 