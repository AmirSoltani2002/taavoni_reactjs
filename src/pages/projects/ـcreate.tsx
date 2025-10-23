import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { getTable, postTable } from "@/general";
import { PageLoader } from "@/components/ui/loader";
import type { Project, Block, SubProject } from "./columns";
import type { User } from "../users/columns";
import Stepper from "./newStepper";
import { Step1BasicInfo } from "./steps/Step1BasicInfo";
import { Step2Blocks } from "./steps/Step2Blocks";
import { Step3Units } from "./steps/Step3Units";
import { Step4Review } from "./steps/Step4Review";

interface ProjectCreateProps {
  initialValues?: Project;
  onSubmit?: (values: any) => void;
  isEdit?: boolean;
  onBack?: () => void;
}

export default function ProjectCreate({ 
  initialValues, 
  onSubmit, 
  isEdit = false, 
  onBack 
}: ProjectCreateProps = {}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User>();
  const [step, setStep] = useState(0);

  // Project state
  const [project, setProject] = useState<Project>(() => {
    if (initialValues) {
      return {
        name: initialValues.name || "",
        address: initialValues.address || "",
        landArea: initialValues.landArea || 0,
        startDate: initialValues.startDate || "",
        endDate: initialValues.endDate || "",
      } as Project;
    }
    return {
      name: "",
      address: "",
      landArea: 0,
      startDate: "",
      endDate: "",
    } as Project;
  });

  // Blocks and units state
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [units, setUnits] = useState<SubProject[]>([]);

  useEffect(() => {
    getTable('users/profile', setUser);
  }, []);

  // Update project state when initialValues change (for editing)
  useEffect(() => {
    if (initialValues && isEdit) {
      setProject(initialValues);
      if (initialValues.blocks) {
        setBlocks(initialValues.blocks);
      }
    }
  }, [initialValues, isEdit]);

  const handleProjectChange = (name: string, value: any) => {
    setProject({ ...project, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Submitting project data:', { project, blocks, units });
      
      if (isEdit && onSubmit) {
        onSubmit({ project, blocks, units });
      } else {
        // Create project first
        const projectResult = await postTable('projects', project);
        if (projectResult && projectResult.id) {
          // Create blocks one by one
          const createdBlocks: Block[] = [];
          for (const block of blocks) {
            const blockData = {
              ...block,
              projectId: projectResult.id
            };
            const createdBlock = await postTable('blocks', blockData);
            if (createdBlock && createdBlock.id) {
              createdBlocks.push(createdBlock);
            }
          }
          
          if (createdBlocks.length > 0) {
            // Create units with block IDs
            const unitsWithBlockIds = units.map(unit => {
              const correspondingBlock = createdBlocks.find((block: any) => 
                block.name === blocks.find(b => b.id === unit.blockId)?.name
              );
              return {
                ...unit,
                blockId: correspondingBlock?.id,
                userId: user?.id
              };
            });
            
            await postTable('subprojects/multiple', unitsWithBlockIds);
          }
          
          // Reset form on successful creation
          setProject({
            name: "",
            address: "",
            landArea: 0,
            startDate: "",
            endDate: "",
          });
          setBlocks([]);
          setUnits([]);
          
          // Call onSubmit callback for new projects too
          if (onSubmit) {
            onSubmit({ project, blocks, units });
          }
        }
      }
    } catch (error) {
      console.error('Error submitting project:', error);
    }
    
    setLoading(false);
  };

  const canProceedToNext = () => {
    switch (step) {
      case 0:
        return project.name && project.address && project.landArea && project.startDate;
      case 1:
        return blocks.length > 0 && blocks.every(block => 
          block.name && block.floorCount > 0 && block.shareArea >= 0 && block.buildingArea > 0
        );
      case 2:
        return units.length > 0 && units.every(unit => 
          unit.area > 0 && unit.roomCount > 0 && unit.direction
        );
      case 3:
        return true; // Review step is always valid
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Step1BasicInfo 
            project={project} 
            handleProjectChange={handleProjectChange} 
          />
        );
      case 1:
        return (
          <Step2Blocks 
            blocks={blocks} 
            setBlocks={setBlocks} 
          />
        );
      case 2:
        return (
          <Step3Units 
            blocks={blocks} 
            units={units} 
            setUnits={setUnits} 
          />
        );
      case 3:
        return (
          <Step4Review 
            project={project} 
            blocks={blocks} 
            units={units} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 hover:bg-white/60 backdrop-blur-sm"
              onClick={() => {
                if (onBack) {
                  onBack();
                } else {
                  navigate('/projects/list');
                }
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              بازگشت
            </Button>
            <div className="h-6 w-px bg-gradient-to-b from-blue-300 to-purple-300"></div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-20"></div>
                  <div className="relative p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {isEdit ? 'ویرایش پروژه' : 'ایجاد پروژه جدید'}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          {!isEdit && <Stepper step={step} setStep={setStep} />}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            {step === 3 ? (
              <Button 
                type="submit" 
                className="flex-1 h-14 text-lg gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {isEdit ? 'بروزرسانی پروژه' : 'ایجاد پروژه'}
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-14 text-lg gap-2"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step <= 0}
                >
                  <ArrowRight className="w-5 h-5" />
                  قبلی
                </Button>
                
                <Button 
                  type="button" 
                  className="flex-1 h-14 text-lg gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                  onClick={() => setStep(Math.min(3, step + 1))}
                  disabled={step >= 3 || !canProceedToNext()}
                >
                  مرحله بعد
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </form>
        
        {loading && <PageLoader />}
      </div>
    </div>
  );
}