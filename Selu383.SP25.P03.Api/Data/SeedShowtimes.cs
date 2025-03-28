// Data/SeedShowtimes.cs
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Showtimes;

namespace Selu383.SP25.P03.Api.Data
{
    public static class SeedShowtimes
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions<DataContext>>());

            // Check if any showtimes exist already
            if (context.Showtimes.Any())
            {
                return;   // DB has been seeded
            }

            // Get movies, theater rooms
            var movies = context.Movies.ToList();
            var theaterRooms = context.TheaterRooms.ToList();

            if (!movies.Any() || !theaterRooms.Any())
            {
                return; // Can't create showtimes without movies and rooms
            }

            var showtimes = new List<Showtime>();
            var random = new Random();

            // Current date for reference
            var today = DateTime.UtcNow.Date;

            // Create showtimes for the next 7 days
            for (int dayOffset = 0; dayOffset < 7; dayOffset++)
            {
                var currentDate = today.AddDays(dayOffset);

                // Create multiple showtimes for each theater room
                foreach (var room in theaterRooms)
                {
                    // Assign 2-3 different movies for each room per day
                    var moviesForRoom = movies.OrderBy(x => random.Next()).Take(random.Next(2, 4)).ToList();

                    foreach (var movie in moviesForRoom)
                    {
                        // Create 2-4 showtimes for this movie in this room on this day
                        var showtimeCount = random.Next(2, 5);

                        for (int i = 0; i < showtimeCount; i++)
                        {
                            // Generate showtimes between 10 AM and 10 PM
                            int hour = 10 + (i * 3) + random.Next(0, 2); // Stagger by ~3 hours
                            if (hour > 22) continue; // Skip if too late

                            var startTime = currentDate.AddHours(hour).AddMinutes(random.Next(0, 4) * 15); // 15-minute intervals
                            var endTime = startTime.AddMinutes(movie.DurationMinutes);

                            // Set ticket price - standard, premium, or IMAX
                            decimal basePrice = 9.99m; // Standard price
                            if (room.ScreenType == "Premium" || room.ScreenType == "VIP")
                            {
                                basePrice = 14.99m;
                            }
                            else if (room.ScreenType == "IMAX" || room.ScreenType == "3D")
                            {
                                basePrice = 16.99m;
                            }

                            // Add discount for early shows
                            if (hour < 13)
                            {
                                basePrice -= 2.00m;
                            }

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