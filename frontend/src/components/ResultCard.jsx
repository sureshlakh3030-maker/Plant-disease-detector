import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle, Info, Stethoscope, Leaf } from 'lucide-react';

const ResultCard = ({ prediction, loading }) => {
  if (loading) {
    return (
      <div className="glass-card p-8 md:p-12 animate-pulse">
        <div className="h-8 bg-[#e8ede8] rounded-lg w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-[#e8ede8] rounded w-full"></div>
          <div className="h-4 bg-[#e8ede8] rounded w-full"></div>
          <div className="h-20 bg-[#e8ede8] rounded-xl w-full mt-8"></div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const isHealthy = prediction.status === "Healthy";

  return (
    <div className="glass-card overflow-hidden relative">
      <div className={`h-1 w-full ${isHealthy ? 'bg-primary-500' : 'bg-amber-500'}`} />
      
      <div className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {isHealthy ? (
                  <CheckCircle className="w-6 h-6 text-primary-600" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-amber-600" />
                )}
                <span className={`text-sm font-bold uppercase tracking-widest ${isHealthy ? 'text-primary-700' : 'text-amber-700'}`}>
                  {prediction.status} Detected
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">{prediction.disease}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-[#f7f9f6] p-4 rounded-xl border border-[#e5ebe5]">
                  <div className="text-[#718076] text-xs mb-1 uppercase font-semibold">Confidence Score</div>
                 <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-primary-700">{prediction.confidence}</span>
                    <div className="flex-1 h-2 bg-[#dfe7df] rounded-full mb-2 overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: prediction.confidence }}
                        className="h-full bg-primary-600" 
                       />
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-[#e7f1f0] rounded-lg">
                  <Info className="w-4 h-4 text-[#477a75]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#26372c] mb-1">Description</h4>
                  <p className="text-[#64736a] text-sm leading-relaxed">{prediction.description}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-amber-50 rounded-lg">
                  <Stethoscope className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#26372c] mb-1">Recommended Treatment</h4>
                  <p className="text-[#64736a] text-sm leading-relaxed">{prediction.treatment}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-64 flex-shrink-0">
             <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 text-center">
               <div className="w-16 h-16 bg-primary-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                   <Leaf className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-[#536258] font-medium italic">
                  "Early detection is the key to sustainable farming."
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
