const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get All Series
const getAllSeries = async (req, res) => {
  try {
    const { search, genre, sort = 'newest', page = 1, limit = 20 } = req.query;

    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (genre && genre !== 'all') {
      whereClause.genre = { contains: genre };
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'trending') orderBy = { views: 'desc' };
    if (sort === 'rating') orderBy = { rating: 'desc' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [series, total] = await Promise.all([
      prisma.series.findMany({
        where: whereClause,
        orderBy,
        skip,
        take,
        include: {
          episodes: { select: { id: true, seasonNumber: true, episodeNumber: true, title: true, duration: true } },
          uploader: { select: { id: true, name: true, username: true } },
        },
      }),
      prisma.series.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      success: true,
      count: series.length,
      total,
      data: series,
    });
  } catch (error) {
    console.error('Get all series error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching series.' });
  }
};

// Get Series by ID with Episodes & Seasons
const getSeriesById = async (req, res) => {
  try {
    const { id } = req.params;
    const seriesId = parseInt(id);

    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      include: {
        episodes: {
          orderBy: [
            { seasonNumber: 'asc' },
            { episodeNumber: 'asc' },
          ],
        },
        uploader: { select: { id: true, name: true, username: true, avatar: true } },
        comments: {
          include: { user: { select: { id: true, name: true, username: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        ratings: true,
      },
    });

    if (!series) {
      return res.status(404).json({ success: false, message: 'Series not found.' });
    }

    // Increment view count asynchronously
    prisma.series.update({
      where: { id: seriesId },
      data: { views: { increment: 1 } },
    }).catch((e) => console.error('Increment series view error:', e));

    return res.status(200).json({
      success: true,
      data: series,
    });
  } catch (error) {
    console.error('Get series by ID error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching series.' });
  }
};

// Create Series (Uploader / Admin)
const createSeries = async (req, res) => {
  try {
    const { title, description, genre, studio, status, releaseYear, rating, poster, banner, thumbnail, trailerUrl } = req.body;

    if (!title || !description || !genre || !releaseYear) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, genre, and release year.' });
    }

    const newSeries = await prisma.series.create({
      data: {
        title,
        description,
        genre,
        studio: studio || 'StreamHUB Originals',
        status: status || 'Ongoing',
        releaseYear,
        rating: rating ? parseFloat(rating) : 4.9,
        poster: poster || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=700&q=80',
        banner: banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        trailerUrl: trailerUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        uploaderId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Series created successfully!',
      data: newSeries,
    });
  } catch (error) {
    console.error('Create series error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error creating series.' });
  }
};

// Create Episode (Uploader / Admin)
const createEpisode = async (req, res) => {
  try {
    const { seriesId, seasonNumber, episodeNumber, title, description, duration, videoUrl, thumbnailUrl, subtitleUrl } = req.body;

    if (!seriesId || !episodeNumber || !title || !duration) {
      return res.status(400).json({ success: false, message: 'Please provide series ID, episode number, title, and duration.' });
    }

    const episode = await prisma.episode.create({
      data: {
        seriesId: parseInt(seriesId),
        seasonNumber: seasonNumber ? parseInt(seasonNumber) : 1,
        episodeNumber: parseInt(episodeNumber),
        title,
        description: description || '',
        duration: parseInt(duration),
        videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        subtitleUrl: subtitleUrl || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Episode uploaded and added successfully!',
      data: episode,
    });
  } catch (error) {
    console.error('Create episode error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error adding episode.' });
  }
};

module.exports = {
  getAllSeries,
  getSeriesById,
  createSeries,
  createEpisode,
};
