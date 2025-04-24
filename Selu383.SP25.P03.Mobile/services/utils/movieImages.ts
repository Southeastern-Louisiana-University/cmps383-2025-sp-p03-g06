// services/utils/movieImages.ts
// This is to handle the movie images and their URLs
// Static mapping of movie titles to local poster assets

export const movieImages: Record<string, any> = {
  snowwhite: require("../../assets/images/posters/SnowWhite.png"),
  deathofaunicorn: require("../../assets/images/posters/DeathOfAUnicorn.jpg"),
  novocaine: require("../../assets/images/posters/Novocaine.jpg"),
  mickey17: require("../../assets/images/posters/Mickey17.jpg"),
  aworkingman: require("../../assets/images/posters/AWorkingMan.jpg"),
  thewomanintheyard: require("../../assets/images/posters/AWomanInTheYard.jpg"),
  thedaytheearthblewupalooneytunesmovie: require("../../assets/images/posters/LooneyTunes.jpg"),
  dogman: require("../../assets/images/posters/DogMan.jpg"),
  themonkey: require("../../assets/images/posters/TheMonkey.jpg"),
  paddingtoninperu: require("../../assets/images/posters/PaddingtonBear.jpg"),
  captainamericabravenewworld: require("../../assets/images/posters/CaptainAmerica.jpg"),
  mufasathelionking: require("../../assets/images/posters/Mufasa.jpg"),
  locked: require("../../assets/images/posters/Locked.jpg"),
  oneofthemdays: require("../../assets/images/posters/OOTD.png"),
};

export const defaultPoster = require("../../assets/images/posters/default.avif");
