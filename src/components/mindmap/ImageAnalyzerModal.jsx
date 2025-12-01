import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Upload, Camera, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { analyzeImage } from '../../services/imageAnalysisService';

const ImageAnalyzerModal = ({ isOpen, onClose, onAnalyze }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Call the AI analysis service with the image
      const mindMapData = await analyzeImage(imagePreview);
      
      // Call the parent's analyze function with the extracted data
      onAnalyze(mindMapData);
      
      // Close modal
      handleClose();
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to analyze image. ';
      
      if (error.message.includes('403') || error.message.includes('API key')) {
        errorMessage += 'API key may be invalid or restricted. Please check your API key and ensure it has access to Gemini API.';
      } else if (error.message.includes('429')) {
        errorMessage += 'API rate limit exceeded. Please wait a moment and try again.';
      } else if (error.message.includes('400')) {
        errorMessage += 'Invalid request. The image format may not be supported.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage += 'Network error. Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Please try again or check the console for details.';
      }
      
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };



  const handleClose = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setIsAnalyzing(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Camera size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Mind Map Analyzer</h2>
              <p className="text-sm text-white/80">Upload a drawing or photo to create a mind map</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isAnalyzing}
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!imagePreview ? (
            // Upload Area
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                    <Upload size={32} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      Click to upload an image
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, or JPEG up to 10MB
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg group-hover:bg-indigo-700 transition-colors">
                    <ImageIcon size={16} />
                    <span className="text-sm font-medium">Choose File</span>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Sparkles size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">How it works:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Upload a hand-drawn mind map or photo</li>
                      <li>AI analyzes the structure and text</li>
                      <li>Automatically creates an editable digital mind map</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Preview & Analyze
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full h-auto max-h-96 object-contain bg-gray-50"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
                      <p className="text-white font-semibold">Analyzing image...</p>
                      <p className="text-white/80 text-sm mt-1">AI is detecting nodes and connections</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-900">
                      <p className="font-semibold mb-1">Analysis Failed</p>
                      <p className="text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    setError(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  disabled={isAnalyzing}
                >
                  Choose Different Image
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze & Create'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ImageAnalyzerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAnalyze: PropTypes.func.isRequired
};

export default ImageAnalyzerModal;
