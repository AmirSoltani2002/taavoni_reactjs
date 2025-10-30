import type { HTMLInputTypeAttribute } from "react";
import type React from "react";
import { Input } from "@/components/ui/input";
import { Calendar22 } from "@/components/calendars/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "./slider";
import { cn } from "@/lib/utils";

interface FInputProps<FieldType> {
    values: FieldType;
    item: {
        title?: string;
        name: keyof FieldType;
        isRequired?: boolean;
        type?: HTMLInputTypeAttribute | 'select' | 'slider';
        options?: { label: string; value: string }[];
        className?: string;
        hideWhenEdit?: boolean;
        hideWhenNotAdmin?: boolean;
    };
    handleSelect: (name: keyof FieldType, value: string | number) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

    isEdit?: boolean;
    urlType?: string | null;
    className?: string;
    
}
const FInput = <FieldType,>({
    values,
    item,
    handleSelect,
    handleChange,
    isEdit,
    urlType,
    className,
}: FInputProps<FieldType>) => {
    if(
        (item.hideWhenEdit && isEdit) ||
        (item.hideWhenNotAdmin && !(urlType == 'admin' || urlType == 'system'))
    ){
        return undefined;
    } else if(item.type === 'select' && item.options) {
        return <div className={className}>
        <label>{item.title + (item.isRequired ? '*' : '')}</label>
        <Select value={values[item.name]?.toString()} onValueChange={v => handleSelect(item.name, v)} required={item.isRequired}>
            <SelectTrigger className={cn("w-full", className)}>
            <SelectValue placeholder="انتخاب کنید" />
            </SelectTrigger>
            <SelectContent>
            {item.options.map(sopt => (
                <SelectItem value={sopt.value}>{sopt.label}</SelectItem>
            ))}
            </SelectContent>
        </Select>
        </div>
    } else if(item.type === 'date') {
        return <div className={className}>
        <Calendar22 
            title={item.title + (item.isRequired ? '*' : '')}
            date={values[item.name]?.toString()}
            setDate={(d) => {
            handleSelect(item.name, d ? d.toISOString() : '')
            }}
        />
        </div>
    } else if(item.type === 'slider') {
        return <div className={className}>
            <label>{item.title + (item.isRequired ? '*' : '')}</label>
            <Slider
                value={[Number(values[item.name]) || 7]}
                onValueChange={(val: number[]) => handleSelect(item.name, val[0])}
                className="h-11 bg-white/60 border-slate-200 focus:bg-white focus:border-purple-400 focus:ring-purple-400/20 transition-all duration-200"
                min={0}
                max={10}
                defaultValue={[7]}
            />
        </div>
    } else {
        return <div className={className}>
        <label>{item.title + (item.isRequired ? '*' : '')}</label>
        <Input 
            name={item.name.toString()} 
            value={values[item.name]?.toString()}
            type={item.type || 'text'} 
            onChange={handleChange} 
            required={item.isRequired} 
        />
        </div>
    }
}
export default FInput;