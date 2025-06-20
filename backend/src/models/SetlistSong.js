'use strict';

module.exports = (sequelize, DataTypes) => {
  const SetlistSong = sequelize.define('SetlistSong', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    setlist_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'setlists',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    song_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'songs',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'setlist_songs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['setlist_id', 'song_id']
      },
      {
        unique: true,
        fields: ['setlist_id', 'position']
      }
    ]
  });

  SetlistSong.associate = (models) => {
    // This is a junction table, so it belongs to both Setlist and Song
    SetlistSong.belongsTo(models.Setlist, {
      foreignKey: 'setlist_id'
    });
    
    SetlistSong.belongsTo(models.Song, {
      foreignKey: 'song_id'
    });
  };

  // Instance methods
  SetlistSong.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Format timestamps
    if (values.created_at) values.createdAt = values.created_at;
    if (values.updated_at) values.updatedAt = values.updated_at;
    
    // Delete redundant fields
    delete values.created_at;
    delete values.updated_at;
    
    return values;
  };

  return SetlistSong;
};