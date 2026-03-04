'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, X, FileText, CheckCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  bucket: 'papers' | 'icons';
  onUploadComplete: (url: string) => void;
  label?: string;
  accept?: string;
  currentUrl?: string | null;
}

export default function FileUpload({ 
  bucket, 
  onUploadComplete, 
  label = 'Upload File', 
  accept = '.pdf',
  currentUrl
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setFileName(file.name);

      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 10);
      const filePath = `${randomId}-${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
      setFileName(null);
    } finally {
      setUploading(false);
    }
  }

  function clearFile() {
    setFileName(null);
    onUploadComplete('');
  }

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      
      <div className={`file-upload-zone ${uploading ? 'uploading' : ''}`}>
        {uploading ? (
          <div className="flex items-center gap-3 p-4">
            <Loader2 className="animate-spin text-accent-primary" size={24} />
            <span className="text-sm font-medium">Uploading {fileName}...</span>
          </div>
        ) : fileName || currentUrl ? (
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-primary/10 rounded-lg">
                <FileText size={20} className="text-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {fileName || 'Current File'}
                </p>
                <p className="text-xs text-text-muted">Upload successful</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={clearFile}
              className="p-1 hover:bg-white/10 rounded-full text-text-muted hover:text-danger transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-white/10 rounded-xl hover:border-accent-primary/40 hover:bg-white/5 cursor-pointer transition-all">
            <div className="p-3 bg-white/5 rounded-full">
              <Upload size={24} className="text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-text-muted mt-1">PDF, JPG, PNG (Max 50MB)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept={accept} 
              onChange={handleUpload}
            />
          </label>
        )}
      </div>

      {error && (
        <p className="text-xs text-danger mt-2 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}
    </div>
  );
}
