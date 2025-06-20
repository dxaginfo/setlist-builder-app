const { Setlist, Song, User, SetlistSong, sequelize } = require('../models');
const { Op } = require('sequelize');
const createError = require('http-errors');
const logger = require('../utils/logger');

/**
 * Get all setlists for the current user
 */
exports.getSetlists = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find all setlists created by the user or shared with them
    const setlists = await Setlist.findAll({
      where: {
        [Op.or]: [
          { user_id: userId },
          { '$collaborators.user_id$': userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'profile_image_url']
        },
        {
          model: User,
          as: 'collaborators',
          attributes: ['id', 'name', 'profile_image_url'],
          through: { attributes: ['permission_level'] }
        },
        {
          model: Song,
          as: 'songs',
          attributes: ['id', 'title', 'artist', 'duration_seconds'],
          through: { attributes: ['position'] }
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json(setlists);
  } catch (error) {
    logger.error('Error getting setlists:', error);
    next(error);
  }
};

/**
 * Get a specific setlist by ID
 */
exports.getSetlistById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const setlist = await Setlist.findOne({
      where: {
        id,
        [Op.or]: [
          { user_id: userId },
          { '$collaborators.user_id$': userId },
          { is_public: true }
        ]
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'profile_image_url']
        },
        {
          model: User,
          as: 'collaborators',
          attributes: ['id', 'name', 'profile_image_url'],
          through: { attributes: ['permission_level'] }
        },
        {
          model: Song,
          as: 'songs',
          attributes: [
            'id', 'title', 'artist', 'key', 'tempo', 
            'duration_seconds', 'lyrics_url', 'chord_chart_url'
          ],
          through: { 
            attributes: ['position', 'notes'],
            as: 'songDetails'
          }
        }
      ],
      order: [
        [{ model: Song, as: 'songs' }, 'SetlistSong', 'position', 'ASC']
      ]
    });
    
    if (!setlist) {
      return next(createError(404, 'Setlist not found or you do not have permission to view it'));
    }
    
    res.status(200).json(setlist);
  } catch (error) {
    logger.error('Error getting setlist by ID:', error);
    next(error);
  }
};

/**
 * Create a new setlist
 */
exports.createSetlist = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { title, description, isPublic, songs } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!title) {
      return next(createError(400, 'Setlist title is required'));
    }
    
    // Create the setlist
    const setlist = await Setlist.create({
      title,
      description,
      is_public: isPublic || false,
      user_id: userId
    }, { transaction });
    
    // Add songs to the setlist if provided
    if (songs && Array.isArray(songs) && songs.length > 0) {
      const setlistSongs = songs.map((song, index) => ({
        setlist_id: setlist.id,
        song_id: song.id,
        position: song.position || index,
        notes: song.notes || ''
      }));
      
      await SetlistSong.bulkCreate(setlistSongs, { transaction });
    }
    
    await transaction.commit();
    
    // Fetch the complete setlist with associations
    const newSetlist = await Setlist.findByPk(setlist.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'profile_image_url']
        },
        {
          model: Song,
          as: 'songs',
          attributes: [
            'id', 'title', 'artist', 'key', 'tempo', 
            'duration_seconds', 'lyrics_url', 'chord_chart_url'
          ],
          through: { 
            attributes: ['position', 'notes'],
            as: 'songDetails'
          }
        }
      ],
      order: [
        [{ model: Song, as: 'songs' }, 'SetlistSong', 'position', 'ASC']
      ]
    });
    
    res.status(201).json(newSetlist);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating setlist:', error);
    next(error);
  }
};

/**
 * Update an existing setlist
 */
