import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import ImageMarker from 'react-image-marker';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';
import Dashboard from './Dashboard';
// ------------------------------
// TagPopup Component
// ------------------------------
const TagPopup = ({
  marker,
  selectedTagType,
  setSelectedTagType,
  tagInput,
  setTagInput,
  handleTagSubmit,
}) => {
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'absolute',
        left: `${marker.left}%`,
        top: `${marker.top}%`,
        transform: 'translate(-50%, -100%)',
        background: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        zIndex: 1000,
        minWidth: '120px',
      }}
    >
      <Typography variant="subtitle2" sx={{ textAlign: 'center', fontWeight: 'bold', mb: 1 }}>
        Select Tag Type
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Button
          size="small"
          variant={selectedTagType === 'person' ? 'contained' : 'outlined'}
          onClick={() => setSelectedTagType('person')}
        >
          Person
        </Button>
      </Box>
      <input
        type="text"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        placeholder="Enter name"
        style={{
          width: '100%',
          padding: '4px',
          marginBottom: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      <Button
        onClick={handleTagSubmit}
        variant="contained"
        style={{ width: '100%', padding: '4px', backgroundColor: 'blue', color: 'white' }}
      >
        Submit Tag
      </Button>
    </div>,
    document.body
  );
};

// ------------------------------
// CustomMarker Component
// ------------------------------
const CustomMarker = ({ marker }) => {
  if (!marker) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: 'translate(-50%, -50%)',
        width: '12px',
        height: '12px',
        backgroundColor: 'blue',
        borderRadius: '50%',
      }}
      title={marker.name || ''}
    />
  );
};

