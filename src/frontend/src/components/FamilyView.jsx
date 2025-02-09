import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import ImageMarker from 'react-image-marker';
import { Upload } from 'lucide-react';

// --- TagPopup component ---
// This component renders a popup (via a portal) at the marker position,
// allowing you to select a tag type (only "person" in this example) and enter a name.
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
        zIndex: 1000,
      }}
    >
      <div style={{ marginBottom: '8px', textAlign: 'center', fontWeight: 'bold' }}>
        Select Tag Type
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '8px' }}>
        <button onClick={() => setSelectedTagType('person')}>Person</button>
      </div>
      <input
        type="text"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        placeholder="Enter name"
        style={{ width: '100%', padding: '4px', marginBottom: '8px' }}
      />
      <button
        onClick={handleTagSubmit}
        style={{
          width: '100%',
          padding: '4px',
          backgroundColor: 'blue',
          color: 'white',
        }}
      >
        Submit Tag
      </button>
    </div>,
    document.body
  );
};

// --- CustomMarker component ---
// Displays a small blue dot at the marker location.
// A defensive check ensures that if marker is undefined, nothing is rendered.
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

// --- Main FamilyView component ---
const FamilyView = () => {
  // Workflow states:
  // - uploadedPhotos holds an array of photo objects.
  // - uploadComplete is true once photos are uploaded.
  // - finalized is true once place & time have been provided.
  // - isTagging indicates whether we're in tagging mode for a specific photo.
  // - processComplete indicates that the overall process is finished.
  // - selectedPhotoIndex indicates which photo is currently being tagged.
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [processComplete, setProcessComplete] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  // Tagging states (for the image marker):
  const [popupMarker, setPopupMarker] = useState(null);
  const [showTagPopup, setShowTagPopup] = useState(false);
  const [selectedTagType, setSelectedTagType] = useState('');
  const [tagInput, setTagInput] = useState('');

  const fileInputRef = useRef(null);

  // --- 1. File Upload ---
  // Users can upload photos (only once). Once photos are selected, the file input is hidden.
  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    if (uploadComplete) return; // prevent re-uploading

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
    event.target.value = ''; // reset file input
  };

  // --- 2. Finalize Upload (Place & Time) ---
  // Users enter the place and time for each photo.
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

  // --- 3. Tagging ---
  // When a user clicks the "Tag the people" button, we enter tagging mode.
  const handleEditTags = (index) => {
    setSelectedPhotoIndex(index);
    setIsTagging(true);
  };

  // When the user clicks on the image in tagging mode, this function is called
  // to add a marker.
  const handleAddMarker = (marker) => {
    console.log('Marker added (percentages):', marker);
    setPopupMarker(marker);
    setShowTagPopup(true);
  };

  // When the user clicks "Submit Tag" in the popup, add the tag to the current photo.
  const handleTagSubmit = () => {
    if (!tagInput || !selectedTagType) return;
    setUploadedPhotos((prevPhotos) => {
      const updatedPhotos = [...prevPhotos];
      const currentPhoto = updatedPhotos[selectedPhotoIndex];
      // Generate a unique tag ID by combining Date.now() with a random number.
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
    // Clear popup state so that the popup disappears.
    setShowTagPopup(false);
    setPopupMarker(null);
    setTagInput('');
    setSelectedTagType('');
  };

  // When the user clicks "Upload & Finish" in the tagging view, mark the process complete.
  const handleFinishProcess = () => {
    setProcessComplete(true);
  };

  // --- Render Sections ---

  // 1. File Upload Section
  const renderUploadSection = () => (
    <div style={{ padding: '16px' }}>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          <span>Upload Photo(s)</span>
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'center',
              padding: '24px',
              border: '2px dashed #ccc',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <div style={{ textAlign: 'center' }}>
              <Upload style={{ height: 48, width: 48, color: '#ccc' }} />
              <div style={{ color: '#666' }}>
                <span style={{ color: 'blue' }}>Click to upload</span>
              </div>
              <p style={{ fontSize: '12px', color: '#999' }}>
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </label>
      </form>
    </div>
  );

  // 2. Finalization Section (Place & Time)
  // This view shows each uploaded photo with inputs for Place and Time.
  // It also displays (optionally) any submitted tags below the image.
  const renderFinalizationView = () => (
    <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
      <h3>Finalize Upload: Provide Place and Time</h3>
      {uploadedPhotos.map((photo, index) => (
        <div
          key={photo.id}
          style={{
            marginBottom: '24px',
            border: '1px solid #ccc',
            padding: '8px',
            borderRadius: '8px',
          }}
        >
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
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Place"
              value={photo.place}
              onChange={(e) => handlePlaceChange(index, e.target.value)}
              disabled={finalized}
              style={{ flex: 1, padding: '4px' }}
            />
            <input
              type="text"
              placeholder="Time"
              value={photo.time}
              onChange={(e) => handleTimeChange(index, e.target.value)}
              disabled={finalized}
              style={{ flex: 1, padding: '4px' }}
            />
          </div>
          <div style={{ marginTop: '8px' }}>
            {finalized ? (
              <button
                onClick={() => handleEditTags(index)}
                style={{
                  padding: '8px',
                  background: 'blue',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Tag the people
              </button>
            ) : (
              index === 0 && (
                <button
                  onClick={handleFinalizeUpload}
                  style={{
                    padding: '8px',
                    background: 'green',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Finalize Upload
                </button>
              )
            )}
          </div>
          {/* Optional: Display tag list in finalization view */}
          {photo.tags.length > 0 && (
            <div
              style={{
                marginTop: '8px',
                background: '#f0f0f0',
                padding: '8px',
                borderRadius: '4px',
              }}
            >
              <h4>Tagged People:</h4>
              <ul>
                {photo.tags
                  .filter((tag) => tag.type === 'person')
                  .map((tag) => (
                    <li key={tag.id}>{tag.name}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 3. Tagging View
  // In tagging mode, the selected photo is shown with markers.
  // Below the image, a list of submitted tag names (for type "person") is rendered.
  // A button ("Upload & Finish") completes the process.
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
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
        <div
          style={{
            padding: '16px',
            background: 'white',
            borderBottom: '1px solid #ccc',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <h2>Tag Image</h2>
          <span>
            Photo {selectedPhotoIndex + 1} of {uploadedPhotos.length}
          </span>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
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
        </div>
        <div style={{ padding: '16px', background: '#f9f9f9' }}>
          <h3>Tagged People:</h3>
          <ul>
            {currentPhoto.tags
              .filter((tag) => tag.type === 'person')
              .map((tag) => (
                <li key={tag.id}>{tag.name}</li>
              ))}
          </ul>
        </div>
        <div style={{ padding: '8px', textAlign: 'center' }}>
          <button
            onClick={handleFinishProcess}
            style={{
              padding: '8px 16px',
              background: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Upload & Finish
          </button>
        </div>
      </div>
    );
  };

  // Final screen after the process is complete.
  const renderFinalScreen = () => (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <h2>Upload Complete!</h2>
      <p>Your photos and tags have been successfully uploaded.</p>
    </div>
  );

  // --- Main render logic ---
  if (!uploadComplete) {
    return <div>{renderUploadSection()}</div>;
  } else if (!finalized) {
    return <div>{renderFinalizationView()}</div>;
  } else if (isTagging) {
    return <div>{renderTaggingView()}</div>;
  } else if (processComplete) {
    return <div>{renderFinalScreen()}</div>;
  } else {
    // Default: show finalization view with "Tag the people" buttons.
    return <div>{renderFinalizationView()}</div>;
  }
};

export default FamilyView;
