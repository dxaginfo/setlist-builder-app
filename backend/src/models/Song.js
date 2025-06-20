'use strict';

module.exports = (sequelize, DataTypes) => {
  const Song = sequelize.define('Song', {
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
    artist: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tempo: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'duration_seconds'
    },
    lyricsUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'lyrics_url'
    },
    chordChartUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'chord_chart_url'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'songs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'idx_songs_title',
        fields: ['title']
      },
      {
        name: 'idx_songs_artist',
        fields: ['artist']
      }
    ]
  });

  Song.associate = (models) => {
    // A song belongs to a user (creator)
    Song.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'creator'
    });

    // Many-to-many relationship with tags
    Song.belongsToMany(models.Tag, {
      through: 'song_tags',
      foreignKey: 'song_id',
      as: 'tags'
    });

    // Many-to-many relationship with setlists
    Song.belongsToMany(models.Setlist, {
      through: models.SetlistSong,
      foreignKey: 'song_id',
      as: 'setlists'
    });
  };

  // Instance methods
  Song.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    
    // Format timestamps and field names to camelCase
    if (values.created_at) values.createdAt = values.created_at;
    if (values.updated_at) values.updatedAt = values.updated_at;
    if (values.duration_seconds) values.durationSeconds = values.duration_seconds;
    if (values.lyrics_url) values.lyricsUrl = values.lyrics_url;
    if (values.chord_chart_url) values.chordChartUrl = values.chord_chart_url;
    
    // Delete redundant fields
    delete values.created_at;
    delete values.updated_at;
    delete values.duration_seconds;
    delete values.lyrics_url;
    delete values.chord_chart_url;
    
    return values;
  };

  return Song;
};