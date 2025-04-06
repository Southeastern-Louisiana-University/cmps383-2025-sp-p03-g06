// Data/SeedMovies.cs - Updated with official movie list
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Movies;

namespace Selu383.SP25.P03.Api.Data
{
    public static class SeedMovies
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions<DataContext>>());

            // First, clear existing movies and genres if any
            if (context.Movies.Any())
            {
                context.MovieGenres.RemoveRange(context.MovieGenres);
                context.Movies.RemoveRange(context.Movies);
                context.SaveChanges();
            }

            // Clear and recreate genres
            if (context.Genres.Any())
            {
                context.Genres.RemoveRange(context.Genres);
                context.SaveChanges();
            }

            // Add genres
            var genres = new List<Genre>
            {
                new() { Name = "Action" },
                new() { Name = "Adventure" },
                new() { Name = "Animation" },
                new() { Name = "Comedy" },
                new() { Name = "Drama" },
                new() { Name = "Family" },
                new() { Name = "Horror" },
                new() { Name = "Musical" },
                new() { Name = "Science Fiction" },
                new() { Name = "Thriller" },
                new() { Name = "Romance" }
            };

            context.Genres.AddRange(genres);
            context.SaveChanges();

            // Add official movies
            var movies = new List<Movie>
            {
                new()
                {
                    Title = "Snow White",
                    Description = "A princess joins forces with seven dwarfs to liberate her kingdom from her cruel stepmother the Evil Queen.",
                    DurationMinutes = 109, // 1 hr 49 minutes
                    Rating = "PG",
                    PosterImageUrl = "/images/movies/snow_white.jpg",
                    ReleaseDate = new DateTime(2025, 3, 21)
                },
                new()
                {
                    Title = "Death of a Unicorn",
                    Description = "Father-Daughter duo Elliott and Ridley hit a unicorn with their car and bring it to the wilderness retreat of a mega-wealthy pharmaceutical CEO.",
                    DurationMinutes = 108, // 1 hr 48 minutes
                    Rating = "R",
                    PosterImageUrl = "/images/movies/death_of_a_unicorn.jpg",
                    ReleaseDate = new DateTime(2025, 3, 28)
                },
                new()
                {
                    Title = "Novocaine",
                    Description = "When the girl of his dreams is kidnapped, a man incapable of feeling physical pain turns his rare condition into an unexpected advantage in the fight to rescue her.",
                    DurationMinutes = 110, // 1 hr 50 minutes
                    Rating = "R",
                    PosterImageUrl = "/images/movies/novocaine.jpg",
                    ReleaseDate = new DateTime(2025, 3, 14)
                },
                new()
                {
                    Title = "Mickey 17",
                    Description = "Mickey 17, known as an \"expendable,\" goes on a dangerous journey to colonize an ice planet.",
                    DurationMinutes = 137, // 2 hr 17 minutes
                    Rating = "R",
                    PosterImageUrl = "/images/movies/mickey_17.jpg",
                    ReleaseDate = new DateTime(2025, 3, 7)
                },
                new()
                {
                    Title = "A Working Man",
                    Description = "Levon Cade left his profession behind to work construction and be a good dad to his daughter. But when a local girl vanishes, he's asked to return to the skills that made him a mythic figure in the shadowy world of counter-terrorism.",
                    DurationMinutes = 116, // 1 hr 56 minutes
                    Rating = "R",
                    PosterImageUrl = "/images/movies/a_working_man.jpg",
                    ReleaseDate = new DateTime(2025, 3, 28)
                },
                new()
                {
                    Title = "The Woman in the Yard",
                    Description = "A mysterious woman repeatedly appears in a family's front yard, often delivering chilling warnings and unsettling messages, leaving them to question her identity, motives and the potential danger she might pose.",
                    DurationMinutes = 88, // 1 hr 28 minutes
                    Rating = "PG-13",
                    PosterImageUrl = "/images/movies/woman_in_the_yard.jpg",
                    ReleaseDate = new DateTime(2025, 3, 28)
                },
                new()
                {
                    Title = "The Day the Earth Blew Up: A Looney Tunes Movie",
                    Description = "Porky Pig and Daffy Duck are Earth's only hope when facing the threat of alien invasion.",
                    DurationMinutes = 91, // 1 hr 31 minutes
                    Rating = "PG",
                    PosterImageUrl = "/images/movies/looney_tunes.jpg",
                    ReleaseDate = new DateTime(2025, 3, 14)
                },
                new()
                {
                    Title = "Dog Man",
                    Description = "Dog Man, half dog and half man, he is sworn to protect and serve as he doggedly pursues the feline supervillain Petey the Cat.",
                    DurationMinutes = 94, // 1 hr 34 minutes
                    Rating = "PG",
                    PosterImageUrl = "/images/movies/dog_man.jpg",
                    ReleaseDate = new DateTime(2025, 1, 31)
                },
                new()
                {
                    Title = "The Monkey",
                    Description = "When twin brothers Bill and Hal find their father's old monkey toy in the attic, a series of gruesome deaths start. The siblings decide to throw the toy away and move on with their lives, growing apart over the years.",
                    DurationMinutes = 98, // 1 hr 38 minutes
                    Rating = "R",
                    PosterImageUrl = "/images/movies/the_monkey.jpg",
                    ReleaseDate = new DateTime(2025, 2, 21)
                },
                new()
                {
                    Title = "Paddington in Peru",
                    Description = "Paddington returns to Peru to visit his beloved Aunt Lucy, who now resides at the Home for Retired Bears. With the Brown family in tow, a thrilling adventure ensues when a mystery plunges them into an unexpected journey.",
                    DurationMinutes = 106, // 1 hr 46 minutes
                    Rating = "PG",
                    PosterImageUrl = "/images/movies/paddington_in_peru.jpg",
                    ReleaseDate = new DateTime(2025, 2, 14)
                },
                new()
                {
                    Title = "Captain America: Brave New World",
                    Description = "Sam Wilson, the new Captain America, finds himself in the middle of an international incident and must discover the motive behind a nefarious global plan.",
                    DurationMinutes = 118, // 1 hr 58 minutes
                    Rating = "PG-13",
                    PosterImageUrl = "/images/movies/captain_america.jpg",
                    ReleaseDate = new DateTime(2025, 2, 14)
                },
                new()
                {
                    Title = "Mufasa: The Lion King",
                    Description = "Mufasa, a cub lost and alone, meets a sympathetic lion named Taka, the heir to a royal bloodline. The chance meeting sets in motion an expansive journey of a group of misfits searching for their destiny.",
                    DurationMinutes = 118, // 1 hr 58 minutes
                    Rating = "PG",
                    PosterImageUrl = "/images/movies/mufasa.jpg",
                    ReleaseDate = new DateTime(2024, 12, 20)
                },
                new()
                {
                    Title = "Locked",
                    Description = "A thief breaking into a luxury SUV realizes that he has slipped into a sophisticated game of psychological horror.",
                    DurationMinutes = 95, // 1 hr 35 minutes
                    Rating = "R",
                    PosterImageUrl = "/images/movies/locked.jpg",
                    ReleaseDate = new DateTime(2025, 3, 21)
                },
                new()
                {
                    Title = "One of Them Days",
                    Description = "When best friends and roommates Dreux and Alyssa discover Alyssa's boyfriend has blown their rent money, the duo finds themselves going to extremes in a race against the clock to avoid eviction and keep their friendship intact.",
                    DurationMinutes = 97, // 1 hr 37 minutes
                    Rating = "R",
                    PosterImageUrl = "/images/movies/one_of_them_days.jpg",
                    ReleaseDate = new DateTime(2025, 1, 17)
                }
            };

            context.Movies.AddRange(movies);
            context.SaveChanges();

            // Fetch genres
            var actionGenre = context.Genres.Single(g => g.Name == "Action");
            var adventureGenre = context.Genres.Single(g => g.Name == "Adventure");
            var animationGenre = context.Genres.Single(g => g.Name == "Animation");
            var comedyGenre = context.Genres.Single(g => g.Name == "Comedy");
            var dramaGenre = context.Genres.Single(g => g.Name == "Drama");
            var familyGenre = context.Genres.Single(g => g.Name == "Family");
            var horrorGenre = context.Genres.Single(g => g.Name == "Horror");
            var musicalGenre = context.Genres.Single(g => g.Name == "Musical");
            var sciFiGenre = context.Genres.Single(g => g.Name == "Science Fiction");
            var thrillerGenre = context.Genres.Single(g => g.Name == "Thriller");

            // Fetch movies
            var snowWhite = context.Movies.Single(m => m.Title == "Snow White");
            var deathOfUnicorn = context.Movies.Single(m => m.Title == "Death of a Unicorn");
            var novocaine = context.Movies.Single(m => m.Title == "Novocaine");
            var mickey17 = context.Movies.Single(m => m.Title == "Mickey 17");
            var workingMan = context.Movies.Single(m => m.Title == "A Working Man");
            var womanInYard = context.Movies.Single(m => m.Title == "The Woman in the Yard");
            var looneyTunes = context.Movies.Single(m => m.Title == "The Day the Earth Blew Up: A Looney Tunes Movie");
            var dogMan = context.Movies.Single(m => m.Title == "Dog Man");
            var theMonkey = context.Movies.Single(m => m.Title == "The Monkey");
            var paddington = context.Movies.Single(m => m.Title == "Paddington in Peru");
            var captainAmerica = context.Movies.Single(m => m.Title == "Captain America: Brave New World");
            var mufasa = context.Movies.Single(m => m.Title == "Mufasa: The Lion King");
            var locked = context.Movies.Single(m => m.Title == "Locked");
            var oneOfThemDays = context.Movies.Single(m => m.Title == "One of Them Days");

            // Associate movies with genres
            var movieGenres = new List<MovieGenre>
            {
                new() { Movie = snowWhite, Genre = musicalGenre },
                new() { Movie = snowWhite, Genre = familyGenre },
                new() { Movie = snowWhite, Genre = adventureGenre },

                new() { Movie = deathOfUnicorn, Genre = comedyGenre },
                new() { Movie = deathOfUnicorn, Genre = dramaGenre },

                new() { Movie = novocaine, Genre = actionGenre },
                new() { Movie = novocaine, Genre = thrillerGenre },

                new() { Movie = mickey17, Genre = adventureGenre },
                new() { Movie = mickey17, Genre = sciFiGenre },

                new() { Movie = workingMan, Genre = actionGenre },
                new() { Movie = workingMan, Genre = thrillerGenre },
                new() { Movie = workingMan, Genre = dramaGenre },

                new() { Movie = womanInYard, Genre = horrorGenre },
                new() { Movie = womanInYard, Genre = thrillerGenre },

                new() { Movie = looneyTunes, Genre = animationGenre },
                new() { Movie = looneyTunes, Genre = comedyGenre },
                new() { Movie = looneyTunes, Genre = familyGenre },
                new() { Movie = looneyTunes, Genre = sciFiGenre },

                new() { Movie = dogMan, Genre = animationGenre },
                new() { Movie = dogMan, Genre = comedyGenre },
                new() { Movie = dogMan, Genre = familyGenre },

                new() { Movie = theMonkey, Genre = horrorGenre },
                new() { Movie = theMonkey, Genre = thrillerGenre },

                new() { Movie = paddington, Genre = familyGenre },
                new() { Movie = paddington, Genre = adventureGenre },
                new() { Movie = paddington, Genre = comedyGenre },

                new() { Movie = captainAmerica, Genre = actionGenre },
                new() { Movie = captainAmerica, Genre = adventureGenre },
                new() { Movie = captainAmerica, Genre = sciFiGenre },

                new() { Movie = mufasa, Genre = animationGenre },
                new() { Movie = mufasa, Genre = familyGenre },
                new() { Movie = mufasa, Genre = adventureGenre },

                new() { Movie = locked, Genre = horrorGenre },
                new() { Movie = locked, Genre = thrillerGenre },

                new() { Movie = oneOfThemDays, Genre = comedyGenre },
                new() { Movie = oneOfThemDays, Genre = dramaGenre }
            };

            context.MovieGenres.AddRange(movieGenres);
            context.SaveChanges();
        }
    }
}