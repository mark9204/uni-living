using Microsoft.EntityFrameworkCore;
using UniLiving.DataContext;
using UniLiving.Services.Services;
using UniLiving.Services;
using AutoMapper;

namespace UniLiving
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();

            // Connection String
            builder.Services.AddDbContext<UniDBContext>(options => 
                options.UseSqlServer(builder.Configuration.GetConnectionString("UniLivingContext")));

            // AutoMapper Configuration
            builder.Services.AddAutoMapper(cfg => cfg.AddProfile<ApplicationMappingProfile>());

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddScoped<IUserService, UserService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
