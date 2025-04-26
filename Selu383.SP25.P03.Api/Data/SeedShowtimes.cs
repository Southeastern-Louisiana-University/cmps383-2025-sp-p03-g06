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

            // Clear existing showtimes if any
            if (context.Showtimes.Any())
            {
                context.Showtimes.RemoveRange(context.Showtimes);
                context.SaveChanges();
            }

            var rooms = context.TheaterRooms
                .Include(tr => tr.Theater)
                .ToList();

            var theaterMovies = context.TheaterMovies
                .Include(tm => tm.Movie)
                .ToList();

            if (!rooms.Any() || !theaterMovies.Any())
                return;

            var random = new Random(42); // Fixed seed for reproducibility
            var showtimes = new List<Showtime>();

            // Start from today and go 14 days out
            var startDate = DateTime.UtcNow.Date;
            var endDate = startDate.AddDays(14);

            // Standard show times (24-hour format)
            var weekdayTimes = new[] { 14, 17, 20 }; // 2pm, 5pm, 8pm
            var weekendTimes = new[] { 11, 14, 17, 20, 22 }; // 11am, 2pm, 5pm, 8pm, 10pm

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                var isWeekend = date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;
                var timeslots = isWeekend ? weekendTimes : weekdayTimes;

                foreach (var room in rooms)
                {
                    // Get movies available for this theater
                    var availableMovies = theaterMovies
                        .Where(tm => tm.TheaterId == room.Theater.Id)
                        .Select(tm => tm.Movie)
                        .ToList();

                    // Skip if no movies are available for this theater
                    if (!availableMovies.Any())
                        continue;

                    foreach (var timeslot in timeslots)
                    {
                        var showDateTime = date.AddHours(timeslot);
                        
                        // Skip if the showtime would be in the past
                        if (showDateTime <= DateTime.UtcNow)
                            continue;

                        // Randomly select a movie for this timeslot
                        var movie = availableMovies[random.Next(availableMovies.Count)];
                        
                        // Calculate price based on various factors
                        var basePrice = room.ScreenType switch
                        {
                            "IMAX" => 16.99m,
                            "Premium" => 14.99m,
                            "VIP" => 18.99m,
                            _ => 12.99m
                        };

                        // Apply time-based adjustments
                        if (timeslot < 16) // Matinee discount
                            basePrice -= 2.00m;
                        else if (isWeekend && timeslot >= 19) // Weekend evening premium
                            basePrice += 2.00m;

                        // Round to .49 or .99
                        var finalPrice = Math.Round(basePrice * 2, 0) / 2;
                        if (finalPrice % 1 != 0.49m && finalPrice % 1 != 0.99m)
                            finalPrice = Math.Floor(finalPrice) + 0.99m;

                        var showtime = new Showtime
                        {
                            MovieId = movie.Id,
                            TheaterRoomId = room.Id,
                            StartTime = showDateTime,
                            BaseTicketPrice = finalPrice
                        };

                        showtimes.Add(showtime);
                    }
                }
            }

            context.Showtimes.AddRange(showtimes);
            context.SaveChanges();
        }
    }
}