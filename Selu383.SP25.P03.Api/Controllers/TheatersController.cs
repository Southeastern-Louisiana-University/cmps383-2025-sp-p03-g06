// Controllers/TheatersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Theaters;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/theaters")]
    [ApiController]
    public class TheatersController(DataContext dataContext, UserManager<User> userManager) : ControllerBase
    {
        private readonly DbSet<Theater> theaters = dataContext.Set<Theater>();
        private readonly DataContext dataContext = dataContext;
        private readonly DbSet<User> users = dataContext.Set<User>();
        private readonly UserManager<User> userManager = userManager;

        [HttpGet]
        public IQueryable<TheaterDto> GetAllTheaters()
        {
            return GetTheaterDtos(theaters);
        }

        [HttpGet]
        [Route("{id}")]
        public ActionResult<TheaterDto> GetTheaterById(int id)
        {
            var result = GetTheaterDtos(theaters.Where(x => x.Id == id)).FirstOrDefault();
            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = UserRoleNames.Admin)]
        public ActionResult<TheaterDto> CreateTheater(TheaterDto dto)
        {
            if (IsInvalid(dto))
            {
                return BadRequest();
            }

            var theater = new Theater
            {
                Name = dto.Name,
                Address = dto.Address,
                SeatCount = dto.SeatCount,
                ManagerId = dto.ManagerId
            };
            theaters.Add(theater);

            dataContext.SaveChanges();

            dto.Id = theater.Id;

            return CreatedAtAction(nameof(GetTheaterById), new { id = dto.Id }, dto);
        }

        [HttpPut]
        [Route("{id}")]
        [Authorize]
        public async Task<ActionResult<TheaterDto>> UpdateTheater(int id, TheaterDto dto)
        {
            if (dto == null || IsInvalid(dto))
            {
                return BadRequest("Invalid theater data");
            }

            var currentUser = await userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return BadRequest("User not found");
            }

            bool isManager = dto.ManagerId.HasValue && currentUser.Id == dto.ManagerId.Value;
            if (!User.IsInRole(UserRoleNames.Admin) && !isManager)
            {
                return Forbid();
            }

            var theater = theaters.FirstOrDefault(x => x.Id == id);
            if (theater == null)
            {
                return NotFound();
            }

            theater.Name = dto.Name;
            theater.Address = dto.Address;
            theater.SeatCount = dto.SeatCount;

            if (User.IsInRole(UserRoleNames.Admin))
            {
                theater.ManagerId = dto.ManagerId;
            }

            dataContext.SaveChanges();

            dto.Id = theater.Id;
            dto.ManagerId = theater.ManagerId;

            return Ok(dto);
        }

        [HttpDelete]
        [Route("{id}")]
        [Authorize(Roles = UserRoleNames.Admin)]
        public ActionResult DeleteTheater(int id)
        {
            var theater = theaters.FirstOrDefault(x => x.Id == id);
            if (theater == null)
            {
                return NotFound();
            }

            theaters.Remove(theater);

            dataContext.SaveChanges();

            return Ok();
        }

        private bool IsInvalid(TheaterDto dto)
        {
            return string.IsNullOrWhiteSpace(dto.Name) ||
                   dto.Name.Length > 120 ||
                   string.IsNullOrWhiteSpace(dto.Address) ||
                   dto.SeatCount <= 0 ||
                   dto.ManagerId != null && !users.Any(x => x.Id == dto.ManagerId);
        }

        private static IQueryable<TheaterDto> GetTheaterDtos(IQueryable<Theater> theaters)
        {
            return theaters
                .Select(x => new TheaterDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Address = x.Address,
                    SeatCount = x.SeatCount,
                    ManagerId = x.ManagerId
                });
        }
    }
}