exports.updateSetlist = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { title, description, isPublic, songs } = req.body;
    const userId = req.user.id;
    
    // Find the setlist and check permissions
    const setlist = await Setlist.findOne({
      where: {
        id,
        [Op.or]: [
          { user_id: userId },
          { 
            '$collaborators.user_id$': userId,
            '$collaborators.permission_level$': ['edit', 'admin']
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'collaborators',
          attributes: ['id'],
          through: { attributes: ['permission_level'] }
        }
      ]
    });
    
    if (!setlist) {
      return next(createError(404, 'Setlist not found or you do not have permission to edit it'));
    }
    
    // Update basic setlist properties
    await setlist.update({
      title: title || setlist.title,
      description: description !== undefined ? description : setlist.description,
      is_public: isPublic !== undefined ? isPublic : setlist.is_public
    }, { transaction });
    
    // Update songs if provided
    if (songs && Array.isArray(songs)) {
      // Delete existing setlist songs
      await SetlistSong.destroy({
        where: { setlist_id: id },
        transaction
      });
      
      // Add new setlist songs
      if (songs.length > 0) {
        const setlistSongs = songs.map((song, index) => ({
          setlist_id: setlist.id,
          song_id: song.id,
          position: song.position !== undefined ? song.position : index,
          notes: song.notes || ''
        }));
        
        await SetlistSong.bulkCreate(setlistSongs, { transaction });
      }
    }
    
    await transaction.commit();
    
    // Fetch the updated setlist with associations
    const updatedSetlist = await Setlist.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'profile_image_url']
        },
        {
          model: User,
          as: 'collaborators',
          attributes: ['id', 'name', 'profile_image_url'],
          through: { attributes: ['permission_level'] }
        },
        {
          model: Song,
          as: 'songs',
          attributes: [
            'id', 'title', 'artist', 'key', 'tempo', 
            'duration_seconds', 'lyrics_url', 'chord_chart_url'
          ],
          through: { 
            attributes: ['position', 'notes'],
            as: 'songDetails'
          }
        }
      ],
      order: [
        [{ model: Song, as: 'songs' }, 'SetlistSong', 'position', 'ASC']
      ]
    });
    
    res.status(200).json(updatedSetlist);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error updating setlist:', error);
    next(error);
  }
};

/**
 * Delete a setlist
 */
exports.deleteSetlist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find the setlist and check permissions
    const setlist = await Setlist.findOne({
      where: {
        id,
        [Op.or]: [
          { user_id: userId },
          { 
            '$collaborators.user_id$': userId,
            '$collaborators.permission_level$': 'admin'
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'collaborators',
          attributes: ['id'],
          through: { attributes: ['permission_level'] }
        }
      ]
    });
    
    if (!setlist) {
      return next(createError(404, 'Setlist not found or you do not have permission to delete it'));
    }
    
    // Delete the setlist (cascade will delete related entries)
    await setlist.destroy();
    
    res.status(204).end();
  } catch (error) {
    logger.error('Error deleting setlist:', error);
    next(error);
  }
};

/**
 * Add a collaborator to a setlist
 */
exports.addCollaborator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, permissionLevel } = req.body;
    const currentUserId = req.user.id;
    
    // Check if valid permission level
    if (!['view', 'edit', 'admin'].includes(permissionLevel)) {
      return next(createError(400, 'Invalid permission level. Must be "view", "edit", or "admin"'));
    }
    
    // Find the setlist and check permissions
    const setlist = await Setlist.findOne({
      where: {
        id,
        [Op.or]: [
          { user_id: currentUserId },
          { 
            '$collaborators.user_id$': currentUserId,
            '$collaborators.permission_level$': 'admin'
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'collaborators',
          attributes: ['id'],
          through: { attributes: ['permission_level'] }
        }
      ]
    });
    
    if (!setlist) {
      return next(createError(404, 'Setlist not found or you do not have permission to add collaborators'));
    }
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return next(createError(404, 'User not found'));
    }
    
    // Add or update collaborator
    await sequelize.models.Collaborator.upsert({
      setlist_id: id,
      user_id: userId,
      permission_level: permissionLevel
    });
    
    res.status(201).json({ message: 'Collaborator added successfully' });
  } catch (error) {
    logger.error('Error adding collaborator:', error);
    next(error);
  }
};

/**
 * Remove a collaborator from a setlist
 */
exports.removeCollaborator = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const currentUserId = req.user.id;
    
    // Find the setlist and check permissions
    const setlist = await Setlist.findOne({
      where: {
        id,
        [Op.or]: [
          { user_id: currentUserId },
          { 
            '$collaborators.user_id$': currentUserId,
            '$collaborators.permission_level$': 'admin'
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'collaborators',
          attributes: ['id'],
          through: { attributes: ['permission_level'] }
        }
      ]
    });
    
    if (!setlist) {
      return next(createError(404, 'Setlist not found or you do not have permission to remove collaborators'));
    }
    
    // Remove collaborator
    await sequelize.models.Collaborator.destroy({
      where: {
        setlist_id: id,
        user_id: userId
      }
    });
    
    res.status(204).end();
  } catch (error) {
    logger.error('Error removing collaborator:', error);
    next(error);
  }
};