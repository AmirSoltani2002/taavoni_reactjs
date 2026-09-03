import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Plus, Trash, Square, Users, Navigation } from "lucide-react";
import type { Block, SubProject } from "../columns";
import { useState, useMemo, useRef, useEffect } from "react";

interface Step3UnitsProps {
  blocks: Block[];
  units: SubProject[];
  setUnits: (units: SubProject[]) => void;
  onDuplicateChange?: (hasDuplicates: boolean) => void;
  selectedBlockId: number | null;
  setSelectedBlockId: (blockId: number | null) => void;
  selectedFloor: number | null;
  setSelectedFloor: (floor: number | null) => void;
}

export const Step3Units: React.FC<Step3UnitsProps> = ({ 
  blocks, 
  units, 
  setUnits,
  onDuplicateChange,
  selectedBlockId,
  setSelectedBlockId,
  selectedFloor,
  setSelectedFloor,
}) => {
  const [pendingInvalidUnitId, setPendingInvalidUnitId] = useState<number | null>(null);
  const firstInvalidUnitRef = useRef<HTMLDivElement | null>(null);

  const selectedBlock = blocks.find(block => block.id === selectedBlockId);

  useEffect(() => {
    if (blocks.length === 0) {
      setSelectedBlockId(null);
      setSelectedFloor(null);
      return;
    }

    if (!selectedBlock) {
      setSelectedBlockId(blocks[0].id ?? null);
      setSelectedFloor(1);
      return;
    }

    if (!selectedFloor || selectedFloor > selectedBlock.floorCount) {
      setSelectedFloor(1);
    }
  }, [blocks, selectedBlock, selectedBlockId, selectedFloor, setSelectedBlockId, setSelectedFloor]);

  // Find duplicate unitNumbers within the same blockId
  const duplicateUnits = useMemo(() => {
    const duplicates = new Set<number>(); // Set of unit IDs that have duplicates
    
    // Group units by blockId
    const unitsByBlock = new Map<number, SubProject[]>();
    units.forEach(unit => {
      if (!unit.blockId || !unit.unitNumber) return;
      if (!unitsByBlock.has(unit.blockId)) {
        unitsByBlock.set(unit.blockId, []);
      }
      unitsByBlock.get(unit.blockId)!.push(unit);
    });

    // Check for duplicates within each block
    unitsByBlock.forEach((blockUnits) => {
      const unitNumberCounts = new Map<number, number[]>();
      blockUnits.forEach(unit => {
        const unitNumber = unit.unitNumber!;
        if (!unitNumberCounts.has(unitNumber)) {
          unitNumberCounts.set(unitNumber, []);
        }
        unitNumberCounts.get(unitNumber)!.push(unit.id!);
      });

      // Mark all units with duplicate unitNumbers
      unitNumberCounts.forEach((unitIds) => {
        if (unitIds.length > 1) {
          unitIds.forEach(id => duplicates.add(id));
        }
      });
    });

    return duplicates;
  }, [units]);

  const hasDuplicates = duplicateUnits.size > 0;

  // Notify parent about duplicate status changes
  useEffect(() => {
    onDuplicateChange?.(hasDuplicates);
  }, [hasDuplicates, onDuplicateChange]);

  // Find the first invalid unit ID for scrolling
  const firstInvalidUnitId = useMemo(() => {
    if (!hasDuplicates) return null;
    // Find the first unit (by order in units array) that has a duplicate
    for (const unit of units) {
      if (unit.id && duplicateUnits.has(unit.id)) {
        return unit.id;
      }
    }
    return null;
  }, [units, duplicateUnits, hasDuplicates]);

  useEffect(() => {
    if (pendingInvalidUnitId !== firstInvalidUnitId || !firstInvalidUnitRef.current) {
      return;
    }

    firstInvalidUnitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstInvalidUnitRef.current.classList.add('animate-pulse');
    const timeoutId = window.setTimeout(() => {
      firstInvalidUnitRef.current?.classList.remove('animate-pulse');
      setPendingInvalidUnitId(null);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [firstInvalidUnitId, pendingInvalidUnitId, selectedBlockId, selectedFloor]);

  const scrollToFirstInvalidUnit = () => {
    const invalidUnit = units.find(unit => unit.id === firstInvalidUnitId);
    if (!invalidUnit) {
      return;
    }

    setSelectedBlockId(invalidUnit.blockId ?? null);
    setSelectedFloor(invalidUnit.floor);
    setPendingInvalidUnitId(invalidUnit.id ?? null);
  };

  const addUnit = (blockId: number, floor: number) => {
    const nextId = Math.min(0, ...units.map(unit => unit.id ?? 0)) - 1;
    const nextUnitNumber = Math.max(0, ...units.map(unit => unit.unitNumber || 0)) + 1;
    const newUnit: SubProject = {
      // Use negative ID for new units to distinguish from database IDs
      id: nextId,
      area: 50,
      floor: floor,
      point: 7,
      roomCount: 1,
      options: "",
      direction: "north",
      unitNumber: nextUnitNumber,
      blockId: blockId,
    };
    setUnits([...units, newUnit]);
  };

  const updateUnit = (id: number, field: keyof SubProject, value: string | number | undefined) => {
    setUnits(units.map(unit => 
      unit.id === id ? { ...unit, [field]: value } : unit
    ));
  };

  const removeUnit = (id: number) => {
    setUnits(units.filter(unit => unit.id !== id));
  };

  const directionOptions = [
    { label: 'شمال', value: 'north' },
    { label: 'شمال‑شرق', value: 'north-east' },
    { label: 'شرق', value: 'east' },
    { label: 'جنوب‑شرق', value: 'south-east' },
    { label: 'جنوب', value: 'south' },
    { label: 'جنوب‑غرب', value: 'south-west' },
    { label: 'غرب', value: 'west' },
    { label: 'شمال‑غرب', value: 'north-west' }
  ];

  const floorUnits = selectedBlockId && selectedFloor
    ? units.filter(unit => unit.blockId === selectedBlockId && unit.floor === selectedFloor)
    : [];

  return (
    <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-b border-purple-200/30 pb-6">
        <CardTitle className="flex items-center gap-4 text-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-sm opacity-30"></div>
            <div className="relative p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Home className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              اطلاعات واحدهای مسکونی
            </span>
            <p className="text-sm text-slate-500 font-normal mt-1">
              مشخصات و جزئیات واحدهای مسکونی را تعریف کنید
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {hasDuplicates && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 font-medium mb-2">
              *حداقل ۲ واحد مسکونی در یک بلوک دارای شماره واحدهای یکسان هستند. لطفا نسبت به اصلاح آنها اقدام فرمایید
            </p>
            <button
              onClick={scrollToFirstInvalidUnit}
              className="text-sm text-amber-700 hover:text-amber-800 italic cursor-pointer underline decoration-amber-600/50 hover:decoration-amber-700 transition-colors"
              type="button"
            >
              برای شناسایی واحد مورد نظر اینجا کلیک کنید
            </button>
          </div>
        )}
        <div className="space-y-6">
          {blocks.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-purple-200 p-8 text-center text-slate-500">
              ابتدا در مرحله قبل یک بلوک تعریف کنید.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unit-block-select" className="font-medium text-slate-700">
                    بلوک
                  </Label>
                  <Select
                    value={selectedBlockId?.toString() ?? ""}
                    onValueChange={(value) => {
                      setSelectedBlockId(Number(value));
                      setSelectedFloor(1);
                    }}
                  >
                    <SelectTrigger id="unit-block-select" className="w-full">
                      <SelectValue placeholder="انتخاب بلوک" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map(block => (
                        <SelectItem key={block.id} value={block.id!.toString()}>
                          {block.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit-floor-select" className="font-medium text-slate-700">
                    طبقه
                  </Label>
                  <Select
                    value={selectedFloor?.toString() ?? ""}
                    onValueChange={(value) => setSelectedFloor(Number(value))}
                    disabled={!selectedBlock}
                  >
                    <SelectTrigger id="unit-floor-select" className="w-full">
                      <SelectValue placeholder="ابتدا بلوک را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedBlock && Array.from({ length: selectedBlock.floorCount }).map((_, floorIndex) => (
                        <SelectItem key={floorIndex + 1} value={(floorIndex + 1).toString()}>
                          طبقه {floorIndex + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedBlock && selectedFloor && (
                <div>
                  <div className="mb-4">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-purple-700">
                      <Square className="w-5 h-5" />
                      {selectedBlock.name} / طبقه {selectedFloor}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {selectedBlock.floorCount} طبقه - {selectedBlock.buildingArea} متر مربع زیربنا
                    </p>
                  </div>

                  <Card className="border-2 border-purple-200/40 bg-purple-50/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-purple-700 text-base">
                        طبقه {selectedFloor}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {floorUnits.map((unit, unitIndex) => {
                        const isDuplicate = unit.id ? duplicateUnits.has(unit.id) : false;
                        const isFirstInvalid = unit.id === firstInvalidUnitId;
                        return (
                        <div 
                          key={unit.id}
                          ref={isFirstInvalid ? (el) => { firstInvalidUnitRef.current = el; } : null}
                        >
                        <Card 
                          className="bg-gradient-to-br from-white/80 to-purple-50/30 border-0 ring-1 ring-purple-200/50"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-slate-900 flex items-center gap-3 text-base">
                                <div className="p-2 bg-purple-500 rounded-lg">
                                  <Home className="w-4 h-4 text-white" />
                                </div>
                                <span className="bg-purple-600 bg-clip-text text-transparent">
                                  واحد #{unitIndex + 1}
                                </span>
                              </h4>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeUnit(unit.id!)}
                                aria-label={`حذف واحد ${unit.unitNumber}`}
                                className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                              <div>
                                <Label className="flex items-center gap-1 text-slate-700 font-medium text-sm mb-1">
                                  <Square className="w-3 h-3 text-blue-600" />
                                  متراژ (متر مربع) *
                                </Label>
                                 <Input 
                                   required 
                                   type='number' 
                                   value={unit.area || ""} 
                                   onChange={(e) => updateUnit(unit.id!, 'area', e.target.value ? Number(e.target.value) : "")}
                                   className="h-9"
                                   min="1"
                                 />
                              </div>

                              <div>
                                <Label className="flex items-center gap-1 text-slate-700 font-medium text-sm mb-1">
                                  <Square className="w-3 h-3 text-green-600" />
                                  قیمت هر متر (تومان)
                                </Label>
                                 <Input 
                                   type='number' 
                                   value={unit.pricePerMeter || ""} 
                                   onChange={(e) => updateUnit(unit.id!, 'pricePerMeter', e.target.value ? Number(e.target.value) : undefined)}
                                   className="h-9"
                                   min="0"
                                 />
                              </div>

                              <div>
                                <Label className="flex items-center gap-1 text-slate-700 font-medium text-sm mb-1">
                                  <Users className="w-3 h-3 text-green-600" />
                                  تعداد خواب *
                                </Label>
                                 <Input 
                                   required 
                                   type='number' 
                                   value={unit.roomCount || ""} 
                                   onChange={(e) => updateUnit(unit.id!, 'roomCount', e.target.value ? Number(e.target.value) : "")}
                                   className="h-9"
                                   min="1"
                                 />
                              </div>

                              <div>
                                <Label className="flex items-center gap-1 text-slate-700 font-medium text-sm mb-1">
                                  <Navigation className="w-3 h-3 text-orange-600" />
                                  جهت *
                                </Label>
                                <Select 
                                  value={unit.direction} 
                                  onValueChange={(value) => updateUnit(unit.id!, 'direction', value)}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {directionOptions.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>


                              <div>
                                <Label className="flex items-center gap-1 text-slate-700 font-medium text-sm mb-1">
                                  <Home className="w-3 h-3 text-purple-600" />
                                  شماره واحد
                                </Label>
                                 <Input 
                                   type='number' 
                                   value={unit.unitNumber || ""} 
                                   onChange={(e) => updateUnit(unit.id!, 'unitNumber', e.target.value ? Number(e.target.value) : "")}
                                   className={`h-9 ${isDuplicate ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' : ''}`}
                                   min="1"
                                 />
                              </div>
                            </div>

                            <div className="mt-4">
                              <Label className="flex items-center gap-1 text-slate-700 font-medium text-sm mb-1">
                                <Square className="w-3 h-3 text-slate-600" />
                                توضیحات اضافی
                              </Label>
                              <Textarea 
                                value={unit.options || ""} 
                                onChange={(e) => updateUnit(unit.id!, 'options', e.target.value)}
                                className="min-h-[60px]"
                                placeholder="توضیحات اضافی درباره این واحد..."
                              />
                            </div>
                          </CardContent>
                        </Card>
                        </div>
                        );
                      })}

                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => addUnit(selectedBlock.id!, selectedFloor)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        افزودن واحد به طبقه {selectedFloor}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
