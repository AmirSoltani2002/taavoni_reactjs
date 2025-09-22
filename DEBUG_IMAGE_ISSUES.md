# 🔍 راهنمای Debug مشکل نمایش تصاویر

## 🚨 مشکل فعلی:
عکس‌های آپلود شده در صفحه مدیریت پروژه‌ها نمایش داده نمی‌شوند.

## 🔧 تغییرات اعمال شده:

### **1. فعال‌سازی ارسال image به API** ✅
```typescript
// در create.tsx - خط 279
const projectData = {
  // ... other fields
  image: project.image || '', // ✅ حالا ارسال می‌شود
};
```

### **2. اضافه کردن Debug Logs** ✅
```typescript
// در list.tsx - خط‌های 23-36
useEffect(() => {
  getTable('projects/all', (data) => {
    console.log('Projects data received:', data);
    data.forEach((project, index) => {
      console.log(`Project ${index + 1} (${project.name}):`, {
        hasImage: !!project.image,
        imageType: typeof project.image,
        imageLength: project.image?.length || 0,
        imagePrefix: project.image?.substring(0, 50) || 'No image'
      });
    });
    setData(data);
  });
}, [])
```

### **3. اضافه کردن Error Handling برای تصاویر** ✅
```typescript
// در list.tsx و columns.tsx
<img 
  src={project.image} 
  alt={project.name}
  onError={(e) => {
    console.error('Image load error for project:', project.name, 'Image URL:', project.image);
    e.currentTarget.style.display = 'none';
  }}
  onLoad={() => {
    console.log('Image loaded successfully for project:', project.name);
  }}
/>
```

### **4. اضافه کردن Debug Info در UI** ✅
```typescript
// در list.tsx - fallback image
<p className="text-xs text-slate-400 mt-1">
  Debug: {project.image ? `Has: ${project.image.substring(0, 20)}...` : 'No image data'}
</p>
```

## 🧪 **مراحل Debug:**

### **مرحله 1: بررسی Console**
1. F12 کنید و Console را باز کنید
2. صفحه پروژه‌ها را باز کنید
3. دنبال این log ها باشید:
   ```
   Projects data received: [...]
   Project 1 (نام پروژه): { hasImage: true/false, ... }
   Image loaded successfully for project: نام پروژه
   یا
   Image load error for project: نام پروژه
   ```

### **مرحله 2: بررسی API Response**
1. در Console، `Projects data received` را باز کنید
2. بررسی کنید که آیا فیلد `image` وجود دارد
3. اگر وجود دارد، محتوای آن چیست؟

### **مرحله 3: بررسی Network Tab**
1. Network tab را باز کنید
2. درخواست `GET /api/projects/all` را پیدا کنید
3. Response را بررسی کنید
4. آیا فیلد `image` در response وجود دارد؟

## 🔍 **سناریوهای مختلف:**

### **سناریو 1: فیلد image در API وجود ندارد**
```json
// Response از API:
[
  {
    "id": 1,
    "name": "پروژه تست",
    "address": "آدرس",
    // ❌ فیلد image وجود ندارد
  }
]
```
**راه‌حل:** بک‌اند باید فیلد image را به response اضافه کند

### **سناریو 2: فیلد image خالی است**
```json
// Response از API:
[
  {
    "id": 1,
    "name": "پروژه تست",
    "image": "", // ❌ خالی
  }
]
```
**راه‌حل:** عکس در دیتابیس ذخیره نشده، باید پروژه را ویرایش کرد

### **سناریو 3: فیلد image دارای base64 معیوب**
```json
// Response از API:
[
  {
    "id": 1,
    "name": "پروژه تست", 
    "image": "data:image/jpeg;base64,INVALID_DATA", // ❌ معیوب
  }
]
```
**راه‌حل:** عکس مجدداً آپلود شود

### **سناریو 4: فیلد image دارای URL معیوب**
```json
// Response از API:
[
  {
    "id": 1,
    "name": "پروژه تست",
    "image": "/uploads/image-not-found.jpg", // ❌ فایل وجود ندارد
  }
]
```
**راه‌حل:** فایل روی سرور وجود ندارد یا مسیر اشتباه است

## 🛠️ **راه‌حل‌های موقت:**

### **1. تست با عکس نمونه:**
```typescript
// در list.tsx، برای تست موقت:
const testImageUrl = "https://via.placeholder.com/300x200/4f46e5/ffffff?text=Project";
```

### **2. Mock Data برای تست:**
```typescript
// در useEffect، برای تست:
const mockProject = {
  id: 999,
  name: "پروژه تست",
  image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNGY0NmU1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5UZXN0IEltYWdlPC90ZXh0Pjwvc3ZnPg=="
};
```

## 📋 **Checklist:**

- [ ] Console logs را بررسی کردم
- [ ] API response را در Network tab دیدم  
- [ ] فیلد image در response وجود دارد
- [ ] محتوای فیلد image معتبر است
- [ ] Error های image load در console نمی‌بینم
- [ ] پروژه جدید با عکس ساختم و تست کردم

## 🎯 **گزارش مشکل:**

پس از انجام debug، نتیجه را گزارش دهید:

```
✅ Console Logs:
- Projects data received: [بله/خیر]
- تعداد پروژه‌ها: X
- پروژه‌های دارای image: X از Y

✅ API Response:
- فیلد image وجود دارد: [بله/خیر] 
- نوع داده image: [string/null/undefined]
- طول داده image: X کاراکتر

✅ Image Loading:
- تصاویر لود می‌شوند: [بله/خیر]
- خطاهای loading: [لیست خطاها]

✅ UI Display:
- تصاویر در کارت‌ها نمایش داده می‌شوند: [بله/خیر]
- تصاویر در جدول نمایش داده می‌شوند: [بله/خیر]
```
