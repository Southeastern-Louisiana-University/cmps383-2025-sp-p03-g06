using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Selu383.SP25.P03.Api.Migrations
{
    /// <inheritdoc />
    public partial class fix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Theaters_Name",
                table: "Theaters",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Showtimes_StartTime",
                table: "Showtimes",
                column: "StartTime");

            migrationBuilder.CreateIndex(
                name: "IX_Movies_Title",
                table: "Movies",
                column: "Title");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Theaters_Name",
                table: "Theaters");

            migrationBuilder.DropIndex(
                name: "IX_Showtimes_StartTime",
                table: "Showtimes");

            migrationBuilder.DropIndex(
                name: "IX_Movies_Title",
                table: "Movies");
        }
    }
}
