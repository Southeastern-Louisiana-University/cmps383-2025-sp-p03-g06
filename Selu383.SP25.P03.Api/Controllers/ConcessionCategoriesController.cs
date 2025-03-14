// Controllers/ConcessionCategoriesController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Concessions;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/concession-categories")]
    [ApiController]
    public class ConcessionCategoriesController(DataContext context) : ControllerBase
    {
        private readonly DataContext _context = context;
        private readonly DbSet<ConcessionCategory> _categories = context.Set<ConcessionCategory>();

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConcessionCategoryDTO>>> GetCategories()
        {
            var categories = await _categories
                .Select(c => new ConcessionCategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ConcessionCategoryDTO>> GetCategory(int id)
        {
            var category = await _categories
                .Where(c => c.Id == id)
                .Select(c => new ConcessionCategoryDTO
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .FirstOrDefaultAsync();

            if (category == null)
            {
                return NotFound();
            }

            return Ok(category);
        }

        [HttpPost]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<ConcessionCategoryDTO>> CreateCategory(ConcessionCategoryDTO categoryDto)
        {
            if (string.IsNullOrWhiteSpace(categoryDto.Name))
            {
                return BadRequest("Name is required");
            }

            if (await _categories.AnyAsync(c => c.Name == categoryDto.Name))
            {
                return BadRequest("Category with this name already exists");
            }

            var category = new ConcessionCategory
            {
                Name = categoryDto.Name
            };

            _categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, new ConcessionCategoryDTO
            {
                Id = category.Id,
                Name = category.Name
            });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<ConcessionCategoryDTO>> UpdateCategory(int id, ConcessionCategoryDTO categoryDto)
        {
            if (id != categoryDto.Id)
            {
                return BadRequest("ID mismatch");
            }

            if (string.IsNullOrWhiteSpace(categoryDto.Name))
            {
                return BadRequest("Name is required");
            }

            var category = await _categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            if (await _categories.AnyAsync(c => c.Name == categoryDto.Name && c.Id != id))
            {
                return BadRequest("Category with this name already exists");
            }

            category.Name = categoryDto.Name;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new ConcessionCategoryDTO
            {
                Id = category.Id,
                Name = category.Name
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            var hasItems = await _context.ConcessionItems.AnyAsync(i => i.CategoryId == id);
            if (hasItems)
            {
                return BadRequest("Cannot delete a category that contains items");
            }

            _categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CategoryExists(int id)
        {
            return _categories.Any(e => e.Id == id);
        }
    }
}