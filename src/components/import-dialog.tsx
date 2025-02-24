import { ChangeEvent, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import {
  createCreatureSchema,
  defaultCreature,
} from "@/schema/createCreatureSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { fromImprovedInitiative } from "@/services/converters/improved-initiative";
import { fromTetacube } from "@/services/converters/tetra-cube";
import { Alert } from "./ui/alert";

export function ImportDialog() {
  const [importedStatblock, setImportedStatblock] = useState<string>();
  const [format, setFormat] = useState<string | undefined>();
  const [showModal, setShowModal] = useState(false);
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
      } catch (err: any) {
        toast.error(err.message);
        throw Error(err.message);
      }
    };
    if (uploadedFile !== undefined) fileReader.readAsText(uploadedFile);
  };

  function handleImportCreature() {
    if (!importedStatblock) return;
    const parsedImport = JSON.parse(importedStatblock);
    let monsterbrewCreature: z.infer<typeof createCreatureSchema>;

    switch (format) {
      case "improved-initiative":
        try {
          monsterbrewCreature = fromImprovedInitiative(parsedImport);
          formContext.reset(monsterbrewCreature);
        } catch (error) {
          toast.error("An Error occured during conversion");
        }
        setShowModal(false);
        break;
      case "tetra-cube":
        monsterbrewCreature = fromTetacube(parsedImport);
        formContext.reset(monsterbrewCreature);
        setShowModal(false);
        break;
      default:
        break;
    }
    setFormat(undefined);
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        <Button>Import</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importing creature</DialogTitle>
          <DialogDescription>
            Please upload a file or past the content below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          {importedStatblock?.toString()}
        </ScrollArea>

        <div className="grid gap-2">
          <Label htmlFor="file-upload">File upload</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={(e) => readFileOnUpload(e)}
          />
        </div>
        <div>
          {format === "tetra-cube" && (
            <Alert
              title="Tetracube"
              description="Lair and Mythical actions are not supported"
              variant="info"
            />
          )}
        </div>

        <DialogFooter className="items-end">
          <Select onValueChange={(v) => setFormat(v)}>
            <SelectTrigger className="w-fit">
              <SelectValue id="file-format" placeholder="Select a format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="improved-initiative">
                Improved Initiative
              </SelectItem>
              <SelectItem value="tetra-cube">Tetra Cube</SelectItem>
            </SelectContent>
          </Select>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={!format}
            onClick={handleImportCreature}
            type="submit"
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
