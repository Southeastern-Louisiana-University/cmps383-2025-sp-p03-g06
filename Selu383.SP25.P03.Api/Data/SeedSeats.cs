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
                    // IMAX and Premium theaters have different layouts
                    if (room.ScreenType == "IMAX" || room.ScreenType == "Premium")
                    {
                        // Rows A-J
                        for (char row = 'A'; row <= 'J'; row++)
                        {
                            // Seats 1-10 per row
                            for (int seatNum = 1; seatNum <= 10; seatNum++)
                            {
                                string seatType = "Standard";

                                // Back rows are Premium in IMAX
                                if (room.ScreenType == "IMAX" && row >= 'H')
                                {
                                    seatType = "Premium";
                                }
                                // All seats are Premium in Premium theaters
                                else if (room.ScreenType == "Premium")
                                {
                                    seatType = "Premium";
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
                    // VIP theaters have a special layout with fewer, luxury seats
                    else if (room.Name == "VIP Lounge")
                    {
                        // Rows A-E
                        for (char row = 'A'; row <= 'E'; row++)
                        {
                            // Seats 1-10 per row
                            for (int seatNum = 1; seatNum <= 10; seatNum++)
                            {
                                seats.Add(new Seat
                                {
                                    TheaterRoomId = room.Id,
                                    Row = row.ToString(),
                                    Number = seatNum,
                                    SeatType = "VIP"
                                });
                            }
                        }
                    }
                    // Drive-In theaters have car spots instead of seats
                    else if (room.ScreenType == "Drive-In")
                    {
                        // Rows A-H
                        for (char row = 'A'; row <= 'H'; row++)
                        {
                            // Spots 1-10 per row (except when row is H)
                            int spots = row == 'H' ? 5 : 10;
                            for (int spotNum = 1; spotNum <= spots; spotNum++)
                            {
                                seats.Add(new Seat
                                {
                                    TheaterRoomId = room.Id,
                                    Row = row.ToString(),
                                    Number = spotNum,
                                    SeatType = "Drive-In"
                                });
                            }
                        }
                    }
                    // Standard theaters
                    else
                    {
                        // Create a standard layout based on room size
                        int rowCount = room.SeatCount / 10;
                        if (rowCount > 26) rowCount = 26; // Max 26 rows (A-Z)
                        if (rowCount < 5) rowCount = 5; // Min 5 rows

                        for (int r = 0; r < rowCount; r++)
                        {
                            char row = (char)('A' + r);
                            int seatsInRow = (r == 0 || r == rowCount - 1) ? 8 : 10; // Fewer seats in first and last rows

                            for (int seatNum = 1; seatNum <= seatsInRow; seatNum++)
                            {
                                string seatType = "Standard";

                                // Middle rows are premium in larger theaters
                                if (room.SeatCount > 50 && r >= rowCount / 3 && r < 2 * rowCount / 3 && seatNum >= 3 && seatNum <= 8)
                                {
                                    seatType = "Premium";
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
                }

                context.Seats.AddRange(seats);
                context.SaveChanges();

                // Update the seat count in each theater room to match the actual number of seats created
                foreach (var room in rooms)
                {
                    var actualSeatCount = seats.Count(s => s.TheaterRoomId == room.Id);
                    room.SeatCount = actualSeatCount;
                }

                // Update theater total seat counts
                var theaters = context.Theaters.ToList();
                foreach (var theater in theaters)
                {
                    var theaterRooms = rooms.Where(r => r.TheaterId == theater.Id).ToList();
                    var totalSeats = theaterRooms.Sum(r => r.SeatCount);
                    theater.SeatCount = totalSeats;
                }

                context.SaveChanges();
            }
        }
    }
}