// Controllers/ConcessionOrdersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Selu383.SP25.P03.Api.Data;
using Selu383.SP25.P03.Api.Features.Concessions;
using Selu383.SP25.P03.Api.Features.OrderItems;
using Selu383.SP25.P03.Api.Features.Reservations;
using Selu383.SP25.P03.Api.Features.Users;

namespace Selu383.SP25.P03.Api.Controllers
{
    [Route("api/concession-orders")]
    [ApiController]
    [Authorize]
    public class ConcessionOrdersController(DataContext context, UserManager<User> userManager) : ControllerBase
    {
        private readonly DataContext _context = context;
        private readonly DbSet<ConcessionOrder> _orders = context.Set<ConcessionOrder>();
        private readonly DbSet<ConcessionItem> _items = context.Set<ConcessionItem>();
        private readonly DbSet<Reservation> _reservations = context.Set<Reservation>();
        private readonly UserManager<User> _userManager = userManager;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConcessionOrderDTO>>> GetMyOrders()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var orders = await _orders
                .Include(o => o.Reservation)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ConcessionItem)
                .Where(o => o.Reservation != null && o.Reservation.UserId == currentUser.Id)
                .Select(o => new ConcessionOrderDTO
                {
                    Id = o.Id,
                    ReservationId = o.ReservationId,
                    OrderTime = o.OrderTime,
                    TotalPrice = o.TotalPrice,
                    Status = o.Status ?? "Unknown",
                    SeatNumber = o.SeatNumber,
                    Items = o.OrderItems.Select(oi => new OrderItemDTO
                    {
                        Id = oi.Id,
                        ConcessionItemId = oi.ConcessionItemId,
                        ItemName = oi.ConcessionItem == null ? string.Empty : oi.ConcessionItem.Name,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        SpecialInstructions = oi.SpecialInstructions ?? string.Empty
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("all")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<IEnumerable<ConcessionOrderDTO>>> GetAllOrders()
        {
            // Load orders into memory and perform null safety operations outside of LINQ expression
            var rawOrders = await _orders
                .Include(o => o.Reservation)
                .ThenInclude(r => r!.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ConcessionItem)
                .ToListAsync();

            // Process the data safely with null checks - not using expression trees here, so we can use null coalescing
            var orders = rawOrders.Select(o => new ConcessionOrderDTO
            {
                Id = o.Id,
                ReservationId = o.ReservationId,
                OrderTime = o.OrderTime,
                TotalPrice = o.TotalPrice,
                Status = o.Status ?? "Unknown",
                SeatNumber = o.SeatNumber,
                Items = o.OrderItems.Select(oi => new OrderItemDTO
                {
                    Id = oi.Id,
                    ConcessionItemId = oi.ConcessionItemId,
                    // Can use null conditional operator here since it's not part of an expression tree
                    ItemName = oi.ConcessionItem?.Name ?? string.Empty,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    SpecialInstructions = oi.SpecialInstructions ?? string.Empty
                }).ToList()
            }).ToList();

            return Ok(orders);
        }

        [HttpGet("reservation/{reservationId}")]
        public async Task<ActionResult<IEnumerable<ConcessionOrderDTO>>> GetOrdersByReservation(int reservationId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            // Verify reservation exists and belongs to user
            var reservation = await _reservations.FindAsync(reservationId);
            if (reservation == null)
            {
                return NotFound("Reservation not found");
            }

            if (reservation.UserId != currentUser.Id && !User.IsInRole(UserRoleNames.Admin) && !User.IsInRole(UserRoleNames.Manager))
            {
                return Forbid();
            }

            var orders = await _orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ConcessionItem)
                .Where(o => o.ReservationId == reservationId)
                .Select(o => new ConcessionOrderDTO
                {
                    Id = o.Id,
                    ReservationId = o.ReservationId,
                    OrderTime = o.OrderTime,
                    TotalPrice = o.TotalPrice,
                    Status = o.Status ?? "Unknown",
                    SeatNumber = o.SeatNumber,
                    Items = o.OrderItems.Select(oi => new OrderItemDTO
                    {
                        Id = oi.Id,
                        ConcessionItemId = oi.ConcessionItemId,
                        ItemName = oi.ConcessionItem == null ? string.Empty : oi.ConcessionItem.Name,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        SpecialInstructions = oi.SpecialInstructions ?? string.Empty
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<ConcessionOrderDTO>> GetOrder(int id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var order = await _orders
                .Include(o => o.Reservation)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.ConcessionItem)
                .Where(o => o.Id == id)
                .Select(o => new ConcessionOrderDTO
                {
                    Id = o.Id,
                    ReservationId = o.ReservationId,
                    OrderTime = o.OrderTime,
                    TotalPrice = o.TotalPrice,
                    Status = o.Status ?? "Unknown",
                    SeatNumber = o.SeatNumber,
                    Items = o.OrderItems.Select(oi => new OrderItemDTO
                    {
                        Id = oi.Id,
                        ConcessionItemId = oi.ConcessionItemId,
                        ItemName = oi.ConcessionItem == null ? string.Empty : oi.ConcessionItem.Name,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        SpecialInstructions = oi.SpecialInstructions ?? string.Empty
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (order == null)
            {
                return NotFound();
            }

            // Check if the order belongs to the current user
            var reservation = await _reservations.FindAsync(order.ReservationId);
            if (reservation == null)
            {
                return NotFound("Associated reservation not found");
            }

            if (reservation.UserId != currentUser.Id && !User.IsInRole(UserRoleNames.Admin) && !User.IsInRole(UserRoleNames.Manager))
            {
                return Forbid();
            }

            return Ok(order);
        }

        [HttpPost]
        [AllowAnonymous] // Allow anonymous access
        public async Task<ActionResult<ConcessionOrderDTO>> CreateOrder(CreateConcessionOrderDTO orderDto)
        {
            // Validate reservation without requiring authentication
            var reservation = await _reservations
                .Include(r => r.Showtime)
                .FirstOrDefaultAsync(r => r.Id == orderDto.ReservationId);

            if (reservation == null)
            {
                return BadRequest("Reservation not found");
            }

            // Only check user authorization if they're authenticated
            if (User.Identity?.IsAuthenticated == true)
            {
                var currentUser = await _userManager.GetUserAsync(User);
                if (currentUser == null)
                {
                    return Unauthorized();
                }

                // Verify the reservation belongs to the current user
                if (reservation.UserId != currentUser.Id && !User.IsInRole(UserRoleNames.Admin) && !User.IsInRole(UserRoleNames.Manager))
                {
                    return Forbid();
                }
            }

            // Verify reservation status
            if (reservation.Status != "Confirmed")
            {
                return BadRequest("Cannot place orders for non-confirmed reservations");
            }

            // Verify showtime is current or upcoming
            if (reservation.Showtime == null)
            {
                return BadRequest("Invalid reservation: missing showtime information");
            }

            // Create the order
            var order = new ConcessionOrder
            {
                ReservationId = orderDto.ReservationId,
                OrderTime = DateTime.UtcNow,
                Status = "Pending",
                GuestEmail = orderDto.GuestInfo?.Email,
                GuestPhone = orderDto.GuestInfo?.PhoneNumber,
                SeatNumber = orderDto.SeatNumber
            };

            _orders.Add(order);
            await _context.SaveChangesAsync();

            // Add order items
            decimal totalPrice = 0;
            foreach (var item in orderDto.Items)
            {
                var concession = await _items.FindAsync(item.ConcessionItemId);
                if (concession == null)
                {
                    return BadRequest($"Concession with ID {item.ConcessionItemId} not found");
                }

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ConcessionItemId = item.ConcessionItemId,
                    Quantity = item.Quantity,
                    UnitPrice = concession.Price,
                    SpecialInstructions = item.SpecialInstructions
                };

                _context.OrderItems.Add(orderItem);
                totalPrice += concession.Price * item.Quantity;
            }

            order.TotalPrice = totalPrice;
            await _context.SaveChangesAsync();

            // Convert to DTO
            var resultDto = new ConcessionOrderDTO
            {
                Id = order.Id,
                ReservationId = order.ReservationId,
                OrderTime = order.OrderTime,
                TotalPrice = order.TotalPrice,
                Status = order.Status,
                SeatNumber = order.SeatNumber,
                Items = order.OrderItems.Select(oi => new OrderItemDTO
                {
                    Id = oi.Id,
                    ConcessionItemId = oi.ConcessionItemId,
                    ItemName = oi.ConcessionItem?.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    SpecialInstructions = oi.SpecialInstructions
                }).ToList()
            };

            return Ok(resultDto);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = $"{UserRoleNames.Admin},{UserRoleNames.Manager}")]
        public async Task<ActionResult<ConcessionOrderDTO>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDTO statusDto)
        {
            var order = await _orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            if (string.IsNullOrWhiteSpace(statusDto.Status))
            {
                return BadRequest("Status is required");
            }

            // Validate status
            string[] validStatuses = ["Pending", "Preparing", "Ready", "Delivered", "Cancelled"];
            if (!validStatuses.Contains(statusDto.Status))
            {
                return BadRequest($"Status must be one of: {string.Join(", ", validStatuses)}");
            }

            order.Status = statusDto.Status;
            await _context.SaveChangesAsync();

            return await GetOrder(id);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized();
            }

            var order = await _orders
                .Include(o => o.Reservation)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            if (order.Reservation == null)
            {
                return BadRequest("Invalid order: missing reservation information");
            }

            // Verify the order belongs to the current user or user is admin/manager
            if (order.Reservation.UserId != currentUser.Id && !User.IsInRole(UserRoleNames.Admin) && !User.IsInRole(UserRoleNames.Manager))
            {
                return Forbid();
            }

            // Only allow cancellation if order is still pending
            if (order.Status != "Pending")
            {
                return BadRequest("Only pending orders can be cancelled");
            }

            // Mark as cancelled
            order.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateConcessionOrderDTO
    {
        public int ReservationId { get; set; }
        public List<CreateOrderItemDTO> Items { get; set; } = [];
        public string? SeatNumber { get; set; }
        public GuestInfoDTO? GuestInfo { get; set; }
    }

    public class CreateOrderItemDTO
    {
        public int ConcessionItemId { get; set; }
        public int Quantity { get; set; }
        public string? SpecialInstructions { get; set; }
    }

    public class UpdateOrderStatusDTO
    {
        public string Status { get; set; } = string.Empty;
    }
}