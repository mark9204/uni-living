using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UniLiving.DataContext.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePropertyCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "PropertyCategories",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Lakás bérleti lehetőség", "Lakás" });

            migrationBuilder.UpdateData(
                table: "PropertyCategories",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Egész ház bérleti lehetőség", "Ház" });

            migrationBuilder.UpdateData(
                table: "PropertyCategories",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Szoba bérleti lehetőség", "Szoba" });

            migrationBuilder.UpdateData(
                table: "PropertyCategories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Garzon lakás bérleti lehetőség", "Garzon" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "PropertyCategories",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Traditional rental apartment", "Apartment" });

            migrationBuilder.UpdateData(
                table: "PropertyCategories",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Student dormitory", "Dormitory" });

            migrationBuilder.UpdateData(
                table: "PropertyCategories",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Shared apartment with roommates", "SharedApartment" });

            migrationBuilder.UpdateData(
                table: "PropertyCategories",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Single room for rent", "Room" });
        }
    }
}
