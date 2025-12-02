import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const BANK_OPTIONS = [
  "بانک ملت",
  "بانک پارسیان",
  "بانک پاسارگاد",
  "بانک سپه",
  "بانک سامان",
  "بانک اقتصاد نوین",
  "بانک شهر",
  "بانک سینا",
  "بانک دی",
  "بانک مسکن",
  "موسسه اعتباری ملل",
  "بانک قرض الحسنه رسالت",
  "بانک قرض الحسنه مهر ایران",
  "بانک سرمایه",
  "بانک گردشگری",
  "بانک رفاه کارگران",
  "بانک خاورمیانه",
  "بانک کشاورزی ایران",
  "بانک توسعه تعاون",
];

interface BankSelectProps {
  /** Current selected bank value */
  value: string;
  /** Called when bank changes */
  onChange: (value: string) => void;
  /** Optional field label */
  label?: string;
  /** Marks the field as required (adds * to label) */
  required?: boolean;
  /** Optional id for accessibility */
  id?: string;
  /** Optional custom placeholder */
  placeholder?: string;
  /** Optional className applied to the wrapper */
  className?: string;
}

export function BankSelect({
  value,
  onChange,
  label,
  required,
  id = "bank",
  placeholder = "انتخاب بانک",
  className,
}: BankSelectProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Label>
      )}
      <Select
        value={value || ""}
        onValueChange={(val) => {
          onChange(val);
        }}
      >
        <SelectTrigger id={id} className="w-full h-10">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {BANK_OPTIONS.map((bank) => (
            <SelectItem key={bank} value={bank}>
              {bank}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


