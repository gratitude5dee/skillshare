import React, { useState, useCallback } from 'react';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface RecordingUploadProps {
  onUpload: (file: File, metadata: { title: string; description: string }) => void;
  onClose: () => void;
}

export function RecordingUpload({ onUpload, onClose }: RecordingUploadProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
    
    if (file.size > maxSize) {
      throw new Error('File size must be less than 100MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please upload a video file (MP4, WebM, MOV, or AVI)');
    }
    
    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    try {
      validateFile(file);
      setSelectedFile(file);
      
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch (error) {
      toast({
        title: "Invalid file",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [title, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a file and title.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(selectedFile, {
        title: title.trim(),
        description: description.trim()
      });

      setUploadProgress(100);
      
      toast({
        title: "Upload successful",
        description: "Your recording has been uploaded and is being processed.",
      });
      
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Screen Recording</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Drop Zone */}
          <Card
            className={`transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-dashed'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <CardContent className="p-6">
              {selectedFile ? (
                <div className="flex items-center gap-3">
                  <File className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Drop your recording here</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-input"
                  />
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="file-input" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    MP4, WebM, MOV, AVI up to 100MB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Data Entry Workflow"
                required
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this workflow does..."
                rows={3}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Info Card */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">AI Analysis</p>
                  <p className="text-muted-foreground">
                    Your recording will be analyzed by our AI to identify workflow steps 
                    and create automated actions. This process takes 1-3 minutes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || !title.trim() || isUploading}
              className="flex-1"
            >
              {isUploading ? 'Uploading...' : 'Upload & Analyze'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}