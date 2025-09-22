# 🔧 Backend Upload Endpoints مورد نیاز

## ⚠️ خطای فعلی:
```
Cannot POST /api/upload/images
```

## 📋 Endpoints مورد نیاز:

### **1. آپلود تصاویر پروژه**
```
POST http://185.231.115.200:3000/api/upload/images
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- file: (image file)

Response:
{
  "url": "/uploads/images/2024-01-15-abc123.jpg",
  "filename": "2024-01-15-abc123.jpg",
  "size": 2048576
}
```

### **2. آپلود اسناد پروژه**
```
POST http://185.231.115.200:3000/api/upload/documents
Content-Type: multipart/form-data  
Authorization: Bearer <token>

Body:
- files: (array of files)

Response:
{
  "files": [
    {
      "url": "/uploads/documents/2024-01-15-contract-xyz789.pdf",
      "originalName": "contract.pdf", 
      "size": 1024000
    },
    {
      "url": "/uploads/documents/2024-01-15-permit-def456.jpg",
      "originalName": "building-permit.jpg",
      "size": 512000  
    }
  ]
}
```

## 🔧 نمونه پیاده‌سازی Node.js + Express:

### **نصب dependencies:**
```bash
npm install multer path fs-extra
```

### **کد سرور:**

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

const app = express();

// ایجاد پوشه‌های آپلود
fs.ensureDirSync('uploads/images');
fs.ensureDirSync('uploads/documents');

// تنظیم multer برای تصاویر
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const imageUpload = multer({ 
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('فقط فایل‌های تصویری مجاز هستند'));
    }
  }
});

// تنظیم multer برای اسناد
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const documentUpload = multer({ 
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع فایل پشتیبانی نمی‌شود'));
    }
  }
});

// Middleware احراز هویت
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  // بررسی اعتبار token (باید با سیستم احراز هویت شما سازگار باشد)
  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) return res.status(403).json({ error: 'Invalid token' });
  //   req.user = user;
  //   next();
  // });
  
  // موقتاً بدون بررسی token
  next();
};

// Route آپلود تصاویر
app.post('/api/upload/images', authenticateToken, imageUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'فایل ارسال نشده است' });
    }
    
    res.json({
      url: `/uploads/images/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
      originalName: req.file.originalname
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'خطا در آپلود فایل' });
  }
});

// Route آپلود اسناد
app.post('/api/upload/documents', authenticateToken, documentUpload.array('files'), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'فایل ارسال نشده است' });
    }
    
    const files = req.files.map(file => ({
      url: `/uploads/documents/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size
    }));
    
    res.json({ files });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'خطا در آپلود فایل‌ها' });
  }
});

// سرو فایل‌های استاتیک
app.use('/uploads', express.static('uploads'));

// Error handler
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'حجم فایل بیش از حد مجاز است' });
    }
  }
  
  res.status(500).json({ error: error.message || 'خطای سرور' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 🧪 تست endpoints:

### **با curl:**

```bash
# تست آپلود تصویر
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  http://185.231.115.200:3000/api/upload/images

# تست آپلود اسناد  
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "files=@/path/to/document1.pdf" \
  -F "files=@/path/to/document2.jpg" \
  http://185.231.115.200:3000/api/upload/documents
```

### **با Postman:**
1. Method: POST
2. URL: http://185.231.115.200:3000/api/upload/images
3. Headers: Authorization: Bearer YOUR_TOKEN
4. Body: form-data, key: "file", type: File

## 🔄 فعال‌سازی در Frontend:

پس از پیاده‌سازی endpoints، در فایل‌های زیر تغییرات را برگردانید:

### **`src/components/ui/image-upload.tsx`:**
```typescript
// خط 40-46 را uncomment کنید:
const uploadedUrl = await uploadFile(file, 'upload/images');
if (uploadedUrl) {
  onChange(uploadedUrl);
  setIsUploading(false);
  return;
}
```

### **`src/pages/projects/create.tsx`:**
```typescript
// خط 188-189 را uncomment کنید:
const uploadedUrls = await uploadMultipleFiles(fileArray, 'upload/documents');
```

## 📁 ساختار پوشه‌ها:
```
project-root/
├── uploads/
│   ├── images/
│   │   ├── 2024-01-15-abc123.jpg
│   │   └── 2024-01-15-def456.png
│   └── documents/
│       ├── 2024-01-15-contract-xyz789.pdf
│       └── 2024-01-15-permit-ghi012.jpg
```

## 🛡️ نکات امنیتی:

1. **File validation** (نوع، سایز)
2. **Authentication** برای همه endpoints
3. **Rate limiting** برای جلوگیری از spam
4. **Virus scanning** برای فایل‌های آپلودی
5. **Secure file names** (جلوگیری از path traversal)
6. **HTTPS** برای انتقال امن
