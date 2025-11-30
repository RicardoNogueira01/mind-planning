import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Upload, Camera, Sparkles, Image as ImageIcon } from 'lucide-react';

const ImageAnalyzerModal = ({ isOpen, onClose, onAnalyze }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
    
    try {
      // Simulate AI analysis - In production, this would call an AI API
      // like OpenAI Vision, Google Cloud Vision, or a custom model
      await simulateImageAnalysis(imagePreview);
      
      // Call the parent's analyze function with mock data
      const mockMindMapData = generateMockMindMapFromImage();
      onAnalyze(mockMindMapData);
      
      // Close modal
      handleClose();
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const simulateImageAnalysis = (imageData) => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  };

  const generateMockMindMapFromImage = () => {
    // This is mock data - in production, this would come from AI analysis
    // The AI would detect nodes, connections, text, and structure from the image
    return {
      centralNode: {
        text: 'Main Idea',
        bgColor: '#ffffff',
        fontColor: '#2d3748'
      },
      nodes: [
        { text: 'Branch 1', bgColor: '#EFF6FF', fontColor: '#1E40AF', relativePosition: { angle: 0, distance: 250 } },
        { text: 'Branch 2', bgColor: '#F0FDF4', fontColor: '#166534', relativePosition: { angle: 72, distance: 250 } },
        { text: 'Branch 3', bgColor: '#FEF3C7', fontColor: '#92400E', relativePosition: { angle: 144, distance: 250 } },
        { text: 'Branch 4', bgColor: '#FCE7F3', fontColor: '#9F1239', relativePosition: { angle: 216, distance: 250 } },
        { text: 'Branch 5', bgColor: '#EDE9FE', fontColor: '#6B21A8', relativePosition: { angle: 288, distance: 250 } }
      ]
    };
  };

  const handleClose = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setIsAnalyzing(false);
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

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
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
