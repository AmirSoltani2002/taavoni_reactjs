// Local image storage utility for projects
// Since API doesn't accept image field, we store images locally

interface StoredImage {
  projectId: number | string;
  imageData: string; // base64 or URL
  uploadDate: string;
}

const STORAGE_KEY = 'project_images';

export class ImageStorage {
  // Save image for a project
  static saveProjectImage(projectId: number | string, imageData: string): void {
    try {
      const existingImages = this.getAllImages();
      const updatedImages = existingImages.filter(img => img.projectId !== projectId);
      
      const newImage: StoredImage = {
        projectId,
        imageData,
        uploadDate: new Date().toISOString()
      };
      
      updatedImages.push(newImage);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedImages));
      
      console.log('Image saved for project:', projectId);
    } catch (error) {
      console.error('Error saving project image:', error);
    }
  }

  // Get image for a project
  static getProjectImage(projectId: number | string): string | null {
    try {
      const images = this.getAllImages();
      const projectImage = images.find(img => img.projectId == projectId);
      return projectImage?.imageData || null;
    } catch (error) {
      console.error('Error getting project image:', error);
      return null;
    }
  }

  // Remove image for a project
  static removeProjectImage(projectId: number | string): void {
    try {
      const existingImages = this.getAllImages();
      const updatedImages = existingImages.filter(img => img.projectId !== projectId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedImages));
      
      console.log('Image removed for project:', projectId);
    } catch (error) {
      console.error('Error removing project image:', error);
    }
  }

  // Get all stored images
  static getAllImages(): StoredImage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored images:', error);
      return [];
    }
  }

  // Clear all stored images
  static clearAllImages(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('All project images cleared');
    } catch (error) {
      console.error('Error clearing images:', error);
    }
  }

  // Get storage info
  static getStorageInfo(): { count: number; size: string } {
    try {
      const images = this.getAllImages();
      const totalSize = JSON.stringify(images).length;
      const sizeInKB = (totalSize / 1024).toFixed(2);
      
      return {
        count: images.length,
        size: `${sizeInKB} KB`
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { count: 0, size: '0 KB' };
    }
  }
}
