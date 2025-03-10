namespace Selu383.SP25.P03.Api.Features.Movies
{
    public class Movie
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Genre { get; set; }
        public string? Description { get; set; }
        public string? Rating { get; set; }
        public TimeSpan Duration { get; set; }
        public DateTime ReleaseDate { get; set; }
    }
}
