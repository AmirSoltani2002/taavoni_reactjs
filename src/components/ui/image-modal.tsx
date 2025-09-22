import { Dialog, DialogContent } from './dialog';
import { X } from 'lucide-react';
import { Button } from './button';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, title }: ImageModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-auto max-h-[80vh] object-contain"
          />
          <Button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2"
            size="icon"
            variant="ghost"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h3 className="text-white text-xl font-semibold">{title}</h3>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

