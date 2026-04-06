using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UniLiving.DataContext;
using UniLiving.DataContext.DTOs;
using UniLiving.DataContext.Entities;

namespace UniLiving.Services.Services
{
    public class SearchPreferenceService
    {
        private readonly UniDBContext _context;
        private readonly IMapper _mapper;

        public SearchPreferenceService(UniDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<SearchPreferenceDto>> GetUserPreferencesAsync(int userId)
        {
            var preferences = await _context.SearchPreferences
                .Where(p => p.UserId == userId)
                .ToListAsync();

            return _mapper.Map<List<SearchPreferenceDto>>(preferences);
        }

        public async Task<SearchPreferenceDto> CreatePreferenceAsync(int userId, SearchPreferenceDto dto)
        {
            var preference = _mapper.Map<SearchPreference>(dto);
            preference.UserId = userId;
            
            _context.SearchPreferences.Add(preference);
            await _context.SaveChangesAsync();

            return _mapper.Map<SearchPreferenceDto>(preference);
        }

        public async Task<bool> DeletePreferenceAsync(int id, int userId)
        {
            var preference = await _context.SearchPreferences
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (preference == null)
                return false;

            _context.SearchPreferences.Remove(preference);
            await _context.SaveChangesAsync();
            return true;
        }

        // Method to find matching user preferences for a new property
        public async Task<List<int>> GetMatchingUserIdsAsync(Property property)
        {
            var preferences = await _context.SearchPreferences.ToListAsync();
            var matchedUserIds = new List<int>();

            foreach(var pref in preferences)
            {
                if (property.OwnerId == pref.UserId) continue; // Don't notify the creator

                bool isMatch = true;

                if (pref.MinPrice.HasValue && (decimal)property.Price < pref.MinPrice.Value) isMatch = false;
                if (pref.MaxPrice.HasValue && (decimal)property.Price > pref.MaxPrice.Value) isMatch = false;
                if (pref.MinSize.HasValue && (decimal)property.Size < pref.MinSize.Value) isMatch = false;
                if (pref.MaxSize.HasValue && (decimal)property.Size > pref.MaxSize.Value) isMatch = false;
                
                if (!string.IsNullOrEmpty(pref.Cities) && !string.IsNullOrEmpty(property.City))
                {
                    // Basic city match
                    if (!pref.Cities.Contains(property.City, System.StringComparison.OrdinalIgnoreCase)) 
                        isMatch = false;
                }

                if (isMatch)
                {
                    matchedUserIds.Add(pref.UserId);
                }
            }

            return matchedUserIds.Distinct().ToList();
        }
    }
}
