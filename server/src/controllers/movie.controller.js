const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get All Movies with Live Search, Filtering & Pagination
const getAllMovies = async (req, res) => {
  try {
    const {
      search,
      genre,
      year,
      country,
      language,
      minRating,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    const whereClause = {
      status: 'PUBLISHED',
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { cast: { contains: search } },
        { director: { contains: search } },
      ];
    }

    if (genre && genre !== 'all' && genre !== 'All') {
      whereClause.genre = { contains: genre };
    }

    if (year && year !== 'all') {
      whereClause.releaseDate = { contains: year };
    }

    if (country && country !== 'all') {
      whereClause.country = { contains: country };
    }

    if (language && language !== 'all') {
      whereClause.language = { contains: language };
    }

    if (minRating) {
      whereClause.rating = { gte: parseFloat(minRating) };
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'trending' || sort === 'popular') {
      orderBy = { views: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where: whereClause,
        orderBy,
        skip,
        take,
        include: {
          uploader: { select: { id: true, name: true, username: true } },
        },
      }),
      prisma.movie.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      success: true,
      count: movies.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / take),
      data: movies,
    });
  } catch (error) {
    console.error('Get all movies error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching movies.' });
  }
};

// Get Single Movie by ID
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const movieId = parseInt(id);

    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        uploader: { select: { id: true, name: true, username: true, avatar: true } },
        comments: {
          include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        ratings: true,
        subtitles: true,
        videoFiles: true,
      },
    });

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    // Increment view count asynchronously
    prisma.movie.update({
      where: { id: movieId },
      data: { views: { increment: 1 } },
    }).catch((e) => console.error('Increment view error:', e));

    // Fetch similar movies
    const similarMovies = await prisma.movie.findMany({
      where: {
        id: { not: movieId },
        status: 'PUBLISHED',
      },
      take: 6,
      orderBy: { views: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...movie,
        similarMovies,
      },
    });
  } catch (error) {
    console.error('Get movie by ID error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching movie details.' });
  }
};

// Create Movie (Uploader / Admin)
const createMovie = async (req, res) => {
  try {
    const {
      title,
      description,
      genre,
      duration,
      releaseDate,
      country,
      language,
      studio,
      resolution,
      rating,
      cast,
      director,
      writer,
      poster,
      banner,
      thumbnail,
      trailerUrl,
      videoUrl,
      subtitleUrl,
      status,
    } = req.body;

    if (!title || !description || !genre || !duration || !releaseDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, genre, duration, and release date.',
      });
    }

    const newMovie = await prisma.movie.create({
      data: {
        title,
        description,
        genre,
        duration: parseInt(duration),
        releaseDate,
        country: country || 'USA',
        language: language || 'English',
        studio: studio || 'StreamHUB Studios',
        resolution: resolution || '4K UHD',
        rating: rating ? parseFloat(rating) : 4.8,
        cast: cast || '',
        director: director || '',
        writer: writer || '',
        poster: poster || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=80',
        banner: banner || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        trailerUrl: trailerUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        subtitleUrl: subtitleUrl || null,
        status: status || 'PUBLISHED',
        uploaderId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Movie uploaded and created successfully!',
      data: newMovie,
    });
  } catch (error) {
    console.error('Create movie error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error creating movie.' });
  }
};

// Update Movie (Uploader / Admin)
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movieId = parseInt(id);

    const existingMovie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!existingMovie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    // Verify ownership or Admin role
    if (existingMovie.uploaderId !== req.user.id && req.user.role?.name !== 'Admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to modify this movie.' });
    }

    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Movie updated successfully!',
      data: updatedMovie,
    });
  } catch (error) {
    console.error('Update movie error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error updating movie.' });
  }
};

// Delete Movie (Uploader / Admin)
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const movieId = parseInt(id);

    const existingMovie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!existingMovie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    if (existingMovie.uploaderId !== req.user.id && req.user.role?.name !== 'Admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this movie.' });
    }

    await prisma.movie.delete({ where: { id: movieId } });

    return res.status(200).json({
      success: true,
      message: 'Movie deleted successfully.',
    });
  } catch (error) {
    console.error('Delete movie error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error deleting movie.' });
  }
};

// Toggle Like
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const movieId = parseInt(id);

    const existing = await prisma.favorite.findFirst({
      where: { userId: req.user.id, movieId },
    });

    let liked = false;
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      await prisma.movie.update({ where: { id: movieId }, data: { likes: { decrement: 1 } } });
      liked = false;
    } else {
      await prisma.favorite.create({
        data: { userId: req.user.id, movieId },
      });
      await prisma.movie.update({ where: { id: movieId }, data: { likes: { increment: 1 } } });
      liked = true;
    }

    return res.status(200).json({
      success: true,
      liked,
      message: liked ? 'Added to liked movies' : 'Removed from liked movies',
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error processing like.' });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  toggleLike,
};
