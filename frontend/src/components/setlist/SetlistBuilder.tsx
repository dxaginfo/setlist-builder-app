import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  IconButton, 
  TextField, 
  Button,
  Paper,
  Divider,
  Chip,
  Grid
} from '@mui/material';
import {
  DragHandle as DragHandleIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  MusicNote as MusicNoteIcon,
  Save as SaveIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

// Define types
interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo: number;
  durationSeconds: number;
}

interface SetlistSong extends Song {
  notes: string;
  position: number;
}

interface SetlistBuilderProps {
  songs: Song[];
  initialSetlist?: SetlistSong[];
  onSave: (setlist: SetlistSong[]) => void;
}

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const SetlistBuilder: React.FC<SetlistBuilderProps> = ({ 
  songs, 
  initialSetlist = [], 
  onSave 
}) => {
  const [setlist, setSetlist] = useState<SetlistSong[]>(initialSetlist);
  const [setlistTitle, setSetlistTitle] = useState<string>('New Setlist');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Calculate total duration
  const totalDuration = setlist.reduce((total, song) => total + song.durationSeconds, 0);
  
  // Filter songs for the library
  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    if (result.source.droppableId === 'songLibrary' && result.destination.droppableId === 'setlist') {
      // Add from library to setlist
      const songId = result.draggableId;
      const song = songs.find(s => s.id === songId);
      
      if (song) {
        const newSetlistSong: SetlistSong = {
          ...song,
          notes: '',
          position: result.destination.index
        };
        
        const newSetlist = [...setlist];
        newSetlist.splice(result.destination.index, 0, newSetlistSong);
        
        // Update positions
        const updatedSetlist = newSetlist.map((song, index) => ({
          ...song,
          position: index
        }));
        
        setSetlist(updatedSetlist);
      }
    } else if (result.source.droppableId === 'setlist' && result.destination.droppableId === 'setlist') {
      // Reorder within setlist
      const newSetlist = [...setlist];
      const [movedItem] = newSetlist.splice(result.source.index, 1);
      newSetlist.splice(result.destination.index, 0, movedItem);
      
      // Update positions
      const updatedSetlist = newSetlist.map((song, index) => ({
        ...song,
        position: index
      }));
      
      setSetlist(updatedSetlist);
    }
  };

  // Remove song from setlist
  const removeSong = (index: number) => {
    const newSetlist = [...setlist];
    newSetlist.splice(index, 1);
    
    // Update positions
    const updatedSetlist = newSetlist.map((song, index) => ({
      ...song,
      position: index
    }));
    
    setSetlist(updatedSetlist);
  };

  // Update song notes
  const updateNotes = (index: number, notes: string) => {
    const newSetlist = [...setlist];
    newSetlist[index] = {
      ...newSetlist[index],
      notes
    };
    setSetlist(newSetlist);
  };

  // Save setlist
  const saveSetlist = () => {
    onSave(setlist);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Setlist Title"
          value={setlistTitle}
          onChange={(e) => setSetlistTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <AccessTimeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Total Duration: {formatDuration(totalDuration)}
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SaveIcon />}
            onClick={saveSetlist}
          >
            Save Setlist
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Song Library */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Song Library
            </Typography>
            
            <TextField
              fullWidth
              variant="outlined"
              label="Search Songs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="songLibrary">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {filteredSongs.map((song, index) => (
                        <Draggable key={song.id} draggableId={song.id} index={index}>
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ mb: 1, '&:hover': { boxShadow: 3 } }}
                            >
                              <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                                <Typography variant="body1" fontWeight="bold">{song.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{song.artist}</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                  <Chip size="small" label={`Key: ${song.key}`} />
                                  <Chip size="small" label={formatDuration(song.durationSeconds)} />
                                </Box>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Box>
          </Paper>
        </Grid>

        {/* Setlist */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Current Setlist
            </Typography>
            
            <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="setlist">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {setlist.length === 0 ? (
                        <Box sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
                          <MusicNoteIcon sx={{ fontSize: 40 }} />
                          <Typography>Drag songs here to build your setlist</Typography>
                        </Box>
                      ) : (
                        setlist.map((song, index) => (
                          <Draggable key={song.id} draggableId={`setlist-${song.id}-${index}`} index={index}>
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                sx={{ mb: 2, position: 'relative' }}
                              >
                                <Box
                                  {...provided.dragHandleProps}
                                  sx={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    left: 0, 
                                    height: '100%', 
                                    width: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'grey.100'
                                  }}
                                >
                                  <DragHandleIcon />
                                </Box>
                                
                                <CardContent sx={{ pl: 5 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                      <Typography variant="h6">{song.title}</Typography>
                                      <Typography variant="body2" color="text.secondary">{song.artist}</Typography>
                                      
                                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                        <Chip size="small" label={`Key: ${song.key}`} />
                                        <Chip size="small" label={`Tempo: ${song.tempo}`} />
                                        <Chip size="small" label={formatDuration(song.durationSeconds)} />
                                      </Box>
                                    </Box>
                                    
                                    <IconButton 
                                      color="error" 
                                      onClick={() => removeSong(index)}
                                      size="small"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                  
                                  <Divider sx={{ my: 2 }} />
                                  
                                  <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Notes"
                                    size="small"
                                    multiline
                                    rows={2}
                                    value={song.notes}
                                    onChange={(e) => updateNotes(index, e.target.value)}
                                  />
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SetlistBuilder;