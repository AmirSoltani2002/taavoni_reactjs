import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { getTable, postTable, updateTableRow, uploadProjectDoc } from "@/general";
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
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User>();
  const [step, setStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  // Project state
  const [project, setProject] = useState<Project>(() => {
    if (initialValues) {
      return {
        name: initialValues.name || "",
        address: initialValues.address || "",
        landArea: initialValues.landArea || 0,
        startDate: initialValues.startDate || "",
        endDate: initialValues.endDate || "",
        longitude: initialValues.longitude,
        latitude: initialValues.latitude,
      } as Project;
    }
    return {
      name: "",
      address: "",
      landArea: 0,
      startDate: "",
      endDate: "",
      longitude: undefined,
      latitude: undefined,
    } as Project;
  });

  // Blocks and units state
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [units, setUnits] = useState<SubProject[]>([]);
  const [hasDuplicateUnits, setHasDuplicateUnits] = useState(false);
  
  // Project images and docs state
  // Project images can be: string (base64 or old path) or {id: number, url?: string} (loaded from API)
  const [projectImages, setProjectImages] = useState<Array<string | {id: number, url?: string}>>([]);
  const [projectDocs, setProjectDocs] = useState<Array<{ title: string; file: File | null; id?: number; uploaded?: boolean; filename?: string }>>([]);

  useEffect(() => {
    getTable('users/profile', setUser);
    
    // Check if we're in edit mode
    if (projectId) {
      setIsEditMode(true);
      loadProjectData(projectId);
    }
  }, [projectId]);

  const loadProjectData = async (id: string) => {
    setLoading(true);
    try {
      // Load project data with nested blocks and units
      const projectData = await getTable(`projects/${id}`);
      if (projectData) {
        setProject(projectData);
        
        // Extract blocks from nested project data
        if (projectData.blocks && Array.isArray(projectData.blocks)) {
          setBlocks(projectData.blocks);
          
          // Extract all units from nested blocks
          const allUnits: SubProject[] = [];
          projectData.blocks.forEach((block: Block) => {
            if (block.subProjects && Array.isArray(block.subProjects)) {
              allUnits.push(...block.subProjects);
            }
          });
          setUnits(allUnits);
        }
        
        // Load project docs
        const projectDocsData = await getTable(`project-docs/project/${id}`);
        if (projectDocsData && Array.isArray(projectDocsData)) {
          // Separate images (detail starts with !!image) from regular docs
          const images: Array<string | {id: number, url?: string}> = [];
          const docs: Array<{ title: string; file: File | null; id?: number; uploaded?: boolean; filename?: string }> = [];
          
          projectDocsData.forEach((doc: any) => {
            if (doc.detail && doc.detail.startsWith('!!image')) {
              // This is an image, extract index and add to images array
              const match = doc.detail.match(/!!image(\d+)/);
              if (match && doc.id) {
                const imageIndex = parseInt(match[1]);
                // Ensure array is large enough
                while (images.length <= imageIndex) {
                  images.push('');
                }
                // Store both id and url for using download endpoint
                images[imageIndex] = { id: doc.id, url: doc.document };
              }
            } else {
              // This is a regular document
              // Extract filename from document path if available
              const filename = doc.document ? doc.document.split('/').pop() || doc.document.split('\\').pop() : undefined;
              docs.push({
                title: doc.detail || '',
                file: null, // We can't convert URL back to File, but mark as uploaded
                id: doc.id,
                uploaded: true,
                filename: filename
              });
            }
          });
          
          // Remove empty slots from images array (keep only actual images)
          const filteredImages = images.filter(img => img && (typeof img === 'string' || img.id));
          setProjectImages(filteredImages);
          setProjectDocs(docs);
        }
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    }
    setLoading(false);
  };

  // Update project state when initialValues change (for editing)
  useEffect(() => {
    if (initialValues && isEdit) {
      setProject(initialValues);
      if (initialValues.blocks) {
        setBlocks(initialValues.blocks);
        
        // Extract all units from nested blocks
        const allUnits: SubProject[] = [];
        initialValues.blocks.forEach((block: Block) => {
          if (block.subProjects && Array.isArray(block.subProjects)) {
            allUnits.push(...block.subProjects);
          }
        });
        setUnits(allUnits);
      }
    }
  }, [initialValues, isEdit]);

  const handleProjectChange = (name: string, value: any) => {
    setProject((prevProject) => ({ ...prevProject, [name]: value }));
  };

  // Special handler for location updates to ensure both latitude and longitude update together
  const handleLocationChange = (lat: number, lng: number) => {
    setProject((prevProject) => ({
      ...prevProject,
      latitude: lat,
      longitude: lng
    }));
  };

  // Convert base64 string to File object
  const base64ToFile = (base64: string, filename: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if there are duplicate units
    if (hasDuplicateUnits) {
      return;
    }
    
    // Prevent submission if required fields are not defined
    if (!project.startDate) {
      return;
    }
    
    setLoading(true);
    
    try {
      if (isEditMode) {
        // Update existing project (remove ID from project data)
        const { id: _, ...projectData } = project;
        await updateTableRow('projects', projectId!, {
          ...projectData,
          longitude: projectData.longitude,
          latitude: projectData.latitude,
          blocks: undefined,
          projectDocs: undefined,
        });
        
        // Update blocks
        for (const block of blocks) {
          if (block.id) {
            // Update existing block (remove ID from block data)
            const { id: blockId, ...blockData } = block;
            await updateTableRow('blocks', block.id, { ...blockData, subProjects: undefined });
          } else {
            // Create new block (remove ID from block data)
            const { id: blockId, ...blockData } = block;
            await postTable('blocks', { ...blockData, subProjects: undefined });
          }
        }
        
        // Update units
        for (const unit of units) {
          if (unit.id && unit.id > 0) {
            // Update existing unit (positive ID means it exists in database)
            const { id: unitId, ...unitData } = unit;
            await updateTableRow('subprojects', unit.id, { ...unitData });
          } else {
            // Create new unit (negative ID or no ID means it's new)
            const { id: unitId, ...unitData } = unit;
            await postTable('subprojects', { ...unitData });
          }
        }
        
        // Note: In edit mode, images and docs are uploaded immediately in Step1BasicInfo
        // when selected, so no need to upload here
        
        // Navigate back to projects list
        navigate('/projects/list');
      } else if (isEdit && onSubmit) {
        onSubmit?.({ project, blocks, units });
      } else {
        // Create project first (remove ID from project data)
        const { id: _, ...projectData } = project;
        const projectResult = await postTable('projects', {
          ...projectData,
          longitude: projectData.longitude,
          latitude: projectData.latitude,
        });
        if (projectResult && projectResult.id) {
          // Create blocks one by one (remove ID from block data)
          const createdBlocks: Block[] = [];
          for (const block of blocks) {
            const { id: blockId, ...blockData } = block;
            const blockPayload = {
              ...blockData,
              projectId: projectResult.id
            };
            const createdBlock = await postTable('blocks', blockPayload);
            if (createdBlock && createdBlock.id) {
              createdBlocks.push(createdBlock);
            }
          }
          
          if (createdBlocks.length > 0) {
            // Create units with block IDs (remove ID from unit data)
            const unitsWithBlockIds = units.map(unit => {
              const { id: unitId, ...unitData } = unit;
              const correspondingBlock = createdBlocks.find((block: any) => 
                block.name === blocks.find(b => b.id === unit.blockId)?.name
              );
              return {
                ...unitData,
                blockId: correspondingBlock?.id,
                userId: user?.id
              };
            });
            
            await postTable('subprojects/multiple', unitsWithBlockIds);
          }
          
          // Upload project images with detail format !!image{index}
          // Only upload images that are base64 (not already uploaded URLs)
          for (let i = 0; i < projectImages.length; i++) {
            const imageData = projectImages[i];
            // Skip if it's an object (already uploaded) or if it's a URL
            if (typeof imageData === 'object' || (typeof imageData === 'string' && (imageData.startsWith('http') || imageData.startsWith('/uploads')))) {
              continue;
            }
            if (imageData && typeof imageData === 'string') {
              try {
                // Convert base64 to File
                const imageFile = base64ToFile(imageData, `project-image-${i + 1}.jpg`);
                await uploadProjectDoc(
                  imageFile,
                  projectResult.id,
                  `!!image${i}`, // Detail format: !!image{index}
                  true
                );
              } catch (error) {
                console.error(`Error uploading image ${i + 1}:`, error);
              }
            }
          }
          
          // Upload project documents (only those not already uploaded)
          for (const doc of projectDocs) {
            if (doc.file && doc.title && !doc.uploaded) {
              try {
                await uploadProjectDoc(
                  doc.file,
                  projectResult.id,
                  doc.title, // Detail is the title for docs
                  true
                );
              } catch (error) {
                console.error('Error uploading document:', error);
              }
            }
          }
          
          navigate('/projects/list');
          // Call onSubmit callback for new projects too
          if (onSubmit) {
            onSubmit?.({ project, blocks, units });
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
        return project.name && project.startDate;
      case 1:
        return blocks.length > 0 && blocks.every(block => 
          block.name && block.floorCount > 0 && block.shareArea >= 0 && block.buildingArea > 0
        );
      case 2:
        return units.length > 0 && units.every(unit => 
          unit.area > 0 && unit.roomCount > 0 && unit.direction
        ) && !hasDuplicateUnits;
      case 3:
        return !hasDuplicateUnits; // Review step requires no duplicates
      default:
        return false;
    }
  };

  // Check if required fields for submission are defined
  const canSubmit = () => {
    return !!(
      project.startDate &&
      !hasDuplicateUnits
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Step1BasicInfo 
            project={project} 
            handleProjectChange={handleProjectChange}
            handleLocationChange={handleLocationChange}
            projectId={isEditMode ? projectId : project.id}
            projectImages={projectImages}
            setProjectImages={setProjectImages}
            projectDocs={projectDocs}
            setProjectDocs={setProjectDocs}
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
            onDuplicateChange={setHasDuplicateUnits}
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
              <ArrowRight className="w-4 h-4" />
              بازگشت به لیست پروژه ها
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
                    {isEditMode ? 'ویرایش پروژه' : 'ایجاد پروژه جدید'}
                  </h1>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <Stepper step={step} setStep={setStep} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            {step === 3 ? (
              <Button 
                type={hasDuplicateUnits || !canSubmit() ? "button" : "submit"}
                onClick={hasDuplicateUnits || !canSubmit() ? (e) => {
                  e.preventDefault();
                  if (hasDuplicateUnits) {
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                } : undefined}
                className={`flex-1 h-14 text-lg gap-2 shadow-lg ${
                  hasDuplicateUnits || !canSubmit()
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 cursor-pointer' 
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                }`}
                disabled={loading || !canSubmit()}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    در حال ذخیره...
                  </>
                ) : hasDuplicateUnits ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white rounded-full"></div>
                    <span className="hover:underline">
                      لطفاً شماره واحدهای تکراری را اصلاح کنید
                    </span>
                  </>
                ) : !canSubmit() ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white rounded-full"></div>
                    <span className="hover:underline">
                      لطفاً تاریخ شروع را مشخص کنید
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {isEditMode ? 'بروزرسانی پروژه' : 'ایجاد پروژه'}
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