// ------------------------------
// FamilyView Component
// ------------------------------
const FamilyView = () => {
  const navigate = useNavigate();

  // Workflow States
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [processComplete, setProcessComplete] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  // Tagging States
  const [popupMarker, setPopupMarker] = useState(null);
  const [showTagPopup, setShowTagPopup] = useState(false);
  const [selectedTagType, setSelectedTagType] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Ref for file input
  const fileInputRef = useRef(null);

  // ------------------------------
  // 1. File Upload (Only once)
  // ------------------------------
  const handleFileSelect = async (event) => {
    if (uploadComplete) return; // Prevent re-uploading
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newPhotos = await Promise.all(
      Array.from(files).map(async (file) => {
        const filePath = `${Date.now()}_${file.name}`;
        const publicUrl = URL.createObjectURL(file);
        return {
          id: filePath,
          file,
          preview: publicUrl,
          tags: [],
          place: '',
          time: '',
        };
      })
    );
    setUploadedPhotos(newPhotos);
    setUploadComplete(true);
    event.target.value = ''; // Reset file input
  };

  // ------------------------------
  // 2. Finalization (Place & Time)
  // ------------------------------
  const handlePlaceChange = (index, newPlace) => {
    setUploadedPhotos((prevPhotos) => {
      const updatedPhotos = [...prevPhotos];
      updatedPhotos[index] = { ...updatedPhotos[index], place: newPlace };
      return updatedPhotos;
    });
  };

  const handleTimeChange = (index, newTime) => {
    setUploadedPhotos((prevPhotos) => {
      const updatedPhotos = [...prevPhotos];
      updatedPhotos[index] = { ...updatedPhotos[index], time: newTime };
      return updatedPhotos;
    });
  };

  const handleFinalizeUpload = () => {
    setFinalized(true);
  };

  // ------------------------------
  // 3. Tagging Functions
  // ------------------------------
  const handleEditTags = (index) => {
    setSelectedPhotoIndex(index);
    setIsTagging(true);
  };

  const handleAddMarker = (marker) => {
    setPopupMarker(marker);
    setShowTagPopup(true);
  };

  const handleTagSubmit = () => {
    if (!tagInput || !selectedTagType) return;
    setUploadedPhotos((prevPhotos) => {
      const updatedPhotos = [...prevPhotos];
      const currentPhoto = updatedPhotos[selectedPhotoIndex];
      const newTag = {
        id: `${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        type: selectedTagType,
        name: tagInput,
        x: popupMarker.left,
        y: popupMarker.top,
      };
      currentPhoto.tags.push(newTag);
      return updatedPhotos;
    });
    // Clear popup state
    setShowTagPopup(false);
    setPopupMarker(null);
    setTagInput('');
    setSelectedTagType('');
  };

  const handleFinishProcess = () => {
    setIsTagging(false); // Close tagging view
    setProcessComplete(true);
  };

  const handleBackToFinalization = () => {
    setIsTagging(false);
    setSelectedPhotoIndex(null);
  };

  // ------------------------------
  // Render Helper Functions
  // ------------------------------
  const renderHiddenFileInput = () => (
    <input
      ref={fileInputRef}
      type="file"
      multiple
      accept="image/*"
      onChange={handleFileSelect}
      style={{ display: 'none' }}
    />
  );

  const renderUploadSection = () => (
    <Box sx={{ p: 2 }}>
      <form onSubmit={(e) => e.preventDefault()}>
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          Upload Photo(s)
        </Typography>
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'center',
            p: 3,
            border: '2px dashed #ccc',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Upload size={48} color="#ccc" />
            <Typography sx={{ color: 'blue', mt: 1 }}>Click to upload</Typography>
            <Typography variant="caption" sx={{ color: '#999' }}>
              PNG, JPG, GIF up to 10MB each
            </Typography>
          </Box>
        </Box>
      </form>
    </Box>
  );

  const renderFinalizationView = () => (
    <Box
      sx={{
        p: 2,
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 100px)',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Finalize Upload: Provide Place and Time
      </Typography>
      {uploadedPhotos.map((photo, index) => (
        <Paper key={photo.id} elevation={2} sx={{ mb: 3, p: 2, borderRadius: '8px' }}>
          <img
            src={photo.preview}
            alt={`Photo ${index + 1}`}
            style={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
            <input
              type="text"
              placeholder="Place"
              value={photo.place}
              onChange={(e) => handlePlaceChange(index, e.target.value)}
              disabled={finalized}
              style={{ flex: 1, padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
            <input
              type="text"
              placeholder="Time"
              value={photo.time}
              onChange={(e) => handleTimeChange(index, e.target.value)}
              disabled={finalized}
              style={{ flex: 1, padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </Box>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {finalized ? (
              <Button
                variant="contained"
                onClick={() => handleEditTags(index)}
                sx={{ backgroundColor: 'blue', color: 'white' }}
              >
                Tag the people
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleFinalizeUpload}
                sx={{ backgroundColor: 'green', color: 'white' }}
              >
                Finalize Upload
              </Button>
            )}
          </Box>
          {photo.tags.length > 0 && (
            <Box sx={{ mt: 2, p: 1, backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
              <Typography variant="subtitle2">Tagged People:</Typography>
              <ul>
                {photo.tags
                  .filter((tag) => tag.type === 'person')
                  .map((tag) => (
                    <li key={tag.id}>{tag.name}</li>
                  ))}
              </ul>
            </Box>
          )}
        </Paper>
      ))}
    </Box>
  );

  const renderTaggingView = () => {
    const currentPhoto = uploadedPhotos[selectedPhotoIndex];
    if (!currentPhoto) return null;

    const markers = currentPhoto.tags
      .filter((tag) => tag.x !== undefined && tag.y !== undefined)
      .map((tag) => ({
        top: tag.y,
        left: tag.x,
        id: tag.id,
        name: tag.name,
      }));

    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
        <Box
          sx={{
            p: 2,
            backgroundColor: 'white',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={handleBackToFinalization}
            variant="outlined"
            size="small"
            sx={{
              textTransform: 'none',
              borderColor: '#ccc',
              color: '#333',
            }}
          >
            Back
          </Button>
          <Typography variant="h6">Tag Image</Typography>
          <Typography variant="subtitle2">
            Photo {selectedPhotoIndex + 1} of {uploadedPhotos.length}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, position: 'relative' }}>
          <ImageMarker
            src={currentPhoto.preview}
            markers={markers}
            onAddMarker={handleAddMarker}
            markerComponent={({ marker }) => <CustomMarker marker={marker} />}
          />
          {showTagPopup && popupMarker && (
            <TagPopup
              marker={popupMarker}
              selectedTagType={selectedTagType}
              setSelectedTagType={setSelectedTagType}
              tagInput={tagInput}
              setTagInput={setTagInput}
              handleTagSubmit={handleTagSubmit}
            />
          )}
        </Box>
        <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderTop: '1px solid #ccc' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Tagged People:
          </Typography>
          <ul>
            {currentPhoto.tags
              .filter((tag) => tag.type === 'person')
              .map((tag) => (
                <li key={tag.id}>{tag.name}</li>
              ))}
          </ul>
          <Button
            variant="contained"
            onClick={handleFinishProcess}
            sx={{
              backgroundColor: 'blue',
              color: 'white',
              mt: 2,
              width: '100%',
              textTransform: 'none',
            }}
          >
            Upload & Finish
          </Button>
        </Box>
      </Box>
    );
  };

  const renderFinalScreen = () => (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h5">Upload Complete!</Typography>
      <Typography variant="body1" sx={{ mt: 1 }}>
        Your photos and tags have been successfully uploaded.
      </Typography>
    </Box>
  );

  // ------------------------------
  // Bottom Dashboard Component
  // ------------------------------

  // ------------------------------
  // Main Render Logic
  // ------------------------------
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        pb: '70px', // Extra bottom padding for the dashboard
        backgroundColor: '#fff',
        // CSS media query for mobile styling
        '@media (max-width:600px)': {
          fontSize: '0.9rem',
        },
      }}
    >
      {renderHiddenFileInput()}
      {!uploadComplete && renderUploadSection()}
      {uploadComplete && !finalized && renderFinalizationView()}
      {uploadComplete && finalized && isTagging && renderTaggingView()}
      {uploadComplete && finalized && processComplete && renderFinalScreen()}
      {/* If finalized but not tagging or finished, show finalization view */}
      {uploadComplete && finalized && !isTagging && !processComplete && renderFinalizationView()}
      <Dashboard />
    </Box>
  );
};

export default FamilyView;
