using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using UniLiving.DataContext;
using UniLiving.DataContext.DTOs;
using UniLiving.DataContext.Entities;

namespace UniLiving.Services.Services
{
    public interface IPropertyService
    {
        Task<PropertyDto> CreatePropertyAsync(PropertyDto propertyDto, IHttpContextAccessor httpContextAccessor);
        Task<PropertyDto> UpdatePropertyAsync(int id, PropertyDto propertyDto);
        Task<bool> DeletePropertyAsync(int id);
        Task<PropertyDto?> GetPropertyByIdAsync(int id);
        Task<IEnumerable<PropertyDto>> GetAllPropertiesAsync();
        Task<PagedResult<ListingDto>> GetPropertiesAsync(PropertyFilterDto filter);
    }

    public class PropertyService : IPropertyService
    {
        private readonly UniDBContext _context;
        private readonly IMapper _mapper;

        public PropertyService(UniDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<PropertyDto> CreatePropertyAsync(PropertyDto propertyDto, IHttpContextAccessor httpContextAccessor)
        {
            // Validate category exists
            var category = await _context.PropertyCategories
                .FirstOrDefaultAsync(pc => pc.Id == propertyDto.CategoryId);

            if (category == null)
                throw new KeyNotFoundException($"Property category with ID {propertyDto.CategoryId} not found");

            // Get the current user ID from the JWT token
            var userIdClaim = httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int ownerId))
                throw new UnauthorizedAccessException("User ID not found in token");

            // Verify the user exists
            var user = await _context.Users.FindAsync(ownerId);
            if (user == null)
                throw new KeyNotFoundException($"User with ID {ownerId} not found");

            var property = _mapper.Map<Property>(propertyDto);
            property.OwnerId = ownerId;
            property.CreatedAt = DateTime.UtcNow;
            property.UpdatedAt = DateTime.UtcNow;
            property.IsActive = true;
            property.IsApproved = false;

            _context.Properties.Add(property);
            await _context.SaveChangesAsync();

            return _mapper.Map<PropertyDto>(property);
        }

        public async Task<PropertyDto> UpdatePropertyAsync(int id, PropertyDto propertyDto)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null)
                throw new KeyNotFoundException("Property not found");

            // Validate category exists if it's being changed
            if (property.CategoryId != propertyDto.CategoryId)
            {
                var category = await _context.PropertyCategories
                    .FirstOrDefaultAsync(pc => pc.Id == propertyDto.CategoryId);

                if (category == null)
                    throw new KeyNotFoundException($"Property category with ID {propertyDto.CategoryId} not found");
            }

            _mapper.Map(propertyDto, property);
            property.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return _mapper.Map<PropertyDto>(property);
        }

        public async Task<bool> DeletePropertyAsync(int id)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null)
                return false;

            _context.Properties.Remove(property);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<PropertyDto?> GetPropertyByIdAsync(int id)
        {
            var property = await _context.Properties
                .Include(p => p.Category)
                .Include(p => p.Owner)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            return _mapper.Map<PropertyDto?>(property);
        }

        public async Task<IEnumerable<PropertyDto>> GetAllPropertiesAsync()
        {
            var properties = await _context.Properties
                .Include(p => p.Category)
                .Include(p => p.Owner)
                .Include(p => p.Images)
                .ToListAsync();

            return _mapper.Map<IEnumerable<PropertyDto>>(properties);
        }
        public async Task<PagedResult<ListingDto>> GetPropertiesAsync(PropertyFilterDto filter)
        {
            var query = _context.Properties.AsQueryable();

            // Szűrés (Filtering)
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTermLower = filter.SearchTerm.ToLower();
                query = query.Where(p =>
                    p.Title.ToLower().Contains(searchTermLower) ||
                    (p.Description != null && p.Description.ToLower().Contains(searchTermLower)));
            }

            if (filter.CategoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == filter.CategoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.City))
            {
                query = query.Where(p => p.City.ToLower() == filter.City.ToLower());
            }

            if (filter.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= filter.MaxPrice.Value);
            }

            if (filter.MinSize.HasValue)
            {
                query = query.Where(p => p.Size >= (decimal)filter.MinSize.Value);
            }

            if (filter.MaxSize.HasValue)
            {
                query = query.Where(p => p.Size <= (decimal)filter.MaxSize.Value);
            }

            if (filter.MinRoomCount.HasValue)
            {
                query = query.Where(p => p.RoomCount >= filter.MinRoomCount.Value);
            }

            if (filter.MaxRoomCount.HasValue)
            {
                query = query.Where(p => p.RoomCount <= filter.MaxRoomCount.Value);
            }

            if (filter.HasBalcony.HasValue)
            {
                query = query.Where(p => p.HasBalcony == filter.HasBalcony.Value);
            }

            if (filter.HasParking.HasValue)
            {
                query = query.Where(p => p.HasParking == filter.HasParking.Value);
            }

            if (filter.HasElevator.HasValue)
            {
                query = query.Where(p => p.HasElevator == filter.HasElevator.Value);
            }

            if (filter.PetsAllowed.HasValue)
            {
                query = query.Where(p => p.PetsAllowed == filter.PetsAllowed.Value);
            }

            if (filter.SmokingAllowed.HasValue)
            {
                query = query.Where(p => p.SmokingAllowed == filter.SmokingAllowed.Value);
            }


            // Rendezés (Sorting)
            // Alapértelmezett rendezés, ha nincs megadva
            if (string.IsNullOrWhiteSpace(filter.SortBy))
            {
                query = query.OrderByDescending(p => p.CreatedAt);
            }
            else
            {
                // Egyszerűsített rendezés, ezt lehet bővíteni
                var isDescending = filter.SortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);
                query = filter.SortBy.ToLower() switch
                {
                    "price" => isDescending ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
                    "date" => isDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt),
                    _ => query.OrderByDescending(p => p.CreatedAt)
                };
            }

            // Teljes találatok száma (lapozás előtt kell)
            var totalCount = await query.CountAsync();

            // Lapozás (Pagination)
            query = query.Skip((filter.PageNumber - 1) * filter.PageSize).Take(filter.PageSize);

            // Leképezés DTO-ra
            var items = await query
                .ProjectTo<ListingDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return new PagedResult<ListingDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageSize = filter.PageSize,
                CurrentPage = filter.PageNumber
            };
        }

    }
}
