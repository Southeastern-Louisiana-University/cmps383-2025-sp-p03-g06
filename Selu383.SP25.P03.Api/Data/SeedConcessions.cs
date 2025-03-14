// Data/SeedConcessions.cs
// Data/SeedConcessions.cs
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Features.Concessions;

namespace Selu383.SP25.P03.Api.Data
{
    public static class SeedConcessions
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var context = new DataContext(serviceProvider.GetRequiredService<DbContextOptions<DataContext>>());

            // Check if any concession categories already exist
            if (context.ConcessionCategories.Any())
            {
                return;   // DB has been seeded
            }

            // Add categories first and save immediately to get their IDs
            var categories = new List<ConcessionCategory>
    {
        new() { Name = "Snacks" },
        new() { Name = "Beverages" },
        new() { Name = "Combo Deals" },
        new() { Name = "Desserts" }
    };

            context.ConcessionCategories.AddRange(categories);
            context.SaveChanges();

            // Get the categories with their assigned IDs
            var snacksCategory = context.ConcessionCategories.Single(c => c.Name == "Snacks");
            var beveragesCategory = context.ConcessionCategories.Single(c => c.Name == "Beverages");
            var comboDealsCategory = context.ConcessionCategories.Single(c => c.Name == "Combo Deals");
            var dessertsCategory = context.ConcessionCategories.Single(c => c.Name == "Desserts");

            // Add concession items
            var items = new List<ConcessionItem>
    {
        // Snacks
        new()
        {
            Name = "Small Popcorn",
            Description = "Freshly popped popcorn, small size",
            Price = 5.99m,
            CategoryId = snacksCategory.Id,  // Use the actual ID
            IsAvailable = true
        },
        new()
        {
            Name = "Large Popcorn",
            Description = "Freshly popped popcorn, large size with free refill",
            Price = 8.99m,
            CategoryId = snacksCategory.Id,  // Use the actual ID
            IsAvailable = true
        },
        new()
        {
            Name = "Nachos",
            Description = "Crispy nachos with cheese sauce",
            Price = 6.99m,
            CategoryId = snacksCategory.Id,  // Use the actual ID
            IsAvailable = true
        },
        new()
        {
            Name = "Hot Dog",
            Description = "Classic hot dog with your choice of condiments",
            Price = 7.49m,
            CategoryId = snacksCategory.Id,  // Use the actual ID
            IsAvailable = true
        },

        // Beverages
        new()
        {
            Name = "Small Soda",
            Description = "Small fountain drink, your choice of flavor",
            Price = 4.49m,
            CategoryId = beveragesCategory.Id,  // Use the actual ID
            IsAvailable = true
        },
        new()
        {
            Name = "Large Soda",
            Description = "Large fountain drink with free refill",
            Price = 6.49m,
            CategoryId = beveragesCategory.Id,  // Use the actual ID
            IsAvailable = true
        },
        new()
        {
            Name = "Bottled Water",
            Description = "16oz bottled water",
            Price = 3.99m,
            CategoryId = beveragesCategory.Id,  // Use the actual ID
            IsAvailable = true
        },
        new()
        {
            Name = "Coffee",
            Description = "Freshly brewed coffee",
            Price = 4.99m,
            CategoryId = beveragesCategory.Id,  // Use the actual ID
            IsAvailable = true
        },

        // Combo Deals
        new()
        {
            Name = "Popcorn & Soda Combo",
            Description = "Large popcorn and large soda with free refills",
            Price = 13.99m,
            CategoryId = comboDealsCategory.Id,  // Use the actual ID
            IsAvailable = true
        },
        new()
        {
            Name = "Family Pack",
            Description = "2 large popcorns, 4 large sodas, and 2 candy items",
            Price = 29.99m,
            CategoryId = comboDealsCategory.Id,  // Use the actual ID
            IsAvailable = true
        },
        new()
        {
            Name = "Hot Dog Combo",
            Description = "Hot dog, small popcorn, and small soda",
            Price = 15.99m,
            CategoryId = comboDealsCategory.Id,  // Use the actual ID
            IsAvailable = true
        },

        // Desserts
        new()
        {
            Name = "Chocolate Bar",
            Description = "Classic chocolate bar",
            Price = 3.99m,
            CategoryId = dessertsCategory.Id,  // Use the actual ID
            IsAvailable = true
        },
        new()
        {
            Name = "Ice Cream",
            Description = "Premium vanilla ice cream cup",
            Price = 5.99m,
            CategoryId = dessertsCategory.Id,  // Use the actual ID
            IsAvailable = true
        },
        new()
        {
            Name = "Cookie",
            Description = "Freshly baked chocolate chip cookie",
            Price = 3.49m,
            CategoryId = dessertsCategory.Id,  // Use the actual ID
            IsAvailable = true
        },
        new()
        {
            Name = "Candy Pack",
            Description = "Assorted movie theater candy",
            Price = 4.99m,
            CategoryId = dessertsCategory.Id,  // Use the actual ID
            IsAvailable = true
        }
    };

            context.ConcessionItems.AddRange(items);
            context.SaveChanges();
        }
    }
}