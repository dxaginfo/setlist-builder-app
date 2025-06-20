'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profile_image_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create songs table
    await queryInterface.createTable('songs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      artist: {
        type: Sequelize.STRING,
        allowNull: false
      },
      key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tempo: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      duration_seconds: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      lyrics_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      chord_chart_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add indexes to songs
    await queryInterface.addIndex('songs', ['title']);
    await queryInterface.addIndex('songs', ['artist']);
    await queryInterface.addIndex('songs', ['user_id']);

    // Create tags table
    await queryInterface.createTable('tags', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create song_tags junction table
    await queryInterface.createTable('song_tags', {
      song_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'songs',
          key: 'id'
        },
        onDelete: 'CASCADE',
        primaryKey: true
      },
      tag_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tags',
          key: 'id'
        },
        onDelete: 'CASCADE',
        primaryKey: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create setlists table
    await queryInterface.createTable('setlists', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create setlist_songs junction table
    await queryInterface.createTable('setlist_songs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      setlist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'setlists',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      song_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'songs',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      position: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Add unique constraint to setlist_songs
    await queryInterface.addIndex('setlist_songs', ['setlist_id', 'song_id'], {
      unique: true
    });
    await queryInterface.addIndex('setlist_songs', ['setlist_id', 'position'], {
      unique: true
    });

    // Create performances table
    await queryInterface.createTable('performances', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      setlist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'setlists',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      venue_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      performance_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create collaborators table
    await queryInterface.createTable('collaborators', {
      setlist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'setlists',
          key: 'id'
        },
        onDelete: 'CASCADE',
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        primaryKey: true
      },
      permission_level: {
        type: Sequelize.ENUM('view', 'edit', 'admin'),
        defaultValue: 'view',
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order to avoid foreign key constraints
    await queryInterface.dropTable('collaborators');
    await queryInterface.dropTable('performances');
    await queryInterface.dropTable('setlist_songs');
    await queryInterface.dropTable('setlists');
    await queryInterface.dropTable('song_tags');
    await queryInterface.dropTable('tags');
    await queryInterface.dropTable('songs');
    await queryInterface.dropTable('users');
  }
};