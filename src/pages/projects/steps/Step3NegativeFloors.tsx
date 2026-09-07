import { useEffect } from "react";
import { Layers3, SquareParking, Warehouse, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Block, NegativeFloor } from "../columns";

interface Step3NegativeFloorsProps {
  blocks: Block[];
  negativeFloors: NegativeFloor[];
  setNegativeFloors: (negativeFloors: NegativeFloor[]) => void;
  selectedBlockId: number | null;
  setSelectedBlockId: (blockId: number | null) => void;
  selectedFloor: number | null;
  setSelectedFloor: (floor: number | null) => void;
}

const getCountError = (value: number | undefined, label: string) => {
  if (value === undefined) {
    return `${label} الزامی است.`;
  }
  if (!Number.isInteger(value) || value < 0) {
    return `${label} باید عدد صحیح و غیرمنفی باشد.`;
  }
  return null;
};

export const Step3NegativeFloors: React.FC<Step3NegativeFloorsProps> = ({
  blocks,
  negativeFloors,
  setNegativeFloors,
  selectedBlockId,
  setSelectedBlockId,
  selectedFloor,
  setSelectedFloor,
}) => {
  const selectedBlock = blocks.find((block) => block.id === selectedBlockId);
  const selectedNegativeFloor = negativeFloors.find(
    (floor) => floor.blockId === selectedBlockId && floor.floorNumber === selectedFloor,
  );

  useEffect(() => {
    if (blocks.length === 0) {
      setSelectedBlockId(null);
      setSelectedFloor(null);
      return;
    }

    const nextBlock = selectedBlock ?? blocks[0];
    if (!selectedBlock) {
      setSelectedBlockId(nextBlock.id ?? null);
    }

    const negativeFloorCount = nextBlock.negativeFloorCount ?? 0;
    if (negativeFloorCount === 0) {
      setSelectedFloor(null);
    } else if (!selectedFloor || selectedFloor > negativeFloorCount) {
      setSelectedFloor(1);
    }
  }, [blocks, selectedBlock, selectedFloor, setSelectedBlockId, setSelectedFloor]);

  const updateNegativeFloor = (
    field: keyof NegativeFloor,
    value: string | number | undefined,
  ) => {
    if (!selectedNegativeFloor) {
      return;
    }

    setNegativeFloors(negativeFloors.map((floor) =>
      floor.id === selectedNegativeFloor.id ? { ...floor, [field]: value } : floor,
    ));
  };

  const parkingError = getCountError(
    selectedNegativeFloor?.parkingCount,
    "تعداد پارکینگ",
  );
  const storageError = getCountError(
    selectedNegativeFloor?.storageCount,
    "تعداد انباری",
  );

  return (
    <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-0 ring-1 ring-white/20 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 border-b border-amber-200/30 pb-6">
        <CardTitle className="flex items-center gap-4 text-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur-sm opacity-30" />
            <div className="relative p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
              <Layers3 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-bold">
              اطلاعات طبقات منفی
            </span>
            <p className="text-sm text-slate-500 font-normal mt-1">
              مشخصات پارکینگ و انباری طبقات منفی را تعریف کنید
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {blocks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-amber-200 p-8 text-center text-slate-500">
            ابتدا در مرحله قبل یک بلوک تعریف کنید.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="negative-floor-block-select" className="font-medium text-slate-700">
                  بلوک
                </Label>
                <Select
                  value={selectedBlockId?.toString() ?? ""}
                  onValueChange={(value) => {
                    const blockId = Number(value);
                    const block = blocks.find((item) => item.id === blockId);
                    setSelectedBlockId(blockId);
                    setSelectedFloor((block?.negativeFloorCount ?? 0) > 0 ? 1 : null);
                  }}
                >
                  <SelectTrigger id="negative-floor-block-select" className="w-full">
                    <SelectValue placeholder="انتخاب بلوک" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocks.map((block) => (
                      <SelectItem key={block.id} value={block.id!.toString()}>
                        {block.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="negative-floor-select" className="font-medium text-slate-700">
                  طبقه منفی
                </Label>
                <Select
                  value={selectedFloor?.toString() ?? ""}
                  onValueChange={(value) => setSelectedFloor(Number(value))}
                  disabled={!selectedBlock || (selectedBlock.negativeFloorCount ?? 0) === 0}
                >
                  <SelectTrigger id="negative-floor-select" className="w-full">
                    <SelectValue placeholder="طبقه منفی را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedBlock && Array.from({ length: selectedBlock.negativeFloorCount ?? 0 }).map((_, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        طبقه منفی {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedBlock && (selectedBlock.negativeFloorCount ?? 0) === 0 && (
              <div className="rounded-lg border-2 border-dashed border-amber-200 p-8 text-center text-slate-500">
                برای این بلوک طبقه منفی تعریف نشده است.
              </div>
            )}

            {selectedNegativeFloor && (
              <Card className="border-2 border-amber-200/40 bg-amber-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-amber-700 text-base">
                    {selectedBlock?.name} / طبقه منفی {selectedNegativeFloor.floorNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="negative-floor-parking-count" className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                        <SquareParking className="w-4 h-4 text-amber-600" />
                        تعداد پارکینگ *
                      </Label>
                      <Input
                        id="negative-floor-parking-count"
                        required
                        type="number"
                        min="0"
                        step="1"
                        value={selectedNegativeFloor.parkingCount ?? ""}
                        onChange={(event) => updateNegativeFloor(
                          "parkingCount",
                          event.target.value === "" ? undefined : Number(event.target.value),
                        )}
                        aria-invalid={Boolean(parkingError)}
                      />
                      {parkingError && <p className="mt-1 text-sm text-red-600">{parkingError}</p>}
                    </div>

                    <div>
                      <Label htmlFor="negative-floor-storage-count" className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                        <Warehouse className="w-4 h-4 text-orange-600" />
                        تعداد انباری *
                      </Label>
                      <Input
                        id="negative-floor-storage-count"
                        required
                        type="number"
                        min="0"
                        step="1"
                        value={selectedNegativeFloor.storageCount ?? ""}
                        onChange={(event) => updateNegativeFloor(
                          "storageCount",
                          event.target.value === "" ? undefined : Number(event.target.value),
                        )}
                        aria-invalid={Boolean(storageError)}
                      />
                      {storageError && <p className="mt-1 text-sm text-red-600">{storageError}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="negative-floor-description" className="flex items-center gap-2 text-slate-700 font-medium mb-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      توضیحات طبقه منفی
                    </Label>
                    <Textarea
                      id="negative-floor-description"
                      value={selectedNegativeFloor.description ?? ""}
                      onChange={(event) => updateNegativeFloor("description", event.target.value)}
                      className="min-h-[80px]"
                      placeholder="توضیحات اضافی درباره این طبقه منفی..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
