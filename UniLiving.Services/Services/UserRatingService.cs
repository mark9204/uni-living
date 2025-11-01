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
    public interface IUserRatingService
    {
        Task<IEnumerable<UserRatingDto>> GetAllUserRatingsAsync();
        Task<UserRatingDto?> GetUserRatingByIdAsync(int id);
        Task<UserRatingDto> CreateUserRatingAsync(UserRatingDto userRatingDto);
        Task<UserRatingDto> UpdateUserRatingAsync(int id, UserRatingDto userRatingDto);
        Task<bool> DeleteUserRatingAsync(int id);
    }

    public class UserRatingService : IUserRatingService
    {
        private readonly UniDBContext _context;
        private readonly IMapper _mapper;

        public UserRatingService(UniDBContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<UserRatingDto> CreateUserRatingAsync(UserRatingDto userRatingDto)
        {
            var entity = _mapper.Map<UserRating>(userRatingDto);
            entity.CreatedAt = DateTime.UtcNow;

            _context.UserRatings.Add(entity);
            await _context.SaveChangesAsync();

            return _mapper.Map<UserRatingDto>(entity);
        }

        public async Task<bool> DeleteUserRatingAsync(int id)
        {
            var entity = await _context.UserRatings.FindAsync(id);
            if (entity == null)
                return false;

            _context.UserRatings.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<UserRatingDto>> GetAllUserRatingsAsync()
        {
            var list = await _context.UserRatings
                .Include(ur => ur.RatedUser)
                .Include(ur => ur.RaterUser)
                .ToListAsync();

            return _mapper.Map<IEnumerable<UserRatingDto>>(list);
        }

        public async Task<UserRatingDto?> GetUserRatingByIdAsync(int id)
        {
            var entity = await _context.UserRatings
                .Include(ur => ur.RatedUser)
                .Include(ur => ur.RaterUser)
                .FirstOrDefaultAsync(ur => ur.Id == id);

            return _mapper.Map<UserRatingDto?>(entity);
        }

        public async Task<UserRatingDto> UpdateUserRatingAsync(int id, UserRatingDto userRatingDto)
        {
            var entity = await _context.UserRatings.FindAsync(id);
            if (entity == null)
                throw new KeyNotFoundException("UserRating not found");

            _mapper.Map(userRatingDto, entity);
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return _mapper.Map<UserRatingDto>(entity);
        }
    }
}