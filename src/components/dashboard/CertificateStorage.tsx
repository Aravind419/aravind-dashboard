
import { useState, useRef } from 'react';
import { Certificate, Upload, FileText, Image as ImageIcon, File, Film, Archive, Trash2, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useLocalStorage from '@/hooks/useLocalStorage';

interface CertificateFile {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  dataUrl: string;
  date: string;
}

type FileCategory = 'images' | 'documents' | 'other';

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
  if (fileType === 'application/pdf') return <FileText className="h-5 w-5" />;
  if (fileType.startsWith('video/')) return <Film className="h-5 w-5" />;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return <Archive className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
};

const getFileCategory = (fileType: string): FileCategory => {
  if (fileType.startsWith('image/')) return 'images';
  if (fileType === 'application/pdf' || 
      fileType.includes('word') || 
      fileType.includes('excel') || 
      fileType.includes('text')) return 'documents';
  return 'other';
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const CertificateStorage = () => {
  const [certificates, setCertificates] = useLocalStorage<CertificateFile[]>('certificates', []);
  const [title, setTitle] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };
  
  const processFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setPreviewImage(e.target.result);
        setCurrentFile(file);
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleSave = () => {
    if (!title.trim() || !currentFile || !previewImage) return;
    
    const newCertificate: CertificateFile = {
      id: crypto.randomUUID(),
      title: title.trim(),
      fileName: currentFile.name,
      fileType: currentFile.type,
      fileSize: currentFile.size,
      dataUrl: previewImage,
      date: new Date().toISOString(),
    };
    
    setCertificates([...certificates, newCertificate]);
    resetForm();
  };
  
  const handleDelete = (id: string) => {
    setCertificates(certificates.filter(cert => cert.id !== id));
    if (selectedCertificate?.id === id) {
      setSelectedCertificate(null);
    }
  };
  
  const downloadFile = (certificate: CertificateFile) => {
    const link = document.createElement('a');
    link.href = certificate.dataUrl;
    link.download = certificate.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const viewFile = (certificate: CertificateFile) => {
    setSelectedCertificate(certificate);
  };
  
  const resetForm = () => {
    setTitle('');
    setPreviewImage(null);
    setCurrentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Group certificates by category
  const imageFiles = certificates.filter(cert => getFileCategory(cert.fileType) === 'images');
  const documentFiles = certificates.filter(cert => getFileCategory(cert.fileType) === 'documents');
  const otherFiles = certificates.filter(cert => getFileCategory(cert.fileType) === 'other');
  
  return (
    <div className="dash-card">
      <div className="dash-card-title">
        <Certificate className="h-5 w-5" />
        <span>Certificate Storage</span>
      </div>
      
      <div className="mb-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {previewImage ? (
            <div className="space-y-4">
              <div className="relative max-w-xs mx-auto">
                {currentFile?.type.startsWith('image/') ? (
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-h-40 max-w-full mx-auto object-contain rounded"
                  />
                ) : (
                  <div className="p-4 bg-secondary/50 rounded flex items-center justify-center h-32">
                    {getFileIcon(currentFile?.type || '')}
                    <span className="ml-2">{currentFile?.name}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Input
                  placeholder="Enter certificate title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="max-w-md mx-auto"
                />
                
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button onClick={handleSave} disabled={!title.trim()}>Save Certificate</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-lg font-medium">Upload Certificate</p>
              <p className="text-sm text-muted-foreground mb-4">Drag and drop or click to browse</p>
              <p className="text-xs text-muted-foreground">Supported formats: PDF, PNG, JPG, JPEG</p>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,application/pdf"
            className="hidden"
          />
        </div>
      </div>
      
      {certificates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Certificate className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p>No certificates uploaded yet.</p>
          <p className="text-sm">Upload your certificates to store them securely.</p>
        </div>
      ) : (
        <>
          <Tabs defaultValue="all">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="all">All Files ({certificates.length})</TabsTrigger>
              <TabsTrigger value="images">Images ({imageFiles.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({documentFiles.length})</TabsTrigger>
              <TabsTrigger value="other">Other ({otherFiles.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-1">
              {renderFileList(certificates)}
            </TabsContent>
            
            <TabsContent value="images" className="space-y-1">
              {imageFiles.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No image files uploaded yet.</div>
              ) : (
                renderFileList(imageFiles)
              )}
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-1">
              {documentFiles.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No document files uploaded yet.</div>
              ) : (
                renderFileList(documentFiles)
              )}
            </TabsContent>
            
            <TabsContent value="other" className="space-y-1">
              {otherFiles.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No other files uploaded yet.</div>
              ) : (
                renderFileList(otherFiles)
              )}
            </TabsContent>
          </Tabs>
          
          {selectedCertificate && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="text-lg font-medium">{selectedCertificate.title}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedCertificate(null)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-6">
                  {selectedCertificate.fileType.startsWith('image/') ? (
                    <img 
                      src={selectedCertificate.dataUrl} 
                      alt={selectedCertificate.title}
                      className="max-w-full mx-auto"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="p-8 bg-secondary/30 rounded-lg flex flex-col items-center">
                        {getFileIcon(selectedCertificate.fileType)}
                        <p className="mt-2">{selectedCertificate.fileName}</p>
                        <Button 
                          onClick={() => downloadFile(selectedCertificate)}
                          className="mt-4"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download File
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedCertificate(null)}>Close</Button>
                  <Button onClick={() => downloadFile(selectedCertificate)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
  
  function renderFileList(files: CertificateFile[]) {
    return (
      <div className="space-y-2">
        {files.map(certificate => (
          <div 
            key={certificate.id}
            className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors group"
          >
            <div className="flex items-center flex-1 overflow-hidden">
              <div className="flex-shrink-0 mr-3">
                {getFileIcon(certificate.fileType)}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-medium truncate">{certificate.title}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {certificate.fileName} • {formatFileSize(certificate.fileSize)}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => viewFile(certificate)}
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => downloadFile(certificate)}
              >
                <Download className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(certificate.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default CertificateStorage;
