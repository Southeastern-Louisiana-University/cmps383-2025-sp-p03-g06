// Data/SeedSeats.cs
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Theaters;

namespace Selu383.SP25.P03.Api.Data
{
    public static class SeedSeats
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions<DataContext>>());
            {
                // Look for any seats
                if (context.Seats.Any())
                {
                    return;   // DB has been seeded
                }

                // Get all theater rooms
                var rooms = context.TheaterRooms.ToList();
                if (!rooms.Any())
                {
                    return; // No rooms to add seats to
                }

                var seats = new List<Seat>();

                // For each room, create a seating layout
                foreach (var room in rooms)
                {
                    // Standard theaters
                    // Create a standard layout based on room size
                    int seatsPerRow = 12; // Fixed number of seats per row

                    for (char row = 'A'; row <= 'H'; row++)
                    {
                        for (int seatNum = 1; seatNum <= seatsPerRow; seatNum++)
                        {
                            string seatType = "Standard";

                            // First two rows are VIP
                            if (row <= 'B')
                            {
                                seatType = "VIP";
                            }
                            // Middle rows (C-F) middle seats are Premium
                            else if (row >= 'C' && row <= 'F' && seatNum >= 4 && seatNum <= 9)
                            {
                                seatType = "Premium";
                            }
                            // Add accessible seats at the ends of row G
                            else if (row == 'G' && (seatNum == 1 || seatNum == seatsPerRow))
                            {
                                seatType = "Accessible";
                            }

                            seats.Add(new Seat
                            {
                                TheaterRoomId = room.Id,
                                Row = row.ToString(),
                                Number = seatNum,
                                SeatType = seatType
                            });
                        }
                    }
                }

                context.Seats.AddRange(seats);
                context.SaveChanges();

                // Update the seat count in each theater room
                foreach (var room in rooms)
                {
                    var actualSeatCount = seats.Count(s => s.TheaterRoomId == room.Id);
                    room.SeatCount = actualSeatCount;
                }

                context.SaveChanges();
            }
        }
    }
}