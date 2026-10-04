import { useState } from 'react';
import { Leaf, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from './components/ImageUpload';
import ResultCard from './components/ResultCard';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async (file) => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPrediction(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to predict. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f2] text-[#1c2b22] selection:bg-primary-200">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_rgba(62,128,85,0.08),_transparent_55%)]" />

      <nav className="relative z-10 border-b border-[#dfe7df] bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl">Plant Disease <span className="text-primary-700">Detector</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#64736a]">
            <a href="#" className="hover:text-primary-700 transition-colors">Home</a>
            <a href="#" className="hover:text-primary-700 transition-colors">How it works</a>
            <a href="#" className="hover:text-primary-700 transition-colors">Dataset</a>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#d8e5d9] text-primary-800 text-sm mb-6 shadow-sm"
          >
            <Zap className="w-4 h-4" />
            <span>AI-Powered Crop Diagnostics</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            Detect Plant Diseases <br />
            <span className="gradient-text">Instantly with AI.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#64736a] text-lg max-w-2xl mx-auto"
          >
            Upload a photo of your crop leaf and our deep learning model will identify 
            diseases with high precision, providing you with instant treatment recommendations.
          </motion.p>
        </div>

        {/* Upload & Result Container */}
        <div className="grid grid-cols-1 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 md:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <ShieldCheck className="w-32 h-32 text-primary-500" />
            </div>
            
            <ImageUpload onPredict={handlePredict} loading={loading} />
            
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence>
            {(prediction || loading) && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full"
              >
                <ResultCard prediction={prediction} loading={loading} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="border-t border-[#dfe7df] py-10 text-center text-[#758178] text-sm">
        <p>© 2026 Plant Disease Detector. Agricultural diagnostics powered by AI.</p>
      </footer>
    </div>
  );
}

export default App;
