# 🚀 راهنمای آپلود فایل از فرانت به بک‌اند

## 📋 روش‌های مختلف آپلود فایل

### **1. روش FormData (پیشنهادی)**

```typescript
// تابع آپلود تک فایل
export const uploadFile = async (file: File, endpoint: string = 'upload'): Promise<string | null> => {
  const token = getToken();
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${api_base_url}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
      // ⚠️ Content-Type را تنظیم نکنید - مرورگر خودکار تنظیم می‌کند
    },
    body: formData
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.url || data.filename || data.path;
  }
  
  return null;
};

// تابع آپلود چندین فایل
export const uploadMultipleFiles = async (files: File[], endpoint: string = 'upload/multiple'): Promise<string[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await fetch(`${api_base_url}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: formData
  });
  
  const data = await response.json();
  return data.files?.map((f: any) => f.url) || [];
};
```

### **2. استفاده در React Component**

```tsx
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files) return;

  try {
    // آپلود تک فایل
    const file = files[0];
    const uploadedUrl = await uploadFile(file, 'upload/images');
    
    if (uploadedUrl) {
      setProject(prev => ({ ...prev, image: uploadedUrl }));
    }
    
    // یا آپلود چندین فایل
    const fileArray = Array.from(files);
    const uploadedUrls = await uploadMultipleFiles(fileArray, 'upload/documents');
    
    const newDocuments = fileArray.map((file, i) => ({
      id: Date.now() + i,
      originalName: file.name,
      url: uploadedUrls[i] || '',
      size: file.size,
      type: file.type,
    }));
    
    setProject(prev => ({ 
      ...prev, 
      documents: [...prev.documents, ...newDocuments] 
    }));
    
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### **3. روش Base64 (برای فایل‌های کوچک)**

```tsx
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleBase64Upload = async (file: File) => {
  const base64 = await convertToBase64(file);
  
  // ارسال به API
  const response = await fetch(`${api_base_url}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Project Name',
      image: base64, // فایل به صورت base64
    })
  });
};
```

### **4. Drag & Drop Upload**

```tsx
const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  
  for (const file of files) {
    const uploadedUrl = await uploadFile(file, 'upload/documents');
    if (uploadedUrl) {
      // اضافه کردن به لیست فایل‌ها
    }
  }
};

return (
  <div
    onDrop={handleDrop}
    onDragOver={(e) => e.preventDefault()}
    className="border-dashed border-2 p-4"
  >
    فایل‌ها را اینجا بکشید
  </div>
);
```

## 🔧 **تنظیمات بک‌اند**

### **Node.js + Express + Multer**

```javascript
const multer = require('multer');
const path = require('path');

// تنظیم ذخیره‌سازی
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع فایل پشتیبانی نمی‌شود'));
    }
  }
});

// آپلود تک فایل
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

// آپلود چندین فایل
app.post('/upload/multiple', upload.array('files'), (req, res) => {
  const files = req.files.map(file => ({
    url: `/uploads/${file.filename}`,
    originalName: file.originalname,
    size: file.size
  }));
  res.json({ files });
});
```

### **Laravel PHP**

```php
// Route
Route::post('/upload', [FileController::class, 'upload']);

// Controller
public function upload(Request $request)
{
    $request->validate([
        'file' => 'required|file|max:10240|mimes:jpeg,png,pdf'
    ]);
    
    $file = $request->file('file');
    $filename = time() . '_' . $file->getClientOriginalName();
    $path = $file->storeAs('uploads', $filename, 'public');
    
    return response()->json([
        'url' => Storage::url($path),
        'filename' => $filename
    ]);
}
```

## 📊 **نکات مهم**

### **1. اعتبارسنجی فایل**

```typescript
const validateFile = (file: File): boolean => {
  // بررسی سایز (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('حجم فایل نباید بیشتر از 5 مگابایت باشد');
    return false;
  }
  
  // بررسی نوع فایل
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    alert('نوع فایل پشتیبانی نمی‌شود');
    return false;
  }
  
  return true;
};
```

### **2. نمایش پیشرفت آپلود**

```typescript
const uploadWithProgress = (file: File, onProgress: (percent: number) => void) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        onProgress(Math.round(percent));
      }
    });
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Upload failed'));
      }
    };
    
    xhr.open('POST', `${api_base_url}/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
    xhr.send(formData);
  });
};
```

### **3. مدیریت خطا**

```typescript
const handleUploadError = (error: any) => {
  if (error.response?.status === 413) {
    toast.error('حجم فایل بیش از حد مجاز است');
  } else if (error.response?.status === 415) {
    toast.error('نوع فایل پشتیبانی نمی‌شود');
  } else {
    toast.error('خطا در آپلود فایل');
  }
};
```

## 🎯 **خلاصه**

1. **FormData** بهترین روش برای آپلود فایل‌های بزرگ
2. **Base64** مناسب فایل‌های کوچک (< 1MB)
3. همیشه **اعتبارسنجی** انجام دهید
4. **Progress indicator** تجربه کاربری را بهبود می‌بخشد
5. **Error handling** ضروری است
6. **Security** را فراموش نکنید (نوع فایل، سایز، مسیر)

## 🔗 **لینک‌های مفید**

- [MDN FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [File Upload Best Practices](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload)
- [Multer Documentation](https://github.com/expressjs/multer)
