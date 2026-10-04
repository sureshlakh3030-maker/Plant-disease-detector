import { useState, useRef } from 'react';
import { Upload, X, Search } from 'lucide-react';

const ImageUpload = ({ onPredict, loading }) => {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size too large (Max 5MB)");
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
       // Manual trigger for file change logic
       const dataTransfer = new DataTransfer();
       dataTransfer.items.add(droppedFile);
       fileInputRef.current.files = dataTransfer.files;
       handleFileChange({ target: { files: dataTransfer.files } });
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div 
        className={`relative border-2 border-dashed rounded-3xl transition-all duration-300 ${
          preview ? 'border-primary-500/50 bg-primary-50' : 'border-[#cbd7cd] hover:border-primary-500/60 bg-[#f8faf7]'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className="hidden" 
          onChange={handleFileChange} 
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/jpg"
        />

        {preview ? (
          <div className="relative p-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-80 object-cover rounded-2xl shadow-2xl"
            />
            <button 
              onClick={clearFile}
              className="absolute top-6 right-6 p-2 bg-white/90 text-[#26372c] shadow rounded-full hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center py-20 cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 text-primary-700">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#26372c]">Drop your leaf image here</h3>
            <p className="text-[#718076] text-sm">PNG, JPG or JPEG up to 5MB</p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => onPredict(file)}
          disabled={!file || loading}
          className={`group relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 flex items-center gap-2 ${
            !file || loading 
              ? 'bg-[#e8ede8] text-[#879188] cursor-not-allowed' 
              : 'bg-primary-700 hover:bg-primary-800 text-white shadow-[0_8px_20px_rgba(36,83,55,0.18)]'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>Identify Disease</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
