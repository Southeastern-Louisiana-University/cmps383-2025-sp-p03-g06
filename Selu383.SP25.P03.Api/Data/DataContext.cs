using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Authorization;
using Selu383.SP25.P03.Api.Features.Concessions;
using Selu383.SP25.P03.Api.Features.Movies;
using Selu383.SP25.P03.Api.Features.OrderItems;
using Selu383.SP25.P03.Api.Features.Payments;
using Selu383.SP25.P03.Api.Features.Reservations;
using Selu383.SP25.P03.Api.Features.Showtimes;
using Selu383.SP25.P03.Api.Features.Theaters;
using Selu383.SP25.P03.Api.Features.Users;
using System.Reflection.Emit;

namespace Selu383.SP25.P03.Api.Data
{
    public class DataContext : IdentityDbContext<
        User,
        Features.Authorization.Role,
        int,
        IdentityUserClaim<int>,
        Features.Authorization.UserRole,
        IdentityUserLogin<int>,
        IdentityRoleClaim<int>,
        IdentityUserToken<int>>
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        public DbSet<Theater> Theaters { get; set; }
        public DbSet<TheaterRoom> TheaterRooms { get; set; }
        public DbSet<Seat> Seats { get; set; }
        public DbSet<Movie> Movies { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<MovieGenre> MovieGenres { get; set; }
        public DbSet<Showtime> Showtimes { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<ReservationSeat> ReservationSeats { get; set; }
        public DbSet<ConcessionCategory> ConcessionCategories { get; set; }
        public DbSet<ConcessionItem> ConcessionItems { get; set; }
        public DbSet<ConcessionOrder> ConcessionOrders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Payment> Payments { get; set; }

        // Add join table for Movie-Theater relationship
        public DbSet<TheaterMovie> TheaterMovies { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // UserRole configuration
            builder.Entity<Features.Authorization.UserRole>().HasKey(x => new { x.UserId, x.RoleId });
            builder.Entity<User>()
                .HasMany(e => e.UserRoles)
                .WithOne(x => x.User)
                .HasForeignKey(e => e.UserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Features.Authorization.Role>()
                .HasMany(e => e.UserRoles)
                .WithOne(x => x.Role)
                .HasForeignKey(x => x.RoleId)  // Change e to x here
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            // MovieGenre configuration
            builder.Entity<MovieGenre>().HasKey(x => new { x.MovieId, x.GenreId });
            builder.Entity<MovieGenre>()
                .HasOne(mg => mg.Movie)
                .WithMany(m => m.MovieGenres)
                .HasForeignKey(mg => mg.MovieId);
            builder.Entity<MovieGenre>()
                .HasOne(mg => mg.Genre)
                .WithMany(g => g.MovieGenres)
                .HasForeignKey(mg => mg.GenreId);

            // ReservationSeat configuration
            builder.Entity<ReservationSeat>()
                .HasKey(rs => new { rs.ReservationId, rs.SeatId });
            builder.Entity<ReservationSeat>()
                .HasOne(rs => rs.Reservation)
                .WithMany(r => r.ReservationSeats)
                .HasForeignKey(rs => rs.ReservationId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<ReservationSeat>()
                .HasOne(rs => rs.Seat)
                .WithMany(s => s.ReservationSeats)
                .HasForeignKey(rs => rs.SeatId)
                .OnDelete(DeleteBehavior.NoAction);

            // Theater configuration
            builder.Entity<Theater>()
                .HasMany(t => t.Rooms)
                .WithOne(r => r.Theater)
                .HasForeignKey(r => r.TheaterId);

            // TheaterRoom configuration
            builder.Entity<TheaterRoom>()
                .HasMany(r => r.Seats)
                .WithOne(s => s.TheaterRoom)
                .HasForeignKey(s => s.TheaterRoomId);

            // Showtime configuration
            builder.Entity<Showtime>()
                .HasOne(s => s.Movie)
                .WithMany(m => m.Showtimes)
                .HasForeignKey(s => s.MovieId);
            builder.Entity<Showtime>()
                .HasOne(s => s.TheaterRoom)
                .WithMany(r => r.Showtimes)
                .HasForeignKey(s => s.TheaterRoomId);

            // Reservation configuration
            builder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId);
            builder.Entity<Reservation>()
                .HasOne(r => r.Showtime)
                .WithMany(s => s.Reservations)
                .HasForeignKey(r => r.ShowtimeId);

            // ConcessionOrder configuration
            builder.Entity<ConcessionOrder>(entity =>
            {
                entity.Property(e => e.Id).IsRequired();
                entity.Property(e => e.ReservationId).IsRequired();
                entity.Property(e => e.OrderTime).IsRequired();
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2).IsRequired();
                entity.Property(e => e.Status).IsRequired();
                entity.Property(e => e.GuestName).HasMaxLength(100);
                entity.Property(e => e.GuestEmail).HasMaxLength(255);
                entity.Property(e => e.GuestPhone).HasMaxLength(20);

                entity.HasOne(o => o.Reservation)
                    .WithMany(r => r.ConcessionOrders)
                    .HasForeignKey(o => o.ReservationId);
            });

            // OrderItem configuration
            builder.Entity<OrderItem>(entity =>
            {
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                
                entity.HasOne(oi => oi.Order)
                    .WithMany(o => o.OrderItems)
                    .HasForeignKey(oi => oi.OrderId);
                
                entity.HasOne(oi => oi.ConcessionItem)
                    .WithMany(ci => ci.OrderItems)
                    .HasForeignKey(oi => oi.ConcessionItemId);
            });

            // ConcessionItem configuration
            builder.Entity<ConcessionItem>()
                .HasOne(ci => ci.Category)
                .WithMany(c => c.Items)
                .HasForeignKey(ci => ci.CategoryId);

            // TheaterMovie join configuration
            builder.Entity<TheaterMovie>()
                .HasKey(tm => new { tm.MovieId, tm.TheaterId });
            builder.Entity<TheaterMovie>()
                .HasOne(tm => tm.Movie)
                .WithMany(m => m.TheaterMovies)
                .HasForeignKey(tm => tm.MovieId);
            builder.Entity<TheaterMovie>()
                .HasOne(tm => tm.Theater)
                .WithMany(t => t.TheaterMovies)
                .HasForeignKey(tm => tm.TheaterId);

            // Payment configuration
            builder.Entity<Payment>(entity =>
            {
                entity.Property(e => e.Id).IsRequired();
                entity.Property(e => e.Amount).HasPrecision(18, 2).IsRequired();
                entity.Property(e => e.PaymentTime).IsRequired();
                entity.Property(e => e.PaymentMethod).HasMaxLength(50).IsRequired();
                entity.Property(e => e.PaymentStatus).HasMaxLength(50).IsRequired();
                entity.Property(e => e.TransactionId).HasMaxLength(100);
                entity.Property(e => e.PaymentDetails).HasMaxLength(500);

                entity.HasOne(e => e.Reservation)
                    .WithMany()
                    .HasForeignKey(e => e.ReservationId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ConcessionOrder)
                    .WithMany()
                    .HasForeignKey(e => e.ConcessionOrderId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
