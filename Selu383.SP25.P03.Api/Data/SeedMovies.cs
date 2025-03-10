using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Movies;

namespace Selu383.SP25.P03.Api.Data
{
    public static class SeedMovies
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using (var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions<DataContext>>()))
            {
                
                if (context.Movies.Any())
                    return;   

                context.Movies.AddRange(
                    new Movie
                    {
                        Title = "Titanic",
                        Genre = "Drama, Romance",
                        Description = "A poor artist and a rich debutante meet and fall in love on the famously ill-fated maiden voyage of the `unsinkable' RMS Titanic in 1912.",
                        Rating = "PG-13",
                        Duration = TimeSpan.FromMinutes(195),
                        ReleaseDate = new DateTime(1997, 12, 19)
                    },
                    new Movie
                    {
                        Title = "Interstellar",
                        Genre = "Adventure, Drama, Sci-Fi",
                        Description = "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
                        Rating = "PG-13",
                        Duration = TimeSpan.FromMinutes(169),
                        ReleaseDate = new DateTime(2014, 11, 7)
                    },
                    new Movie
                    {
                        Title = "The Conjuring",
                        Genre = "Horror, Mystery, Thriller",
                        Description = "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.",
                        Rating = "R",
                        Duration = TimeSpan.FromMinutes(112),
                        ReleaseDate = new DateTime(2013, 7, 19)
                    },
                    new Movie
                    {
                        Title = "The Lion King",
                        Genre = "Animation, Adventure, Drama",
                        Description = "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.",
                        Rating = "G",
                        Duration = TimeSpan.FromMinutes(88),
                        ReleaseDate = new DateTime(1994, 6, 24)
                    },
                    new Movie
                    {
                        Title = "Grown Ups",
                        Genre = "Comedy",
                        Description = "After their high school basketball coach passes away, five good friends and former teammates reunite for a Fourth of July holiday weekend.",
                        Rating = "PG-13",
                        Duration = TimeSpan.FromMinutes(102),
                        ReleaseDate = new DateTime(2010, 6, 25)
                    }
                );

                context.SaveChanges();
            }
        }
    }
}
