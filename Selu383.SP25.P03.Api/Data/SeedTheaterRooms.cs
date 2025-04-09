// Data/SeedTheaterRooms.cs
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Theaters;
namespace Selu383.SP25.P03.Api.Data
{
    public static class SeedTheaterRooms
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions<DataContext>>());

            // Look for any theater rooms
            if (context.TheaterRooms.Any())
            {
                return;   // DB has been seeded
            }

            // Get the theaters
            var theaters = context.Theaters.ToList();
            if (theaters.Count == 0)
            {
                return; // No theaters to add rooms to
            }

            // Create rooms for each theater
            var theaterRooms = new List<TheaterRoom>();

            // Check if theaters exist before trying to access them by index
            if (theaters.Count >= 1)  // Make sure at least one theater exists
            {
                // Theater 1: AMC Palace 10
                theaterRooms.AddRange([
                    new() { Name = "Room 1", TheaterId = theaters[0].Id, SeatCount = 50, ScreenType = "Standard" },
                    new() { Name = "Room 2", TheaterId = theaters[0].Id, SeatCount = 50, ScreenType = "Standard" },
                    new() { Name = "IMAX", TheaterId = theaters[0].Id, SeatCount = 100, ScreenType = "IMAX" }
                ]);
            }

            if (theaters.Count >= 2)  // Make sure at least two theaters exist
            {
                // Theater 2: Regal Cinema
                theaterRooms.AddRange([
                    new() { Name = "Room A", TheaterId = theaters[1].Id, SeatCount = 60, ScreenType = "Standard" },
                    new() { Name = "Room B", TheaterId = theaters[1].Id, SeatCount = 60, ScreenType = "Standard" },
                    new() { Name = "Premium", TheaterId = theaters[1].Id, SeatCount = 40, ScreenType = "Premium" }
                ]);
            }

            if (theaters.Count >= 3)  // Make sure at least three theaters exist
            {
                // Theater 3: Grand Theater
                theaterRooms.AddRange([
                    new() { Name = "Main Hall", TheaterId = theaters[2].Id, SeatCount = 150, ScreenType = "Standard" },
                    new() { Name = "3D Theater", TheaterId = theaters[2].Id, SeatCount = 100, ScreenType = "3D" },
                    new() { Name = "VIP Lounge", TheaterId = theaters[2].Id, SeatCount = 50, ScreenType = "Premium" }
                ]);
            }

            if (theaters.Count >= 4)  // Make sure at least four theaters exist
            {
                // Theater 4: Vintage Drive-In
                theaterRooms.AddRange([
                    new() { Name = "Drive-In Screen 1", TheaterId = theaters[3].Id, SeatCount = 75, ScreenType = "Drive-In" },
                    new() { Name = "Drive-In Screen 2", TheaterId = theaters[3].Id, SeatCount = 75, ScreenType = "Drive-In" }
                ]);
            }

            // Only add theater rooms if we have some to add
            if (theaterRooms.Count > 0)
            {
                context.TheaterRooms.AddRange(theaterRooms);
                context.SaveChanges();
            }
        }
    }
}