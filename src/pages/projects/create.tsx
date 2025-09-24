import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Building, Users, FileText, CheckCircle, ArrowLeft } from "lucide-react";
import { getTable, postTable } from "@/general";
import { PageLoader } from "@/components/ui/loader";
import type { Project, SubProject, UnitType } from "./columns";
import type { User } from "../users/columns";
import { GeneralInfo, ProjectSpecs, UnitTypes } from "./createComponents";


interface ProjectCreateProps {
  initialValues?: Project;
  onSubmit?: (values: any) => void;
  isEdit?: boolean;
  onBack?: () => void;
}
const Stepper = <div className="flex items-center justify-center mb-10">
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center gap-8">
          {/* Step 1 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-r from-blue-500 to-blue-600">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-blue-600">
                مرحله ۱
              </span>
              <p className="text-xs text-slate-600">اطلاعات پایه پروژه</p>
            </div>
          </div>
          
          {/* Connector 1-2 */}
          <div className="w-16 h-px bg-gradient-to-r from-blue-300 to-purple-300"></div>
          
          {/* Step 2 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-r from-purple-400 to-purple-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-purple-600">
                مرحله ۲
              </span>
              <p className="text-xs text-slate-600">واحدهای مسکونی</p>
            </div>
          </div>
          
          {/* Connector 2-3 */}
          <div className="w-16 h-px bg-gradient-to-r from-purple-300 to-orange-300"></div>
          
          {/* Step 3 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg bg-gradient-to-r from-orange-500 to-red-500">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-orange-600">
                مرحله ۳
              </span>
              <p className="text-xs text-slate-600">اطلاعات تکمیلی و اسناد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
export default function ProjectCreate({ initialValues, onSubmit, isEdit = false, onBack }: ProjectCreateProps = {}) {
  const navigate = useNavigate();
  const [loading, setLoading] =  useState(false);
  const [user, setUser] = useState<User>()
  const [project, setProject] = useState<Project>(() => {
    if (initialValues) {
      return {
        name: initialValues.name || "",
        address: initialValues.address || "",
        startDate: initialValues.startDate ? new Date(initialValues.startDate) : undefined,
        endDate: initialValues.endDate ? new Date(initialValues.endDate) : undefined,
        floorCount: initialValues.floorCount || 0,
        unitCount: initialValues.unitCount || 0,
        blockNumber: initialValues.blockNumber || 1,
        landArea: initialValues.landArea || 0,
        sharedArea: initialValues.sharedArea || 0,
        options: initialValues.options || "",
      } as Project;
    }
    return {
      name: "",
      address: "",
      startDate: undefined,
      endDate: undefined,
      floorCount : 0,
      unitCount: 0,
      blockNumber: 1,
      landArea: 0,
      sharedArea: 0,
      options: "",
    } as Project;
  });

  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [units, setUnits] = useState<SubProject[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    getTable('users/profile', setUser);
  }, [])
  // Update project state when initialValues change (for editing)
  useEffect(() => {
    if (initialValues && isEdit) {
      setProject({});
    }
  }, [initialValues, isEdit]);
  useEffect(() => {
    const generatedUnits: SubProject[] = [];
    unitTypes.forEach((type) => {
      for (let i = 0; i < type.count; i++) {
        generatedUnits.push({
          userId: user?.id,
          unitNumber: generatedUnits.length + 1,
          floor: 0,
          block: type.block,
          area: type.area,
          roomCount: type.bedrooms,
          point: 0,
        });
      }
    });
    setUnits(generatedUnits);
  }, [unitTypes]);
  

  const handleProjectChange = (name: string, value: any) => {
    setProject({ ...project, [name]: value });
  };

  
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare data for API with correct field names and types
      console.log('Submitting project data:', project);
      
      if (isEdit && onSubmit) {
        onSubmit(project);
        
      } else {
        const result = await postTable('projects', project);
        if (result) {
          console.log('Project created successfully:', result);
          
          // Reset form on successful creation
          setProject({
            name: "",
            address: "",
            startDate: undefined,
            endDate: undefined,
            floorCount : 0,
            unitCount: 0,
            blockNumber: 1,
            landArea: 0,
            sharedArea: 0,
            options: "",
          });
          
          // Call onSubmit callback for new projects too
          if (onSubmit) {
            onSubmit(project);
          }
        }
      }
    } catch(error) {
      console.error('Error submitting project:', error);
    }
    
    setLoading(false);
    // TODO: replace with API call
    console.log("Units:", units);
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
                  // Default behavior: go to projects list
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
                    <Building className="w-8 h-8 text-white" />
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


          {/* Static Progress Steps */}
          {!isEdit && Stepper}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Basic Info */}
          <GeneralInfo project={project} handleProjectChange={handleProjectChange} />
          {/* Project Specifications */}
          <ProjectSpecs project={project} handleProjectChange={handleProjectChange} />
          {/* Unit Types */}
          <UnitTypes 
            unitTypes={unitTypes} 
            setUnitTypes={setUnitTypes}
            nextId={nextId}
            setNextId={setNextId} 
          />
          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-14 text-lg gap-2"
              disabled={loading}
            >
              <ArrowLeft className="w-5 h-5" />
              ذخیره پیش‌نویس
            </Button>
            
            <Button 
              type="submit" 
              className="flex-1 h-14 text-lg gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
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
          </div>
        </form>
        
        {loading && <PageLoader />}
      </div>
    </div>
  );
}
