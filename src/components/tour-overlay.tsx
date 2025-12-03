import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface TourStep {
  target: string;
  content: string;
  title: string;
}

interface TourState {
  activeTour: string;
  tourStep: number;
  tourSteps: TourStep[];
  hasNavigated: boolean;
  tourGuide: {
    route?: string;
    tourTarget?: string;
  } | null;
}

const STORAGE_KEY = 'active_tour_state';

export function TourOverlay() {
  const [tourState, setTourState] = useState<TourState | null>(null);

  useEffect(() => {
    // Listen for tour start events
    const handleTourStart = (event: CustomEvent<TourState>) => {
      setTourState(event.detail);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(event.detail));
    };

    const handleTourEnd = () => {
      setTourState(null);
      localStorage.removeItem(STORAGE_KEY);
    };

    const handleTourUpdate = (event: CustomEvent<Partial<TourState>>) => {
      setTourState(prev => {
        if (prev) {
          const updated = { ...prev, ...event.detail };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    };

    const handleTourNavigate = () => {
      // Navigation is handled by the guide page, we just need to update state after navigation
      setTimeout(() => {
        setTourState(prev => {
          if (prev) {
            const updated = { ...prev, hasNavigated: true };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }, 100);
    };

    // Restore tour state from localStorage on mount
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        setTourState(JSON.parse(savedState));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    window.addEventListener('tour:start' as any, handleTourStart);
    window.addEventListener('tour:end' as any, handleTourEnd);
    window.addEventListener('tour:update' as any, handleTourUpdate);
    window.addEventListener('tour:navigate' as any, handleTourNavigate);

    return () => {
      window.removeEventListener('tour:start' as any, handleTourStart);
      window.removeEventListener('tour:end' as any, handleTourEnd);
      window.removeEventListener('tour:update' as any, handleTourUpdate);
      window.removeEventListener('tour:navigate' as any, handleTourNavigate);
    };
  }, []);

  const highlightTourTarget = (target: string) => {
    // Remove previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });

    // Find and highlight the target element
    const element = document.querySelector(`[data-tour="${target}"]`);
    if (element) {
      element.classList.add('tour-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const nextTourStep = () => {
    if (!tourState) return;

    const { tourStep, tourSteps, hasNavigated, tourGuide } = tourState;

    // If we're on step 0 and haven't navigated yet, navigate first
    if (tourStep === 0 && tourGuide?.route && !hasNavigated) {
      // Dispatch navigation event
      window.dispatchEvent(new CustomEvent('tour:navigate', { detail: tourGuide.route }));
      
      // Wait a bit for navigation, then highlight and move to next step
      setTimeout(() => {
        highlightTourTarget(tourGuide.tourTarget || tourSteps[0].target);
        if (tourSteps.length > 1) {
          const updated = {
            ...tourState,
            tourStep: 1,
            hasNavigated: true
          };
          setTourState(updated);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } else {
          endTour();
        }
      }, 500);
    } else if (tourStep < tourSteps.length - 1) {
      const nextStep = tourStep + 1;
      highlightTourTarget(tourSteps[nextStep].target);
      const updated = {
        ...tourState,
        tourStep: nextStep
      };
      setTourState(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } else {
      endTour();
    }
  };

  const prevTourStep = () => {
    if (!tourState || tourState.tourStep === 0) return;

    const prevStep = tourState.tourStep - 1;
    highlightTourTarget(tourState.tourSteps[prevStep].target);
    const updated = {
      ...tourState,
      tourStep: prevStep
    };
    setTourState(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const endTour = () => {
    setTourState(null);
    localStorage.removeItem(STORAGE_KEY);
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    window.dispatchEvent(new CustomEvent('tour:end'));
  };

  // Highlight current step target when tour state changes
  useEffect(() => {
    if (tourState && tourState.tourSteps.length > 0) {
      const currentStep = tourState.tourSteps[tourState.tourStep];
      if (currentStep) {
        setTimeout(() => {
          highlightTourTarget(currentStep.target);
        }, 300);
      }
    }
  }, [tourState?.tourStep]);

  if (!tourState || tourState.tourSteps.length === 0) {
    return null;
  }

  const currentStep = tourState.tourSteps[tourState.tourStep];
  if (!currentStep) return null;

  return typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={(e) => {
      if (e.target === e.currentTarget) {
        endTour();
      }
    }}>
      <Card className="w-full max-w-md shadow-2xl border-2 border-blue-500 bg-white" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{currentStep.title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={endTour}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6 leading-relaxed whitespace-pre-line">
            {currentStep.content}
          </p>
          {tourState.tourGuide?.route && tourState.tourStep === 0 && !tourState.hasNavigated && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                💡 با کلیک روی دکمه "بعدی"، به صفحه مربوطه هدایت می‌شوید و راهنما ادامه خواهد یافت.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={prevTourStep}
                disabled={tourState.tourStep === 0}
              >
                <ArrowRight className="h-4 w-4 ml-2" />
                قبلی
              </Button>
              <Button
                variant="outline"
                onClick={nextTourStep}
              >
                {tourState.tourStep === tourState.tourSteps.length - 1 ? 'پایان' : 'بعدی'}
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              {tourState.tourStep + 1} / {tourState.tourSteps.length}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
}

