using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using UniLiving.DataContext;
using UniLiving.DataContext.DTOs;
using UniLiving.DataContext.Entities;

namespace UniLiving.Services.Services
{
    public interface IPropertyService
    {
        Task<PropertyDto> CreatePropertyAsync(PropertyDto propertyDto);
        Task<PropertyDto> UpdatePropertyAsync(int id, PropertyDto propertyDto);
        Task<bool> DeletePropertyAsync(int id);
        Task<PropertyDto?> GetPropertyByIdAsync(int id);
        Task<IEnumerable<PropertyDto>> GetAllPropertiesAsync();
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

        public async Task<PropertyDto> CreatePropertyAsync(PropertyDto propertyDto)
        {
            // Validate category exists
            var category = await _context.PropertyCategories
                .FirstOrDefaultAsync(pc => pc.Id == propertyDto.CategoryId);

            if (category == null)
                throw new KeyNotFoundException($"Property category with ID {propertyDto.CategoryId} not found");

            var property = _mapper.Map<Property>(propertyDto);
            property.CreatedAt = DateTime.UtcNow;
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
                .FirstOrDefaultAsync(p => p.Id == id);

            return _mapper.Map<PropertyDto?>(property);
        }

        public async Task<IEnumerable<PropertyDto>> GetAllPropertiesAsync()
        {
            var properties = await _context.Properties
                .Include(p => p.Category)
                .Include(p => p.Owner)
                .ToListAsync();

            return _mapper.Map<IEnumerable<PropertyDto>>(properties);
        }
    }
}
