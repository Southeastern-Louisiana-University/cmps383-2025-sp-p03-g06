using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Authorization;
using Selu383.SP25.P03.Api.Features.Users;
using Selu383.SP25.P03.Api.Services;

namespace Selu383.SP25.P03.Api
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

  // Add services to the container.
            builder.Services.AddDbContext<DataContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DataContext") ?? throw new InvalidOperationException("Connection string 'DataContext' not found.")));

            builder.Services.AddControllers();

            // Add memory cache
            builder.Services.AddMemoryCache(options =>
            {
                options.SizeLimit = 1024 * 1024 * 50; // 50MB limit
                options.ExpirationScanFrequency = TimeSpan.FromMinutes(5);
            });

            // Register services
            builder.Services.AddScoped<ICacheService, CacheService>();
            builder.Services.AddScoped<IEmailService, EmailService>();

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
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "Lions Den Cinemas API",
                    Version = "v1",
                    Description = "API for Lions Den Cinemas mobile app"
                });
            });

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

            //This is only for testing mobile in the browser for expo at port 8081
            // CORS: Only enabled during development for local testing (Expo Web, Vite)
            if (builder.Environment.IsDevelopment())
            {
                builder.Services.AddCors(options =>
                {
                    options.AddDefaultPolicy(policy =>
                    {
                        policy.WithOrigins(
                            "http://localhost:8081", // Expo Web
                            "http://localhost:5173"  // Vite (optional)
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                    });
                });
            }


            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Lions Den API v1");
                });
            }

            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<DataContext>();
                await db.Database.MigrateAsync();
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
            }

            // CORS for mobile app testing in the browser
            if (app.Environment.IsDevelopment())
            {
                app.UseCors(); // Only active in dev
            }

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

            app.Run();
        }
    }
}