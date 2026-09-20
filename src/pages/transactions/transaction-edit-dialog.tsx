import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { User } from "../users/columns";
import type { FinalTransaction, Transaction } from "./columns";
import FinalTransactionCreate from "./final-create";
import PresellingTransactionCreate from "./preselling-create";

type TransactionEditDialogProps = {
    transaction: Transaction | FinalTransaction | null;
    type: 'preselling' | 'final';
    userInfo?: User;
    onClose: () => void;
    onSaved: () => void;
};

export default function TransactionEditDialog({
    transaction,
    type,
    userInfo,
    onClose,
    onSaved,
}: TransactionEditDialogProps) {
    if (!transaction) return null;

    const handleSubmit = () => {
        onClose();
        onSaved();
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>ویرایش تراکنش</DialogTitle>
                    <DialogDescription>
                        اطلاعات تراکنش را ویرایش و تغییرات را ذخیره کنید.
                    </DialogDescription>
                </DialogHeader>
                {type === 'preselling' ? (
                    <PresellingTransactionCreate
                        initialValues={transaction as Transaction}
                        isEdit
                        userInfo={userInfo}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                    />
                ) : (
                    <FinalTransactionCreate
                        initialValues={transaction as FinalTransaction}
                        isEdit
                        userInfo={userInfo}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
