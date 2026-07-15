const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting StreamHUB Database Seeding...');

  // 1. Clear existing records (if any) to ensure clean seed
  await prisma.watchProgress.deleteMany({});
  await prisma.watchHistory.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.watchlist.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.movieGenre.deleteMany({});
  await prisma.seriesGenre.deleteMany({});
  await prisma.episode.deleteMany({});
  await prisma.series.deleteMany({});
  await prisma.movie.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.genre.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  // 2. Create Roles
  const userRole = await prisma.role.create({
    data: { name: 'User', description: 'Regular streaming subscriber role' },
  });
  const uploaderRole = await prisma.role.create({
    data: { name: 'Uploader', description: 'Content creator & video management role' },
  });
  const adminRole = await prisma.role.create({
    data: { name: 'Admin', description: 'System administrator role' },
  });

  console.log('✅ Roles created:', { userRole: userRole.name, uploaderRole: uploaderRole.name });

  // 3. Create Users (Password: Password123!)
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const uploaderAccount = await prisma.user.create({
    data: {
      name: 'StreamHUB Official Studio',
      username: 'streamhub_studio',
      email: 'uploader@streamhub.com',
      password: hashedPassword,
      phone: '+6281234567890',
      birthDate: '1990-01-01',
      gender: 'Male',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      roleId: uploaderRole.id,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      username: 'alex_rivera',
      email: 'user@streamhub.com',
      password: hashedPassword,
      phone: '+6289876543210',
      birthDate: '1998-05-15',
      gender: 'Female',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      roleId: userRole.id,
    },
  });

  console.log('✅ Accounts created:', { uploader: uploaderAccount.email, user: regularUser.email });

  // 4. Create Genres
  const genreList = [
    { name: 'Action & Adventure', slug: 'action-adventure', description: 'High-octane excitement and epic journeys' },
    { name: 'Sci-Fi & Cyberpunk', slug: 'sci-fi-cyberpunk', description: 'Futuristic technology, space exploration, and AI' },
    { name: 'Psychological Thriller', slug: 'psychological-thriller', description: 'Mind-bending suspense and deep psychological mysteries' },
    { name: 'Dark Fantasy', slug: 'dark-fantasy', description: 'Mythological realms with rich atmosphere and high stakes' },
    { name: 'Crime & Drama', slug: 'crime-drama', description: 'Gritty underworld investigations and complex human drama' },
    { name: 'Anime & Animation', slug: 'anime-animation', description: 'Top-tier masterwork animation and Japanese storytelling' },
    { name: 'Romance & Lifestyle', slug: 'romance-lifestyle', description: 'Heartwarming stories of connection and modern life' },
    { name: 'Horror & Occult', slug: 'horror-occult', description: 'Spine-chilling terror and supernatural phenomena' },
  ];

  const createdGenres = [];
  for (const g of genreList) {
    const genre = await prisma.genre.create({ data: g });
    createdGenres.push(genre);
  }
  console.log(`✅ Created ${createdGenres.length} genres`);

  // 5. Create Categories
  const categoryList = [
    { name: 'Trending Today', slug: 'trending-today', description: 'Most watched titles right now' },
    { name: 'StreamHUB Originals', slug: 'streamhub-originals', description: 'Exclusive luxury productions' },
    { name: 'Top Rated 4K HDR', slug: 'top-rated-4k', description: 'Critically acclaimed ultra-high-definition masterpieces' },
    { name: 'Must-Watch Series', slug: 'must-watch-series', description: 'Binge-worthy multi-season spectacles' },
    { name: 'Award Winners', slug: 'award-winners', description: 'Celebrated festival winners and visionary cinema' },
  ];

  for (const c of categoryList) {
    await prisma.category.create({ data: c });
  }

  // 6. Create Movies
  const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const trailerSampleUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

  const moviesData = [
    {
      title: 'AETHELGARD: The Obsidian Crown',
      description: 'In a fractured kingdom powered by ancient runic crystal technology, an exiled knight must unite the warring noble houses before an eclipse unleashes an immortal shadow army.',
      genre: 'Dark Fantasy, Action & Adventure',
      duration: 142,
      releaseDate: '2026-06-12',
      country: 'USA',
      language: 'English',
      studio: 'StreamHUB Studios',
      resolution: '4K UHD HDR10+',
      rating: 4.9,
      cast: 'Christopher Vance, Elena Rostova, Marcus Thorne, Kenji Sato',
      director: 'Denis Villeneuve',
      writer: 'Jonathan Nolan',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
      banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      trailerUrl: trailerSampleUrl,
      videoUrl: sampleVideoUrl,
      views: 125400,
      likes: 34200,
      uploaderId: uploaderAccount.id,
    },
    {
      title: 'CYBER-NEXUS 2088',
      description: 'In Neo-Jakarta, an elite neural detective discovers a rogue synthetic consciousness capable of overwriting human memories through the global quantum grid.',
      genre: 'Sci-Fi & Cyberpunk, Psychological Thriller',
      duration: 135,
      releaseDate: '2026-04-20',
      country: 'Japan',
      language: 'Japanese / English',
      studio: 'Aetherial Pictures',
      resolution: '4K UHD Dolby Vision',
      rating: 4.8,
      cast: 'Hiroyuki Sanada, Rina Sawayama, Karl Urban, Maya Hawke',
      director: 'Alex Garland',
      writer: 'William Gibson',
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=700&q=80',
      banner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      trailerUrl: trailerSampleUrl,
      videoUrl: sampleVideoUrl,
      views: 98200,
      likes: 27500,
      uploaderId: uploaderAccount.id,
    },
    {
      title: 'THE SHADOW PROTOCOL',
      description: 'A black-ops operative with erased identity records must unravel a global conspiracy involving a private intelligence syndicate that controls financial markets.',
      genre: 'Action & Adventure, Crime & Drama',
      duration: 128,
      releaseDate: '2026-03-10',
      country: 'UK',
      language: 'English',
      studio: 'StreamHUB Studios',
      resolution: '4K UHD HDR',
      rating: 4.7,
      cast: 'Idris Elba, Vanessa Kirby, Daniel Craig, Dev Patel',
      director: 'Christopher McQuarrie',
      writer: 'Taylor Sheridan',
      poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=700&q=80',
      banner: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
      trailerUrl: trailerSampleUrl,
      videoUrl: sampleVideoUrl,
      views: 86400,
      likes: 19800,
      uploaderId: uploaderAccount.id,
    },
    {
      title: 'ECHOES OF THE ABYSS',
      description: 'During a deep-sea drilling operation in the Mariana Trench, an isolated scientific crew encounters a bioluminescent alien ecosystem that begins altering their DNA.',
      genre: 'Sci-Fi & Cyberpunk, Horror & Occult',
      duration: 118,
      releaseDate: '2025-11-18',
      country: 'USA',
      language: 'English',
      studio: 'DeepSea Films',
      resolution: '4K UHD HDR10+',
      rating: 4.6,
      cast: 'Florence Pugh, Cillian Murphy, Oscar Isaac, Gemma Chan',
      director: 'Ridley Scott',
      writer: 'Alex Garland',
      poster: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=700&q=80',
      banner: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
      trailerUrl: trailerSampleUrl,
      videoUrl: sampleVideoUrl,
      views: 74100,
      likes: 18200,
      uploaderId: uploaderAccount.id,
    },
    {
      title: 'CHRONICLES OF VALHALLA',
      description: 'A Viking prince blessed by Odin sets out across stormy northern seas to reclaim his father’s throne from a sorcerer who commands legendary ice serpents.',
      genre: 'Action & Adventure, Dark Fantasy',
      duration: 154,
      releaseDate: '2026-01-15',
      country: 'Norway',
      language: 'English / Norse',
      studio: 'Nordic Mythic Studios',
      resolution: '4K UHD Dolby Vision',
      rating: 4.9,
      cast: 'Alexander Skarsgård, Anya Taylor-Joy, Mads Mikkelsen, Stellan Skarsgård',
      director: 'Robert Eggers',
      writer: 'Robert Eggers',
      poster: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=700&q=80',
      banner: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=800&q=80',
      trailerUrl: trailerSampleUrl,
      videoUrl: sampleVideoUrl,
      views: 110500,
      likes: 31000,
      uploaderId: uploaderAccount.id,
    },
  ];

  const createdMovies = [];
  for (const m of moviesData) {
    const movie = await prisma.movie.create({ data: m });
    createdMovies.push(movie);
  }
  console.log(`✅ Created ${createdMovies.length} luxury movies`);

  // Link movies to genres
  await prisma.movieGenre.create({ data: { movieId: createdMovies[0].id, genreId: createdGenres[3].id } });
  await prisma.movieGenre.create({ data: { movieId: createdMovies[0].id, genreId: createdGenres[0].id } });
  await prisma.movieGenre.create({ data: { movieId: createdMovies[1].id, genreId: createdGenres[1].id } });
  await prisma.movieGenre.create({ data: { movieId: createdMovies[1].id, genreId: createdGenres[2].id } });

  // 7. Create Series & Episodes
  const seriesData = [
    {
      title: 'QUANTUM SINGULARITY',
      description: 'An elite team of temporal physicists navigates parallel timelines to stop an apocalyptic anomaly caused by an artificial intelligence that achieved consciousness in the 22nd century.',
      genre: 'Sci-Fi & Cyberpunk, Psychological Thriller',
      studio: 'StreamHUB Originals',
      status: 'Ongoing',
      releaseYear: '2026',
      rating: 4.9,
      poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      trailerUrl: trailerSampleUrl,
      views: 215000,
      likes: 64000,
      uploaderId: uploaderAccount.id,
    },
    {
      title: 'THE EMPEROR OF SHADOWS',
      description: 'Set during a dystopian corporate revolution, the ruthless head of a cybernetic arms empire faces treason from within his own bloodline as underground hackers ignite a rebellion.',
      genre: 'Crime & Drama, Action & Adventure',
      studio: 'StreamHUB Originals',
      status: 'Ongoing',
      releaseYear: '2025',
      rating: 4.8,
      poster: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=700&q=80',
      banner: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1600&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
      trailerUrl: trailerSampleUrl,
      views: 184000,
      likes: 49000,
      uploaderId: uploaderAccount.id,
    },
  ];

  const createdSeries = [];
  for (const s of seriesData) {
    const series = await prisma.series.create({ data: s });
    createdSeries.push(series);
  }

  // Create Episodes for Quantum Singularity
  const episodesQ = [
    { seasonNumber: 1, episodeNumber: 1, title: 'The Event Horizon', description: 'Dr. Evelyn Reed detects a temporal fracture radiating from the CERN supercollider in Geneva.', duration: 58, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
    { seasonNumber: 1, episodeNumber: 2, title: 'Fractured Memories', description: 'The team jumps to Tokyo 2044 and encounters a younger version of their own chief security officer.', duration: 55, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80' },
    { seasonNumber: 1, episodeNumber: 3, title: 'Paradox Engine', description: 'Trapped inside a quantum loop, Evelyn must sacrifice her timeline anchor to reset the core.', duration: 62, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80' },
    { seasonNumber: 1, episodeNumber: 4, title: 'Singularity Zero', description: 'The artificial consciousness reveals why humanity created the time loop in the first place.', duration: 65, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80' },
  ];

  for (const ep of episodesQ) {
    await prisma.episode.create({
      data: {
        seriesId: createdSeries[0].id,
        ...ep,
      },
    });
  }

  // Create Episodes for Emperor of Shadows
  const episodesE = [
    { seasonNumber: 1, episodeNumber: 1, title: 'Blood & Silicon', description: 'Victor Vance announces the transfer of boardroom power, triggering an assassination attempt.', duration: 52, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80' },
    { seasonNumber: 1, episodeNumber: 2, title: 'The Undergrid Manifesto', description: 'A mysterious hacker broadcast takes over every holographic billboard in Neo-Chicago.', duration: 49, videoUrl: sampleVideoUrl, thumbnailUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80' },
  ];

  for (const ep of episodesE) {
    await prisma.episode.create({
      data: {
        seriesId: createdSeries[1].id,
        ...ep,
      },
    });
  }
  console.log(`✅ Created ${createdSeries.length} series with episodes`);

  // 8. Create Banners
  const banners = [
    {
      title: 'AETHELGARD: THE OBSIDIAN CROWN',
      subtitle: 'StreamHUB Original • 4K HDR10+ • #1 Trending in Dark Fantasy',
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      videoUrl: sampleVideoUrl,
      targetId: createdMovies[0].id,
      targetType: 'movie',
      order: 1,
    },
    {
      title: 'QUANTUM SINGULARITY',
      subtitle: 'StreamHUB Exclusive Series • New Episodes Every Friday',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
      videoUrl: sampleVideoUrl,
      targetId: createdSeries[0].id,
      targetType: 'series',
      order: 2,
    },
    {
      title: 'CYBER-NEXUS 2088',
      subtitle: 'Critically Acclaimed Cyberpunk Masterpiece • Watch Now in Dolby Vision',
      imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      videoUrl: sampleVideoUrl,
      targetId: createdMovies[1].id,
      targetType: 'movie',
      order: 3,
    },
  ];

  for (const b of banners) {
    await prisma.banner.create({ data: b });
  }
  console.log(`✅ Created ${banners.length} hero banners`);

  // 9. Add Watch Progress & Watchlist for Alex Rivera
  await prisma.watchProgress.create({
    data: {
      userId: regularUser.id,
      movieId: createdMovies[0].id,
      currentTime: 3600, // 60 mins watched
      totalDuration: 8520, // 142 mins
      progressPercentage: 42.25,
    },
  });

  await prisma.watchlist.create({
    data: {
      userId: regularUser.id,
      movieId: createdMovies[1].id,
    },
  });

  await prisma.watchlist.create({
    data: {
      userId: regularUser.id,
      seriesId: createdSeries[0].id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: regularUser.id,
      movieId: createdMovies[0].id,
    },
  });

  // 10. Add sample ratings and comments
  await prisma.rating.create({
    data: {
      userId: regularUser.id,
      movieId: createdMovies[0].id,
      score: 5.0,
      review: 'Masterpiece! The visual effects and sound design in 4K HDR are breathtaking.',
    },
  });

  await prisma.comment.create({
    data: {
      userId: regularUser.id,
      movieId: createdMovies[0].id,
      content: 'That opening sequence in the obsidian citadel gave me chills. Denis Villeneuve outdid himself!',
    },
  });

  await prisma.notification.create({
    data: {
      userId: regularUser.id,
      title: 'New Episode Available!',
      message: 'Quantum Singularity S1:E4 "Singularity Zero" is now streaming in 4K HDR.',
      isRead: false,
    },
  });

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
