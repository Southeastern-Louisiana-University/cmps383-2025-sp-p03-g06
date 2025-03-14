// Controllers/ConcessionItemsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Concessions;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/concession-items")]
    [ApiController]
    public class ConcessionItemsController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly DbSet<ConcessionItem> _items;
        private readonly DbSet<ConcessionCategory> _categories;

        public ConcessionItemsController(DataContext context)
        {
            _context = context;
            _items = context.Set<ConcessionItem>();
            _categories = context.Set<ConcessionCategory>();
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConcessionItemDTO>>> GetItems()
        {
            var items = await _items
                .Include(i => i.Category)
                .Select(i => new ConcessionItemDTO
                {
                    Id = i.Id,
                    Name = i.Name,
                    Description = i.Description ?? string.Empty,
                    Price = i.Price,
                    ImageUrl = i.ImageUrl ?? string.Empty,
                    CategoryId = i.CategoryId,
                    CategoryName = i.Category != null ? i.Category.Name : string.Empty,
                    IsAvailable = i.IsAvailable
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<ConcessionItemDTO>>> GetAvailableItems()
        {
            var items = await _items
                .Include(i => i.Category)
                .Where(i => i.IsAvailable)
                .Select(i => new ConcessionItemDTO
                {
                    Id = i.Id,
                    Name = i.Name,
                    Description = i.Description ?? string.Empty,
                    Price = i.Price,
                    ImageUrl = i.ImageUrl ?? string.Empty,
                    CategoryId = i.CategoryId,
                    CategoryName = i.Category != null ? i.Category.Name : string.Empty,
                    IsAvailable = i.IsAvailable
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<ConcessionItemDTO>>> GetItemsByCategory(int categoryId)
        {
            var category = await _categories.FindAsync(categoryId);
            if (category == null)
            {
                return NotFound("Category not found");
            }

            var items = await _items
                .Include(i => i.Category)
                .Where(i => i.CategoryId == categoryId && i.IsAvailable)
                .Select(i => new ConcessionItemDTO
                {
                    Id = i.Id,
                    Name = i.Name,
                    Description = i.Description ?? string.Empty,
                    Price = i.Price,
                    ImageUrl = i.ImageUrl ?? string.Empty,
                    CategoryId = i.CategoryId,
                    CategoryName = i.Category != null ? i.Category.Name : string.Empty,
                    IsAvailable = i.IsAvailable
                })
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ConcessionItemDTO>> GetItem(int id)
        {
            var item = await _items
                .Include(i => i.Category)
                .Where(i => i.Id == id)
                .Select(i => new ConcessionItemDTO
                {
                    Id = i.Id,
                    Name = i.Name,
                    Description = i.Description ?? string.Empty,
                    Price = i.Price,
                    ImageUrl = i.ImageUrl ?? string.Empty,
                    CategoryId = i.CategoryId,
                    CategoryName = i.Category != null ? i.Category.Name : string.Empty,
                    IsAvailable = i.IsAvailable
                })
                .FirstOrDefaultAsync();

            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }

        [HttpPost]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<ConcessionItemDTO>> CreateItem(ConcessionItemDTO itemDto)
        {
            if (string.IsNullOrWhiteSpace(itemDto.Name))
            {
                return BadRequest("Name is required");
            }

            var category = await _categories.FindAsync(itemDto.CategoryId);
            if (category == null)
            {
                return BadRequest("Category not found");
            }

            var item = new ConcessionItem
            {
                Name = itemDto.Name,
                Description = itemDto.Description,
                Price = itemDto.Price,
                ImageUrl = itemDto.ImageUrl,
                CategoryId = itemDto.CategoryId,
                IsAvailable = itemDto.IsAvailable
            };

            _items.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, new ConcessionItemDTO
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description ?? string.Empty,
                Price = item.Price,
                ImageUrl = item.ImageUrl ?? string.Empty,
                CategoryId = item.CategoryId,
                CategoryName = category.Name,
                IsAvailable = item.IsAvailable
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<ConcessionItemDTO>> UpdateItem(int id, ConcessionItemDTO itemDto)
        {
            if (id != itemDto.Id)
            {
                return BadRequest("ID mismatch");
            }

            var item = await _items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(itemDto.Name))
            {
                return BadRequest("Name is required");
            }

            var category = await _categories.FindAsync(itemDto.CategoryId);
            if (category == null)
            {
                return BadRequest("Category not found");
            }

            item.Name = itemDto.Name;
            item.Description = itemDto.Description;
            item.Price = itemDto.Price;
            item.ImageUrl = itemDto.ImageUrl;
            item.CategoryId = itemDto.CategoryId;
            item.IsAvailable = itemDto.IsAvailable;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ItemExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new ConcessionItemDTO
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description ?? string.Empty,
                Price = item.Price,
                ImageUrl = item.ImageUrl ?? string.Empty,
                CategoryId = item.CategoryId,
                CategoryName = category.Name,
                IsAvailable = item.IsAvailable
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            // Check if item is used in any orders
            var isUsedInOrders = await _context.OrderItems.AnyAsync(oi => oi.ConcessionItemId == id);
            if (isUsedInOrders)
            {
                // Instead of deleting, just mark as unavailable
                item.IsAvailable = false;
            }
            else
            {
                _items.Remove(item);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ItemExists(int id)
        {
            return _items.Any(e => e.Id == id);
        }
    }
}