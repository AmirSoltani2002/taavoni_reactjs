import { useState, useEffect } from "react";
import { Building, Blocks, Home, CheckCircle } from "lucide-react";

interface StepperProps {
  step: number;
  setStep: (s: number) => void;
}

const Stepper: React.FC<StepperProps> = ({ step, setStep }) => {
  const steps = [
    {
      title: "مرحله ۱",
      desc: "اطلاعات پایه پروژه",
      icon: Building,
      bgColor: 'blue',
    },
    {
      title: "مرحله ۲", 
      desc: "اطلاعات بلوک ها",
      icon: Blocks,
      bgColor: 'green',
    },
    {
      title: "مرحله ۳",
      desc: "اطلاعات واحدهای مسکونی", 
      icon: Home,
      bgColor: 'purple',
    },
    {
      title: "مرحله ۴",
      desc: "بررسی و تایید نهایی",
      icon: CheckCircle,
      bgColor: 'orange',
    },
  ];

  const [stepActive, setStepActive] = useState([false, false, false, false]);
  
  useEffect(() => {
    setStepActive(prev => {
      prev = [false, false, false, false];
      prev[step] = true;
      return prev;
    });
  }, [step]);

  return (
    <div className="flex items-center justify-center mb-10">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center gap-6">
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            return (
              <div key={index}>
                <div 
                  className="flex items-center gap-3 cursor-pointer" 
                  onClick={() => setStep(index)}
                >
                  <div 
                    className={`w-12 h-12 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300`}
                    style={{
                      background: `var(--color-${stepItem.bgColor}-${stepActive[index] ? 500 : 200})`
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={`text-sm font-bold text-${stepItem.bgColor}-600`}>
                      {stepItem.title}
                    </span>
                    <p className="text-xs text-slate-600">{stepItem.desc}</p>
                  </div>
                </div>
                {index < 3 && (
                  <div 
                    className={`w-16 h-px bg-${stepItem.bgColor}-500 mt-6`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stepper;
