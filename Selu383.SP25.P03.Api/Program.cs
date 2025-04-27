using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Authorization;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            try
            {
                var builder = WebApplication.CreateBuilder(args);

                // Configure logging
                builder.Logging.ClearProviders();
                builder.Logging.AddConsole();
                builder.Logging.AddDebug();
                builder.Logging.SetMinimumLevel(LogLevel.Information);

                // Add services to the container.
                builder.Services.AddDbContext<DataContext>(options =>
                {
                    options.UseSqlServer(builder.Configuration.GetConnectionString("DataContext") ?? 
                        throw new InvalidOperationException("Connection string 'DataContext' not found."));
                    options.EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
                });

                builder.Services.AddControllers();

                // Add CORS
                builder.Services.AddCors(options =>
                {
                    options.AddDefaultPolicy(builder =>
                    {
                        builder.WithOrigins("http://localhost:5173", "https://localhost:7027")
                               .AllowAnyMethod()
                               .AllowAnyHeader()
                               .AllowCredentials();
                    });
                });

                // Configure OpenAPI/Swagger - standard configuration
                builder.Services.AddEndpointsApiExplorer();
                builder.Services.AddSwaggerGen();

                builder.Services.AddIdentity<User, Role>()
                    .AddEntityFrameworkStores<DataContext>()
                    .AddDefaultTokenProviders();

                builder.Services.Configure<IdentityOptions>(options =>
                {
                    // Password settings.
                    options.Password.RequireDigit = true;
                    options.Password.RequireLowercase = true;
                    options.Password.RequireNonAlphanumeric = true;
                    options.Password.RequireUppercase = true;
                    options.Password.RequiredLength = 6;
                    options.Password.RequiredUniqueChars = 1;

                    // Lockout settings.
                    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                    options.Lockout.MaxFailedAccessAttempts = 5;
                    options.Lockout.AllowedForNewUsers = true;

                    // User settings.
                    options.User.AllowedUserNameCharacters =
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                    options.User.RequireUniqueEmail = false;
                });

                builder.Services.ConfigureApplicationCookie(options =>
                {
                    // Cookie settings
                    options.Cookie.HttpOnly = true;
                    options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
                    options.Events.OnRedirectToLogin = context =>
                    {
                        context.Response.StatusCode = 401;
                        return Task.CompletedTask;
                    };

                    options.Events.OnRedirectToAccessDenied = context =>
                    {
                        context.Response.StatusCode = 403;
                        return Task.CompletedTask;
                    };

                    options.SlidingExpiration = true;
                });

                var app = builder.Build();

                // Configure the HTTP request pipeline.
                if (app.Environment.IsDevelopment())
                {
                    app.MapOpenApi();
                }

                //Swagger UI
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseHttpsRedirection();
                app.UseCors();
                app.UseAuthentication();
                app.UseRouting()
                   .UseAuthorization()
                   .UseEndpoints(x =>
                   {
                       x.MapControllers();
                   });
                app.UseStaticFiles();

                if (app.Environment.IsDevelopment())
                {
                    app.UseSpa(x =>
                    {
                        x.UseProxyToSpaDevelopmentServer("http://localhost:5173");
                    });
                }
                else
                {
                    app.MapFallbackToFile("/index.html");
                }

                // Initialize database and seed data
                using (var scope = app.Services.CreateScope())
                {
                    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                    try
                    {
                        var db = scope.ServiceProvider.GetRequiredService<DataContext>();
                        logger.LogInformation("Starting database migration...");
                        await db.Database.MigrateAsync();
                        logger.LogInformation("Database migration completed successfully");

                        logger.LogInformation("Starting data seeding...");
                        SeedTheaters.Initialize(scope.ServiceProvider);
                        await SeedRoles.Initialize(scope.ServiceProvider);
                        await SeedUsers.Initialize(scope.ServiceProvider);

                        // Initialize new seed data
                        SeedTheaterRooms.Initialize(scope.ServiceProvider);
                        SeedSeats.Initialize(scope.ServiceProvider);
                        SeedMovies.Initialize(scope.ServiceProvider);
                        SeedTheaterMovies.Initialize(scope.ServiceProvider);
                        SeedShowtimes.Initialize(scope.ServiceProvider);
                        SeedConcessions.Initialize(scope.ServiceProvider);
                        logger.LogInformation("Data seeding completed successfully");
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "An error occurred while migrating or seeding the database");
                        throw;
                    }
                }

                app.Run();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Application startup failed: {ex}");
                throw;
            }
        }
    }
}