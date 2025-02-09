import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trophy, MapPin, Calendar } from 'lucide-react';
import { supabase } from '../backendSecretKey';

const FamilyView = () => {
  const [familyTab, setFamilyTab] = useState('upload');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [taggingStep, setTaggingStep] = useState('people');
  const [tagPosition, setTagPosition] = useState(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagTypeModal, setShowTagTypeModal] = useState(false);
  const [selectedTagType, setSelectedTagType] = useState('');
  const fileInputRef = useRef(null);

  const suggestedPeople = ['Sarah', 'John', 'Emily', 'Mike', 'Lisa'];
  const suggestedPlaces = ['Home', 'Park', 'Beach', 'Restaurant', 'Garden'];
  const suggestedEvents = ['Birthday', 'Wedding', 'Vacation', 'Holiday', 'Family Gathering'];

  const mockImages = [
    {
      id: '1',
      preview:
        'https://b2295247.smushcdn.com/2295247/wp-content/uploads/2019/08/Boston-Family-Photographer-Larz-Anderson-Park_0036.jpg?lossy=1&strip=1&webp=1',
      tags: { people: ['Sarah', 'John'], other: [], place: 'Home', event: 'Birthday' },
    },
    {
      id: '2',
      preview:
        'https://b2295247.smushcdn.com/2295247/wp-content/uploads/2019/08/Boston-Family-Photographer-Larz-Anderson-Park_0036.jpg?lossy=1&strip=1&webp=1',
      tags: { people: ['Emily', 'Mike'], other: [], place: 'Park', event: 'Vacation' },
    },
  ];

  useEffect(() => {
    const fetchImages = async () => {
      setUploadedPhotos(mockImages);
    };
    fetchImages();
  }, []);

  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files) return;
    const newPhotos = await Promise.all(
      Array.from(files).map(async (file) => {
        const filePath = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage.from('test').upload(filePath, file);
        if (error) {
          console.error('Upload error:', error);
          return null;
        }
        const { data: urlData, error: urlError } = supabase.storage.from('test').getPublicUrl(filePath);
        if (urlError) {
          console.error('Error getting public URL:', urlError);
        }
        const publicUrl = urlData?.publicUrl;
        console.log('Retrieved public URL:', publicUrl);
        const { data: insertData, error: insertError } = await supabase
          .from('ImageTags')
          .insert([{ ImageUrl: publicUrl, tags: { people: [], other: [], place: '', event: '' } }]);
        if (insertError) {
          console.error('Error inserting into ImageTags:', insertError);
        } else {
          console.log('Inserted into ImageTags:', insertData);
        }
        return {
          id: filePath,
          file,
          preview: publicUrl,
          tags: { people: [], other: [], place: '', event: '' },
        };
      })
    );
    const filteredPhotos = newPhotos.filter((photo) => photo !== null);
    setUploadedPhotos(filteredPhotos);
    setCurrentPhotoIndex(0);
  };

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (taggingStep === 'people') {
      setTagPosition({ x, y });
      setShowTagTypeModal(true);
    }
  };

  const handleTagSubmit = async () => {
    if (!tagInput) return;
    const updatedPhotos = [...uploadedPhotos];
    const currentPhoto = updatedPhotos[currentPhotoIndex];
    if (selectedTagType === 'people') {
      currentPhoto.tags.people.push({ id: Date.now().toString(), name: tagInput, x: tagPosition.x, y: tagPosition.y });
    } else if (selectedTagType === 'other') {
      currentPhoto.tags.other.push({ id: Date.now().toString(), text: tagInput, x: tagPosition.x, y: tagPosition.y });
    }
    const updatedTags = currentPhoto.tags;
    const { data, error } = await supabase
      .from('ImageTags')
      .update({ tags: updatedTags })
      .eq('ImageUrl', currentPhoto.preview);
    if (error) {
      console.error('Error updating tag in ImageTags:', error);
    } else {
      console.log('Tag updated in ImageTags:', data);
      setUploadedPhotos(updatedPhotos);
    }
    setShowTagInput(false);
    setTagPosition(null);
    setTagInput('');
    setSelectedTagType('');
  };

  const handlePlaceSubmit = (place) => {
    const updatedPhotos = [...uploadedPhotos];
    updatedPhotos[currentPhotoIndex].tags.place = place;
    setUploadedPhotos(updatedPhotos);
    setTaggingStep('event');
  };

  const handleEventSubmit = (eventName) => {
    const updatedPhotos = [...uploadedPhotos];
    updatedPhotos[currentPhotoIndex].tags.event = eventName;
    setUploadedPhotos(updatedPhotos);
    setTaggingStep(null);
    if (currentPhotoIndex < uploadedPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
      setTaggingStep('people');
    }
  };

  const renderTaggingInterface = () => {
    const currentPhoto = uploadedPhotos[currentPhotoIndex];
    if (!currentPhoto) return null;
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="p-4 bg-white border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {taggingStep === 'people' && 'Tag People'}
              {taggingStep === 'place' && 'Add Location'}
              {taggingStep === 'event' && 'Add Event'}
              {taggingStep === 'coordinate' && 'Tag Coordinate'}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Photo {currentPhotoIndex + 1} of {uploadedPhotos.length}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto relative">
          <img src={currentPhoto.preview} alt="Upload preview" className="w-full h-auto" onClick={handleImageClick} />
          {taggingStep === 'people' &&
            currentPhoto.tags.people &&
            currentPhoto.tags.people.map((tag) => (
              <div key={tag.id} className="absolute w-2 h-2 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2" style={{ left: `${tag.x}%`, top: `${tag.y}%` }}>
                <span className="absolute left-2 top-2 bg-black/75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">{tag.name}</span>
              </div>
            ))}
          {showTagTypeModal && (
            <div className="absolute bg-white rounded-lg shadow-lg p-4 w-64 -translate-x-1/2" style={{ left: `${tagPosition.x}%`, top: `${tagPosition.y}%` }}>
              <div className="mb-4 text-center font-semibold">Select Tag Type</div>
              <div className="flex justify-around">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() => {
                    setSelectedTagType('people');
                    setShowTagTypeModal(false);
                    setShowTagInput(true);
                  }}
                >
                  People Tag
                </button>
                <button
                  className="px-3 py-1 bg-green-500 text-white rounded"
                  onClick={() => {
                    setSelectedTagType('other');
                    setShowTagTypeModal(false);
                    setShowTagInput(true);
                  }}
                >
                  Other Tag
                </button>
              </div>
            </div>
          )}
          {showTagInput && tagPosition && (
            <div className="absolute bg-white rounded-lg shadow-lg p-4 w-64 -translate-x-1/2" style={{ left: `${tagPosition.x}%`, top: `${tagPosition.y}%` }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter tag caption"
                className="w-full p-2 border rounded-md"
              />
              <button onClick={handleTagSubmit} className="mt-2 w-full py-2 bg-blue-600 text-white rounded">
                Submit Tag
              </button>
            </div>
          )}
        </div>
        <div className="p-4 bg-white border-t">
          {taggingStep === 'people' && (
            <button onClick={() => setTaggingStep('place')} className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium">
              Next: Add Location
            </button>
          )}
          {taggingStep === 'place' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Add a location..." className="flex-1 p-2 border rounded-md" onChange={(e) => {}} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {suggestedPlaces.map((place) => (
                  <button key={place} onClick={() => handlePlaceSubmit(place)} className="p-2 border rounded-md hover:bg-gray-50">
                    {place}
                  </button>
                ))}
              </div>
            </div>
          )}
          {taggingStep === 'event' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input type="text" placeholder="What event is this?" className="flex-1 p-2 border rounded-md" onChange={(e) => {}} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {suggestedEvents.map((eventName) => (
                  <button key={eventName} onClick={() => handleEventSubmit(eventName)} className="p-2 border rounded-md hover:bg-gray-50">
                    {eventName}
                  </button>
                ))}
              </div>
            </div>
          )}
          {taggingStep !== 'coordinate' && (
            <button onClick={() => setTaggingStep('coordinate')} className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium mt-4">
              Tag Coordinate
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderUploadTab = () => {
    if (taggingStep !== null) return renderTaggingInterface();
    return (
      <div className="p-4 h-[calc(100vh-4rem)] overflow-y-auto">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700 text-lg font-medium">Upload Photos</span>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                <div className="space-y-2 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="text-gray-600">
                    <span className="text-blue-500 hover:text-blue-600">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                </div>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
        </form>
        {uploadedPhotos.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recently Uploaded</h3>
            <div className="grid grid-cols-2 gap-4">
              {uploadedPhotos.map((photo, index) => (
                <div key={photo.id} className="relative" style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '0.5rem' }}>
                  <img src={photo.preview} alt={`Upload ${index + 1}`} className="w-full h-40 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <button onClick={() => { setCurrentPhotoIndex(index); setTaggingStep('people'); }} className="px-4 py-2 bg-white rounded-lg text-sm font-medium">
                      Edit Tags
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProgressTab = () => {
    return (
      <div className="p-4 h-[calc(100vh-4rem)] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Progress</h3>
        <p className="text-gray-700">Progress information goes here...</p>
      </div>
    );
  };

  return (
    <div className="h-full">
      {familyTab === 'upload' ? renderUploadTab() : renderProgressTab()}
      <nav className="bg-white border-t border-gray-200">
        <div className="flex justify-around">
          <button onClick={() => { setFamilyTab('upload'); setTaggingStep(null); }} className={`flex-1 flex flex-col items-center py-3 ${familyTab === 'upload' ? 'text-blue-600' : 'text-gray-600'}`}>
            <Upload className="h-6 w-6" />
            <span className="text-xs mt-1">Upload</span>
          </button>
          <button onClick={() => setFamilyTab('progress')} className={`flex-1 flex flex-col items-center py-3 ${familyTab === 'progress' ? 'text-blue-600' : 'text-gray-600'}`}>
            <Trophy className="h-6 w-6" />
            <span className="text-xs mt-1">Progress</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default FamilyView;
