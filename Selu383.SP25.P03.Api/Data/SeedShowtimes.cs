// Data/SeedShowtimes.cs - Updated with more realistic showtimes
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Showtimes;

namespace Selu383.SP25.P03.Api.Data
{
    public static class SeedShowtimes
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions<DataContext>>());

            // Clear existing showtimes
            if (context.Showtimes.Any())
            {
                context.Showtimes.RemoveRange(context.Showtimes);
                context.SaveChanges();
            }

            // Get movies, theater rooms
            var movies = context.Movies.ToList();
            var theaterRooms = context.TheaterRooms.ToList();

            if (!movies.Any() || !theaterRooms.Any())
            {
                return; // Can't create showtimes without movies and rooms
            }

            var showtimes = new List<Showtime>();
            var random = new Random(42); // Fixed seed for reproducibility

            // Current date for reference (use the app's date for consistency)
            var today = DateTime.UtcNow.Date;

            // Popular showing times
            var typicalShowTimes = new[]
            {
                new TimeSpan(10, 30, 0), // 10:30 AM
                new TimeSpan(13, 15, 0), // 1:15 PM
                new TimeSpan(16, 0, 0),  // 4:00 PM
                new TimeSpan(19, 0, 0),  // 7:00 PM
                new TimeSpan(21, 45, 0)  // 9:45 PM
            };

            // Matinee showtimes (lower prices)
            var matineeShowTimes = new[]
            {
                new TimeSpan(11, 30, 0), // 11:30 AM
                new TimeSpan(14, 0, 0),  // 2:00 PM
            };

            // Evening/premium showtimes (higher prices)
            var eveningShowTimes = new[]
            {
                new TimeSpan(17, 30, 0), // 5:30 PM
                new TimeSpan(20, 15, 0), // 8:15 PM
                new TimeSpan(22, 30, 0)  // 10:30 PM
            };

            // Create showtimes for the next 14 days
            for (int dayOffset = 0; dayOffset < 14; dayOffset++)
            {
                var currentDate = today.AddDays(dayOffset);
                bool isWeekend = currentDate.DayOfWeek == DayOfWeek.Friday ||
                                 currentDate.DayOfWeek == DayOfWeek.Saturday ||
                                 currentDate.DayOfWeek == DayOfWeek.Sunday;

                // Each theater has different movie rotations
                foreach (var room in theaterRooms)
                {
                    // Decide which movies to show in this room today
                    // IMAX rooms get blockbusters, premium rooms get higher-rated films
                    List<int> moviesToShow;

                    if (room.ScreenType == "IMAX")
                    {
                        // IMAX rooms get major blockbusters
                        moviesToShow = new List<int> {
                            movies.FindIndex(m => m.Title == "Captain America: Brave New World"),
                            movies.FindIndex(m => m.Title == "Mufasa: The Lion King"),
                            movies.FindIndex(m => m.Title == "Mickey 17")
                        };
                    }
                    else if (room.ScreenType == "Premium" || room.ScreenType == "VIP")
                    {
                        // Premium/VIP rooms get adult-oriented and high-quality films
                        moviesToShow = new List<int> {
                            movies.FindIndex(m => m.Title == "Novocaine"),
                            movies.FindIndex(m => m.Title == "Death of a Unicorn"),
                            movies.FindIndex(m => m.Title == "A Working Man")
                        };
                    }
                    else if (room.ScreenType == "3D")
                    {
                        // 3D rooms get animation and action
                        moviesToShow = new List<int> {
                            movies.FindIndex(m => m.Title == "The Day the Earth Blew Up: A Looney Tunes Movie"),
                            movies.FindIndex(m => m.Title == "Dog Man"),
                            movies.FindIndex(m => m.Title == "Captain America: Brave New World")
                        };
                    }
                    else if (room.Name.Contains("Drive-In"))
                    {
                        // Drive-in gets family and horror depending on the time
                        moviesToShow = new List<int> {
                            movies.FindIndex(m => m.Title == "Paddington in Peru"),
                            movies.FindIndex(m => m.Title == "Snow White"),
                            movies.FindIndex(m => m.Title == "The Monkey")
                        };
                    }
                    else
                    {
                        // Regular screens rotate through all movies, but we'll pick a random subset
                        moviesToShow = new List<int>();
                        var allIndices = Enumerable.Range(0, movies.Count).ToList();

                        // Pick 3-4 random movies for this room
                        int numMoviesToPick = random.Next(3, 5);
                        for (int i = 0; i < numMoviesToPick && allIndices.Count > 0; i++)
                        {
                            int idx = random.Next(0, allIndices.Count);
                            moviesToShow.Add(allIndices[idx]);
                            allIndices.RemoveAt(idx);
                        }
                    }

                    // Times will vary based on room type
                    var roomShowTimes = room.ScreenType switch
                    {
                        "IMAX" or "Premium" or "VIP" => eveningShowTimes,
                        "Drive-In" => new[] { new TimeSpan(19, 30, 0), new TimeSpan(22, 00, 0) }, // Drive-in only at night
                        _ => isWeekend ? typicalShowTimes : matineeShowTimes.Concat(eveningShowTimes).ToArray()
                    };

                    // For each movie in this room's rotation
                    foreach (var movieIndex in moviesToShow)
                    {
                        var movie = movies[movieIndex];

                        // Choose which times to use for this movie
                        // We don't want every movie at every possible time
                        var numShowings = isWeekend ?
                            random.Next(2, Math.Min(4, roomShowTimes.Length)) :
                            random.Next(1, Math.Min(3, roomShowTimes.Length));

                        var selectedTimes = roomShowTimes
                            .OrderBy(x => random.Next()) // Shuffle
                            .Take(numShowings)
                            .OrderBy(x => x); // Sort by time

                        foreach (var showTime in selectedTimes)
                        {
                            var startTime = currentDate.Add(showTime);
                            var endTime = startTime.AddMinutes(movie.DurationMinutes);

                            // Skip if it would end after midnight
                            if (endTime.Day != startTime.Day && endTime.Hour < 2)
                                continue;

                            // Base price determined by room type and time
                            decimal basePrice = 12.99m; // Standard base price

                            // Premium formats cost more
                            if (room.ScreenType == "IMAX") basePrice = 16.99m;
                            else if (room.ScreenType == "Premium" || room.ScreenType == "3D") basePrice = 14.99m;
                            else if (room.ScreenType == "VIP") basePrice = 18.99m;

                            // Matinees are cheaper
                            if (showTime.Hours < 16) basePrice -= 2m;

                            // Weekend premium
                            if (isWeekend && showTime.Hours >= 18) basePrice += 1.5m;

                            // Round to nearest 49 or 99 cents for psychological pricing
                            basePrice = Math.Round(basePrice * 4) / 4;
                            if (Math.Round(basePrice * 100) % 100 != 99 && Math.Round(basePrice * 100) % 100 != 49)
                                basePrice = Math.Floor(basePrice) + 0.99m;

                            showtimes.Add(new Showtime
                            {
                                MovieId = movie.Id,
                                TheaterRoomId = room.Id,
                                StartTime = startTime,
                                EndTime = endTime,
                                BaseTicketPrice = basePrice
                            });
                        }
                    }
                }
            }

            context.Showtimes.AddRange(showtimes);
            context.SaveChanges();
        }
    }
}