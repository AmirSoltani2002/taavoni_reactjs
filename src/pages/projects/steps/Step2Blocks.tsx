import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Blocks, Plus, Trash, Building, Square, FileText } from "lucide-react";
import type { Block } from "../columns";

interface Step2BlocksProps {
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}

export const Step2Blocks: React.FC<Step2BlocksProps> = ({ 
  blocks, 
  setBlocks 
}) => {
  const addBlock = () => {
    const nextId = Math.min(0, ...blocks.map(block => block.id ?? 0)) - 1;
    const newBlock: Block = {
      id: nextId,
      name: `بلوک ${blocks.length + 1}`,
      floorCount: 1,
      shareArea: 0,
      buildingArea: 0,
      description: "",
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: number, field: keyof Block, value: string | number) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    ));
  };

  const removeBlock = (id: number) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-b border-green-200/30 pb-6">
        <CardTitle className="flex items-center gap-4 text-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur-sm opacity-30"></div>
            <div className="relative p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <Blocks className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
              اطلاعات بلوک‌ها
            </span>
            <p className="text-sm text-slate-500 font-normal mt-1">
              مشخصات و جزئیات بلوک‌های پروژه را تعریف کنید
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {blocks.map((block) => (
            <Card key={block.id} className="border-2 border-green-200/40 bg-green-50/30 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-700 text-lg flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {block.name}
                  </CardTitle>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeBlock(block.id!)}
                    aria-label={`حذف ${block.name}`}
                    className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                      <Building className="w-4 h-4 text-green-600" />
                      نام بلوک *
                    </Label>
                    <Input 
                      required 
                      type='text' 
                      value={block.name} 
                      onChange={(e) => updateBlock(block.id!, 'name', e.target.value)}
                      className="h-10"
                      placeholder="نام بلوک را وارد کنید..."
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      تعداد طبقات *
                    </Label>
                     <Input 
                       required 
                       type='number' 
                       value={block.floorCount || ""} 
                       onChange={(e) => updateBlock(block.id!, 'floorCount', e.target.value ? Number(e.target.value) : "")}
                       className="h-10"
                       min="1"
                       placeholder="تعداد طبقات..."
                     />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                      <Square className="w-4 h-4 text-purple-600" />
                      مساحت مشاعات (متر مربع) *
                    </Label>
                     <Input 
                       required 
                       type='number' 
                       value={block.shareArea || ""} 
                       onChange={(e) => updateBlock(block.id!, 'shareArea', e.target.value ? Number(e.target.value) : "")}
                       className="h-10"
                       min="0"
                       placeholder="مساحت مشاعات..."
                     />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                      <Square className="w-4 h-4 text-orange-600" />
                      مساحت زیربنا (متر مربع) *
                    </Label>
                     <Input 
                       required 
                       type='number' 
                       value={block.buildingArea || ""} 
                       onChange={(e) => updateBlock(block.id!, 'buildingArea', e.target.value ? Number(e.target.value) : "")}
                       className="h-10"
                       min="1"
                       placeholder="مساحت زیربنا..."
                     />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    توضیحات بلوک
                  </Label>
                  <Textarea 
                    value={block.description || ""} 
                    onChange={(e) => updateBlock(block.id!, 'description', e.target.value)}
                    className="min-h-[80px]"
                    placeholder="توضیحات اضافی درباره این بلوک..."
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center pt-4">
            <Button 
              type="button" 
              onClick={addBlock}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              افزودن بلوک جدید
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
