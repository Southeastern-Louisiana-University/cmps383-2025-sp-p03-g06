using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Showtimes;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/showtimes")]
    [ApiController]
    public class ShowtimesController : ControllerBase
    {
        private readonly DataContext _context;

        public ShowtimesController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShowtimeDto>>> GetShowtimes()
        {
            var showtimes = await _context.Showtimes
                .Include(s => s.Movie)  //fetches the movie and theater
                .Include(s => s.Theater)  
                .Select(s => new ShowtimeDto
                {
                    Id = s.Id,
                    MovieId = s.MovieId,
                    MovieTitle = s.Movie.Title,  
                    TheaterId = s.TheaterId,
                    TheaterName = s.Theater.Name,  
                    ShowtimeTime = s.ShowtimeTime
                })
                .ToListAsync();

            return Ok(showtimes);
        }
    }
}
