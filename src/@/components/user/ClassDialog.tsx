import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { ClassForm } from "./ClassForm";

export const ClassDialog = () => {
    return (
        <Dialog open={true}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Dokonči nastavení</DialogTitle>
                <DialogDescription className="flex flex-col gap-4">
                    <span>Nastav si prosím svoji třídu, abychom ti mohli ukázat akce, které se tě týkají.</span>
                    <ClassForm />
                </DialogDescription>
            </DialogHeader>
        </DialogContent>
    </Dialog>
    );
}