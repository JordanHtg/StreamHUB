const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Current User Profile & Summary
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, watchlistCount, favoriteCount, continueWatching] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          phone: true,
          birthDate: true,
          gender: true,
          avatar: true,
          role: { select: { id: true, name: true, description: true } },
          createdAt: true,
        },
      }),
      prisma.watchlist.count({ where: { userId } }),
      prisma.favorite.count({ where: { userId } }),
      prisma.watchProgress.findMany({
        where: {
          userId,
          progressPercentage: { gt: 1, lt: 98 }, // between 1% and 98%
        },
        include: {
          movie: true,
          series: true,
          episode: true,
        },
        orderBy: { lastUpdated: 'desc' },
        take: 12,
      }),
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...user,
        stats: {
          watchlistCount,
          favoriteCount,
          continueWatchingCount: continueWatching.length,
        },
        continueWatching,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching user profile.' });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, username, phone, birthDate, gender, avatar } = req.body;

    if (username && username !== req.user.username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== userId) {
        return res.status(409).json({ success: false, message: 'Username is already taken.' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(phone !== undefined && { phone }),
        ...(birthDate !== undefined && { birthDate }),
        ...(gender && { gender }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        birthDate: true,
        gender: true,
        avatar: true,
        role: { select: { name: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile successfully updated!',
      user: updated,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error updating profile.' });
  }
};

// Get User Watchlist
const getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        movie: true,
        series: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: watchlist.length,
      data: watchlist,
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching watchlist.' });
  }
};

// Toggle Watchlist Item (Add / Remove)
const toggleWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, seriesId } = req.body;

    if (!movieId && !seriesId) {
      return res.status(400).json({ success: false, message: 'Must specify either movieId or seriesId.' });
    }

    const whereCondition = {
      userId_movieId_seriesId: {
        userId,
        movieId: movieId ? parseInt(movieId) : null,
        seriesId: seriesId ? parseInt(seriesId) : null,
      },
    };

    const existing = await prisma.watchlist.findUnique({
      where: whereCondition.userId_movieId_seriesId,
    }).catch(async () => {
      return await prisma.watchlist.findFirst({
        where: {
          userId,
          movieId: movieId ? parseInt(movieId) : undefined,
          seriesId: seriesId ? parseInt(seriesId) : undefined,
        },
      });
    });

    let inWatchlist = false;
    if (existing) {
      await prisma.watchlist.delete({ where: { id: existing.id } });
      inWatchlist = false;
    } else {
      await prisma.watchlist.create({
        data: {
          userId,
          movieId: movieId ? parseInt(movieId) : null,
          seriesId: seriesId ? parseInt(seriesId) : null,
        },
      });
      inWatchlist = true;
    }

    return res.status(200).json({
      success: true,
      inWatchlist,
      message: inWatchlist ? 'Added to your Watchlist' : 'Removed from your Watchlist',
    });
  } catch (error) {
    console.error('Toggle watchlist error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error updating watchlist.' });
  }
};

// Get User Favorites
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { movie: true, series: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error fetching favorites.' });
  }
};

// Save Watch Progress & Auto History
const saveWatchProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, seriesId, episodeId, currentTime, totalDuration } = req.body;

    if (currentTime === undefined || totalDuration === undefined) {
      return res.status(400).json({ success: false, message: 'Current time and total duration are required.' });
    }

    const percentage = Math.min(Math.round((currentTime / totalDuration) * 100), 100);

    // Save or update progress
    const progress = await prisma.watchProgress.upsert({
      where: {
        userId_movieId_episodeId: {
          userId,
          movieId: movieId ? parseInt(movieId) : null,
          episodeId: episodeId ? parseInt(episodeId) : null,
        },
      },
      update: {
        currentTime: parseFloat(currentTime),
        totalDuration: parseFloat(totalDuration),
        progressPercentage: percentage,
      },
      create: {
        userId,
        movieId: movieId ? parseInt(movieId) : null,
        seriesId: seriesId ? parseInt(seriesId) : null,
        episodeId: episodeId ? parseInt(episodeId) : null,
        currentTime: parseFloat(currentTime),
        totalDuration: parseFloat(totalDuration),
        progressPercentage: percentage,
      },
    });

    // Also log in watch history if not logged recently
    await prisma.watchHistory.create({
      data: {
        userId,
        movieId: movieId ? parseInt(movieId) : null,
        seriesId: seriesId ? parseInt(seriesId) : null,
        episodeId: episodeId ? parseInt(episodeId) : null,
      },
    });

    return res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Save watch progress error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error saving watch progress.' });
  }
};

// Add Comment
const addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, seriesId, episodeId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        movieId: movieId ? parseInt(movieId) : null,
        seriesId: seriesId ? parseInt(seriesId) : null,
        episodeId: episodeId ? parseInt(episodeId) : null,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      data: comment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error posting comment.' });
  }
};

// Add Rating
const addRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { movieId, seriesId, score, review } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Score must be a number between 1.0 and 5.0.' });
    }

    const rating = await prisma.rating.upsert({
      where: {
        userId_movieId_seriesId: {
          userId,
          movieId: movieId ? parseInt(movieId) : null,
          seriesId: seriesId ? parseInt(seriesId) : null,
        },
      },
      update: {
        score: parseFloat(score),
        review: review || null,
      },
      create: {
        userId,
        movieId: movieId ? parseInt(movieId) : null,
        seriesId: seriesId ? parseInt(seriesId) : null,
        score: parseFloat(score),
        review: review || null,
      },
    });

    // Update average movie rating if movie
    if (movieId) {
      const allRatings = await prisma.rating.findMany({ where: { movieId: parseInt(movieId) } });
      const avg = (allRatings.reduce((acc, curr) => acc + curr.score, 0) / allRatings.length).toFixed(1);
      await prisma.movie.update({ where: { id: parseInt(movieId) }, data: { rating: parseFloat(avg) } });
    }

    return res.status(200).json({
      success: true,
      message: 'Rating submitted successfully!',
      data: rating,
    });
  } catch (error) {
    console.error('Add rating error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error submitting rating.' });
  }
};

// Delete Account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.user.delete({ where: { id: userId } });
    return res.status(200).json({ success: true, message: 'Your StreamHUB account has been permanently deleted.' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error deleting account.' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getWatchlist,
  toggleWatchlist,
  getFavorites,
  saveWatchProgress,
  addComment,
  addRating,
  deleteAccount,
};
