using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Movies;
using Selu383.SP25.P03.Api.Features.Theaters;

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

            var theaters = context.Theaters.ToList();
            var movies = context.Movies.ToList();

            // Get specific movies that should have no theaters
            var mufasa = movies.Single(m => m.Title == "Mufasa: The Lion King");
            var locked = movies.Single(m => m.Title == "Locked");

            // Remove these movies from the pool of assignable movies
            var assignableMovies = movies
                .Where(m => m != mufasa && m != locked)
                .ToList();

            // Movies that will be in all theaters
            var moviesInAllTheaters = new[]
            {
                assignableMovies.Single(m => m.Title == "Snow White"),
                assignableMovies.Single(m => m.Title == "Captain America: Brave New World")
            };

            // Movies that will be in exactly two theaters
            var moviesInTwoTheaters = new[]
            {
                assignableMovies.Single(m => m.Title == "Mickey 17"),
                assignableMovies.Single(m => m.Title == "Paddington in Peru"),
                assignableMovies.Single(m => m.Title == "The Day the Earth Blew Up: A Looney Tunes Movie")
            };

            // Movies that will be in exactly one theater
            var moviesInOneTheater = assignableMovies
                .Except(moviesInAllTheaters)
                .Except(moviesInTwoTheaters)
                .ToList();

            var theaterMovies = new List<TheaterMovie>();

            // Assign movies that should be in all theaters
            foreach (var movie in moviesInAllTheaters)
            {
                foreach (var theater in theaters)
                {
                    theaterMovies.Add(new TheaterMovie { Movie = movie, Theater = theater });
                }
            }

            // Assign movies that should be in two theaters
            var random = new Random(42); // Fixed seed for reproducibility
            foreach (var movie in moviesInTwoTheaters)
            {
                // Randomly select two theaters
                var selectedTheaters = theaters.OrderBy(x => random.Next()).Take(2).ToList();
                foreach (var theater in selectedTheaters)
                {
                    theaterMovies.Add(new TheaterMovie { Movie = movie, Theater = theater });
                }
            }

            // Assign movies that should be in one theater
            foreach (var movie in moviesInOneTheater)
            {
                var theater = theaters[random.Next(theaters.Count)];
                theaterMovies.Add(new TheaterMovie { Movie = movie, Theater = theater });
            }

            context.TheaterMovies.AddRange(theaterMovies);
            context.SaveChanges();
        }
    }
} 