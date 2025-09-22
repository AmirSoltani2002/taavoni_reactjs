import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@/general';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({ value, onChange, disabled, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('لطفا فقط فایل تصویری انتخاب کنید');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم فایل نباید بیشتر از 5 مگابایت باشد');
      return;
    }

    setIsUploading(true);

    // Temporarily use base64 until server endpoint is ready
    // TODO: Enable server upload when /api/upload/images endpoint is implemented
    
    try {
      // Method 1: Try server upload (commented out until endpoint exists)
      // const uploadedUrl = await uploadFile(file, 'upload/images');
      // if (uploadedUrl) {
      //   onChange(uploadedUrl);
      //   setIsUploading(false);
      //   return;
      // }
      
      // Method 2: Use base64 for now
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        setIsUploading(false);
      };
      reader.onerror = () => {
        console.error('Error reading file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {value ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={value}
                alt="تصویر پروژه"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleClick}
                    disabled={disabled || isUploading}
                    className="bg-white/90 hover:bg-white text-slate-700"
                  >
                    <Camera className="w-4 h-4" />
                    تغییر
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={disabled}
                    className="bg-red-500/90 hover:bg-red-500 text-white"
                  >
                    <X className="w-4 h-4" />
                    حذف
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
          onClick={handleClick}
        >
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isUploading ? 'در حال آپلود...' : 'افزودن تصویر پروژه'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              تصویر پروژه را از کامپیوتر خود انتخاب کنید
            </p>
            <Button 
              type="button" 
              variant="outline" 
              disabled={disabled || isUploading}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              انتخاب تصویر
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              فرمت‌های مجاز: JPG, PNG, GIF (حداکثر 5MB)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
