// src/components/ui/loader.tsx
import { motion } from "framer-motion";

interface SpinnerProps {
    size?: number;
}
export const Spinner: React.FC<SpinnerProps> = ({size=12}) => {
    return (
      <div className={`spinner relative w-${size} h-${size}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
}

interface PageLoaderProps {
    size?: number;
}

function LoadingDots() {
    return (
      <div className="flex items-center space-x-1">
        <span className="text-xl bold font-medium">لطفا کمی صبر کنید</span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
        >
          .
        </motion.span>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, delay: 0.8 }}
        >
          .
        </motion.span>
      </div>
    )
  }
export const PageLoader: React.FC<PageLoaderProps> = ({size=12}) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center blurred z-50">
      <Spinner size={size} />
      {LoadingDots()}
    </div>
  );
}
