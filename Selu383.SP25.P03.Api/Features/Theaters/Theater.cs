﻿ // Features/Theaters/Theater.cs
using Selu383.SP25.P03.Api.Features.Movies;
using Selu383.SP25.P03.Api.Features.Users;
using System.ComponentModel.DataAnnotations;

namespace Selu383.SP25.P03.Api.Features.Theaters
{
    public class Theater
    {
        public int Id { get; set; }
        [MaxLength(120)]
        public required string Name { get; set; }
        public required string Address { get; set; }
        public int SeatCount { get; set; }
        public int? ManagerId { get; set; }
        public virtual User? Manager { get; set; }

        // Navigation property
        public virtual ICollection<TheaterRoom> Rooms { get; set; } = new List<TheaterRoom>();
        public virtual ICollection<TheaterMovie> TheaterMovies { get; set; } = new List<TheaterMovie>();


    }
}