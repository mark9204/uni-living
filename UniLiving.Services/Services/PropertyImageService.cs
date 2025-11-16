using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UniLiving.DataContext;
using UniLiving.DataContext.DTOs;
using UniLiving.DataContext.Entities;

namespace UniLiving.Services.Services
{
    public interface IPropertyImageService
    {
        Task<PropertyImageDto> AddPropertyImageAsync(int propertyId, string filePath, string fileName, long fileSize, string mimeType, bool isMainImage = false);
        Task<bool> DeletePropertyImageAsync(int imageId);
        Task<IEnumerable<PropertyImageDto>> GetPropertyImagesAsync(int propertyId);
        Task<PropertyImageDto?> GetPropertyImageByIdAsync(int imageId);
        Task<bool> SetMainImageAsync(int propertyId, int imageId);
    }

    public class PropertyImageService : IPropertyImageService
    {
        private readonly UniDBContext _context;
        private readonly IMapper _mapper;

        public PropertyImageService(UniDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<PropertyImageDto> AddPropertyImageAsync(int propertyId, string filePath, string fileName, long fileSize, string mimeType, bool isMainImage = false)
        {
            // Verify property exists
            var property = await _context.Properties.FindAsync(propertyId);
            if (property == null)
                throw new KeyNotFoundException($"Property with ID {propertyId} not found");

            // If this is main image, unset other main images
            if (isMainImage)
            {
                var mainImages = await _context.PropertyImages
                    .Where(pi => pi.PropertyId == propertyId && pi.IsMainImage)
                    .ToListAsync();

                foreach (var img in mainImages)
                {
                    img.IsMainImage = false;
                }
            }

            var propertyImage = new PropertyImage
            {
                PropertyId = propertyId,
                FileName = fileName,
                FilePath = filePath,
                FileSize = fileSize,
                MimeType = mimeType,
                IsMainImage = isMainImage,
                DisplayOrder = 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.PropertyImages.Add(propertyImage);
            await _context.SaveChangesAsync();

            return _mapper.Map<PropertyImageDto>(propertyImage);
        }

        public async Task<bool> DeletePropertyImageAsync(int imageId)
        {
            var image = await _context.PropertyImages.FindAsync(imageId);
            if (image == null)
                return false;

            _context.PropertyImages.Remove(image);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<PropertyImageDto>> GetPropertyImagesAsync(int propertyId)
        {
            var images = await _context.PropertyImages
                .Where(pi => pi.PropertyId == propertyId)
                .OrderByDescending(pi => pi.IsMainImage)
                .ThenBy(pi => pi.DisplayOrder)
                .ToListAsync();

            return _mapper.Map<IEnumerable<PropertyImageDto>>(images);
        }

        public async Task<PropertyImageDto?> GetPropertyImageByIdAsync(int imageId)
        {
            var image = await _context.PropertyImages.FindAsync(imageId);
            return _mapper.Map<PropertyImageDto?>(image);
        }

        public async Task<bool> SetMainImageAsync(int propertyId, int imageId)
        {
            var image = await _context.PropertyImages
                .FirstOrDefaultAsync(pi => pi.Id == imageId && pi.PropertyId == propertyId);

            if (image == null)
                return false;

            // Unset other main images
            var mainImages = await _context.PropertyImages
                .Where(pi => pi.PropertyId == propertyId && pi.IsMainImage)
                .ToListAsync();

            foreach (var img in mainImages)
            {
                img.IsMainImage = false;
            }

            image.IsMainImage = true;
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
