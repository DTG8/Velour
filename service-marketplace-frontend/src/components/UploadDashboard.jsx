import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, Film } from 'lucide-react';
import { api } from '../lib/api';

export default function UploadDashboard() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/*': ['.mp4', '.mov', '.webm']
    }
  });

  const removeFile = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name));
  };

  const handleUpload = async () => {
    setUploading(true);
    setStatus(null);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        await api.uploadMedia(formData);
      }
      
      setStatus('success');
      setFiles([]);
      // Trigger a gallery refresh if needed (currently relies on parent refetch)
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isDragActive ? 'border-gold bg-gold/5 scale-[0.99]' : 'border-border bg-charcoal/30 hover:border-gold/30 hover:bg-charcoal/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-void border border-border flex items-center justify-center text-ash group-hover:text-gold transition-colors">
            <Upload size={20} />
          </div>
          <div>
            <p className="text-silver font-medium text-sm">
              {isDragActive ? 'Drop files here…' : 'Add media to your catalogue'}
            </p>
            <p className="text-ash text-xs mt-1">Images (JPG, PNG) or Videos (MP4)</p>
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-3 gap-3"
          >
            {files.map((file) => (
              <div key={file.name} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-charcoal">
                {file.type.startsWith('image') ? (
                   <img src={file.preview} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-ash bg-void">
                     <Film size={24} />
                     <span className="text-[8px] mt-1 truncate px-2 w-full text-center">{file.name}</span>
                   </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex-1">
          <AnimatePresence>
            {status === 'success' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle2 size={12} /> Uploaded
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                <AlertCircle size={12} /> Failed
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFiles([])}
            disabled={files.length === 0 || uploading}
            className="text-[10px] uppercase tracking-widest font-bold text-ash hover:text-silver disabled:opacity-30"
          >
            Clear
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="btn-gold text-[10px] px-6 py-2 min-w-[100px]"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : `UPLOAD ${files.length}`}
          </button>
        </div>
      </div>
    </div>
  );
}
