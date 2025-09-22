# 🖼️ راه‌حل ذخیره محلی تصاویر پروژه

## ⚠️ مشکل اصلی:
API فیلد `image` را نمی‌پذیرد و خطای `Property image should not exist` می‌دهد.

## ✅ راه‌حل پیاده‌سازی شده:

### **1. سیستم ذخیره محلی** 🗂️

فایل جدید: `src/lib/imageStorage.ts`

```typescript
export class ImageStorage {
  // ذخیره تصویر برای پروژه
  static saveProjectImage(projectId: number | string, imageData: string): void
  
  // دریافت تصویر پروژه
  static getProjectImage(projectId: number | string): string | null
  
  // حذف تصویر پروژه
  static removeProjectImage(projectId: number | string): void
  
  // دریافت همه تصاویر
  static getAllImages(): StoredImage[]
  
  // پاک کردن همه تصاویر
  static clearAllImages(): void
  
  // اطلاعات فضای ذخیره‌سازی
  static getStorageInfo(): { count: number; size: string }
}
```

### **2. تغییرات در ProjectCreate** 📝

#### **حذف فیلد image از API:**
```typescript
// قبل:
image: project.image || '', // ❌ API error

// بعد:
// image: project.image || '', // ✅ API validation error: Property image should not exist
```

#### **ذخیره محلی پس از ایجاد پروژه:**
```typescript
const result = await postTable('projects', projectData);
if (result) {
  // Save image locally using project ID from response
  if (project.image && result.id) {
    ImageStorage.saveProjectImage(result.id, project.image);
    console.log('Image saved locally for project ID:', result.id);
  }
}
```

### **3. تغییرات در ProjectsList** 📋

#### **ترکیب تصاویر محلی با داده‌های API:**
```typescript
useEffect(() => {
  getTable('projects/all', (data) => {
    // Enhance projects with locally stored images
    const enhancedData = data.map((project: any) => {
      const localImage = ImageStorage.getProjectImage(project.id);
      return {
        ...project,
        image: localImage || project.image || '' // Use local image if available
      };
    });
    setData(enhancedData);
  });
}, [])
```

#### **حذف تصویر محلی هنگام حذف پروژه:**
```typescript
const handleDelete = async (project: Project) => {
  await deleteTableRow('projects', project.id);
  
  // Also remove locally stored image
  ImageStorage.removeProjectImage(project.id);
  
  refreshData();
};
```

### **4. تغییرات در Columns** 🗂️

#### **استفاده از تصاویر محلی در جدول:**
```typescript
cell: ({ row }) => {
  const project = row.original;
  const apiImage = project.image as string;
  const localImage = ImageStorage.getProjectImage(project.id);
  const imageToShow = localImage || apiImage;
  
  return imageToShow ? (
    <img src={imageToShow} alt="تصویر پروژه" />
  ) : (
    <div>بدون تصویر</div>
  );
}
```

## 🔄 **جریان کار:**

### **1. ایجاد پروژه جدید:**
```
1. کاربر پروژه می‌سازد + عکس آپلود می‌کند
2. پروژه بدون فیلد image به API ارسال می‌شود ✅
3. API پروژه را ایجاد می‌کند و ID برمی‌گرداند
4. عکس با ID پروژه در localStorage ذخیره می‌شود
5. صفحه لیست پروژه‌ها refresh می‌شود
6. تصاویر از localStorage دریافت و نمایش داده می‌شوند ✅
```

### **2. ویرایش پروژه:**
```
1. کاربر پروژه را ویرایش می‌کند
2. اگر عکس جدید آپلود کرد، در localStorage به‌روزرسانی می‌شود
3. پروژه بدون فیلد image به API ارسال می‌شود ✅
```

### **3. حذف پروژه:**
```
1. پروژه از API حذف می‌شود
2. عکس مربوطه از localStorage حذف می‌شود
3. صفحه لیست به‌روزرسانی می‌شود
```

## 🎯 **مزایای این راه‌حل:**

### **✅ سازگاری با API:**
- هیچ تغییری در API لازم نیست
- خطای `Property image should not exist` برطرف شد
- پروژه‌ها بدون مشکل ایجاد می‌شوند

### **✅ تجربه کاربری بی‌وقفه:**
- کاربر می‌تواند عکس آپلود کند
- تصاویر در همه جا (کارت‌ها، جدول، modal) نمایش داده می‌شوند
- عکس‌ها پس از refresh صفحه باقی می‌مانند

### **✅ مدیریت خودکار:**
- تصاویر هنگام حذف پروژه پاک می‌شوند
- فضای localStorage مدیریت می‌شود
- Debug logging کامل

## 📊 **اطلاعات ذخیره‌سازی:**

### **محل ذخیره:**
```
localStorage['project_images'] = [
  {
    projectId: 1,
    imageData: "data:image/jpeg;base64,/9j/4AAQ...",
    uploadDate: "2024-01-15T10:30:00.000Z"
  },
  // ...
]
```

### **بررسی فضای استفاده شده:**
```typescript
const info = ImageStorage.getStorageInfo();
console.log(`${info.count} تصویر - ${info.size}`);
```

### **پاک کردن همه تصاویر (در صورت نیاز):**
```typescript
ImageStorage.clearAllImages();
```

## 🔧 **Debug و نظارت:**

### **Console Logs:**
```
✅ Project created successfully: {id: 123, name: "..."}
✅ Image saved locally for project ID: 123
✅ Projects data received: [...]
✅ Project 1 (نام پروژه): {hasImage: true, source: 'localStorage'}
✅ Table image loaded successfully for project: 123
```

### **بررسی localStorage:**
```javascript
// در Console مرورگر:
console.log(JSON.parse(localStorage.getItem('project_images')));
```

## 🚀 **آماده استفاده:**

- ✅ **خطای API برطرف شد**
- ✅ **تصاویر ذخیره می‌شوند**
- ✅ **تصاویر نمایش داده می‌شوند**
- ✅ **مدیریت کامل lifecycle**
- ✅ **Debug و monitoring**

## 📋 **تست:**

1. **پروژه جدید بسازید** + عکس آپلود کنید
2. **بررسی کنید** که خطای API ندارید
3. **صفحه لیست** را باز کنید
4. **ببینید** عکس نمایش داده می‌شود
5. **Console** را بررسی کنید برای debug info

### **اگر مشکل داشت:**
- Console logs را بررسی کنید
- `localStorage.getItem('project_images')` را چک کنید
- Network tab را بررسی کنید که API error نداشته باشید
