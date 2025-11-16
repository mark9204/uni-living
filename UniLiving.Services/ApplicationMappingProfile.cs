using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UniLiving.DataContext.DTOs;
using UniLiving.DataContext.Entities;

namespace UniLiving.Services
{
    using AutoMapper;

    public class ApplicationMappingProfile : Profile
    {
        public ApplicationMappingProfile()
        {
            // Role mapping
            CreateMap<Role, RoleDto>().ReverseMap();

            // User mapping
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name))
                .ReverseMap();

            // EmailVerificationToken mapping
            CreateMap<EmailVerificationToken, EmailVerificationTokenDto>()
                .ReverseMap();

            // PasswordResetToken mapping
            CreateMap<PasswordResetToken, PasswordResetTokenDto>()
                .ReverseMap();

            // PropertyCategory mapping
            CreateMap<PropertyCategory, PropertyCategoryDto>()
                .ReverseMap();

            // Property mapping
            CreateMap<Property, PropertyDto>()
                .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => src.Owner.FirstName + " " + src.Owner.LastName))
                .ReverseMap();

            // PropertyImage mapping
            CreateMap<PropertyImage, PropertyImageDto>()
                .ReverseMap();
        }
    }
}
