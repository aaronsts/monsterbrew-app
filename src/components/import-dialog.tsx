import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { createCreatureSchema } from "@/schema/createCreatureSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { fromImprovedInitiative } from "@/services/converters/improvedInitiative";
import { fromTetacube } from "@/services/converters/tetraCube";
import { ImportTypes } from "@/lib/constants";
import { fromOpen5e } from "@/services/converters/open5e";
import { from5ETools } from "@/services/converters/fiveETools";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [importedStatblock, setImportedStatblock] = useState<string>();
  const [format, setFormat] = useState<string | undefined>();
  const formContext = useFormContext<z.infer<typeof createCreatureSchema>>();

  const readFileOnUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const uploadedFile = e.target.files[0];
    const extension = uploadedFile.name.split(".")[1];
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      try {
        if (extension === "json") {
          setImportedStatblock(fileReader.result as string);
        } else {
          // Remove File from filelist if not json format
          e.target.value = "";
          throw Error("Only JSON files are supported");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(message);
        throw Error(message);
      }
    };
    if (uploadedFile !== undefined) fileReader.readAsText(uploadedFile);
  };

  function handleImportCreature() {
    if (!importedStatblock) return;
    const parsedImport = JSON.parse(importedStatblock);
    let monsterbrewCreature: z.infer<typeof createCreatureSchema>;

    switch (format) {
      case ImportTypes.ImprovedInitiative:
        try {
          monsterbrewCreature = fromImprovedInitiative(parsedImport);
          formContext.reset(monsterbrewCreature);
        } catch {
          toast.error("An Error occured during conversion");
        }
        onOpenChange(false);
        break;
      case ImportTypes.TetraCube:
        monsterbrewCreature = fromTetacube(parsedImport);
        formContext.reset(monsterbrewCreature);
        onOpenChange(false);
        break;
      case ImportTypes.Open5e:
        monsterbrewCreature = fromOpen5e(parsedImport);
        formContext.reset(monsterbrewCreature);
        onOpenChange(false);
        break;
      case ImportTypes.FiveETools:
        if (typeof from5ETools(parsedImport) !== undefined) {
          monsterbrewCreature = from5ETools(parsedImport);
          formContext.reset(monsterbrewCreature);
        }
        onOpenChange(false);
        break;
      default:
        break;
    }
    setFormat(undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importing creature</DialogTitle>
          <DialogDescription>
            Please upload a file or past the content below.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto h-auto bg-background rounded-md p-1">
          {importedStatblock?.toString()}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="file-upload">File upload</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={(e) => readFileOnUpload(e)}
            className="bg-carrara-100 border-carrara-300"
          />
        </div>

        <DialogFooter className="items-end">
          <Select onValueChange={(v) => setFormat(v as string)}>
            <SelectTrigger className="w-fit">
              <SelectValue id="file-format" placeholder="Select a format" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ImportTypes).map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            disabled={!format}
            onClick={handleImportCreature}
            type="submit"
            variant="default"
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
