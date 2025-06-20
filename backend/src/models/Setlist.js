'use strict';

module.exports = (sequelize, DataTypes) => {
  const Setlist = sequelize.define('Setlist', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'setlists',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Setlist.associate = (models) => {
    // A setlist belongs to a user (creator)
    Setlist.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'creator'
    });

    // Many-to-many relationship with songs through SetlistSong join table
    Setlist.belongsToMany(models.Song, {
      through: models.SetlistSong,
      foreignKey: 'setlist_id',
      as: 'songs'
    });

    // A setlist can have many performances
    Setlist.hasMany(models.Performance, {
      foreignKey: 'setlist_id',
      as: 'performances'
    });

    // Many-to-many relationship with collaborators (users)
    Setlist.belongsToMany(models.User, {
      through: models.Collaborator,
      foreignKey: 'setlist_id',
      as: 'collaborators'
    });
  };

  // Instance methods
  Setlist.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Format timestamps if needed
    if (values.created_at) values.createdAt = values.created_at;
    if (values.updated_at) values.updatedAt = values.updated_at;
    
    // Delete redundant fields
    delete values.created_at;
    delete values.updated_at;
    
    return values;
  };

  return Setlist;
};