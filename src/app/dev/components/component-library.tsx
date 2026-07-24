import { useState } from "react";
import {
  Download,
  Info,
  Search,
  Settings,
  Skull,
  Swords,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { StandAloneDescription } from "@/components/ui/stand-alone-description";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const COLOR_SCALES = [
  "neutral",
  "primary",
  "accent",
  "success",
  "warning",
  "info",
  "destructive",
] as const;

const SCALE_STEPS = [100, 300, 500, 700, 900] as const;

const SEMANTIC_TOKENS = [
  "background",
  "foreground",
  "card",
  "popover",
  "primary",
  "primary-hover",
  "secondary",
  "muted",
  "accent",
  "accent-hover",
  "success",
  "warning",
  "info",
  "destructive",
  "border",
  "input",
  "ring",
] as const;

const CREATURE_TYPE_COLORS = [
  "aberration",
  "beast",
  "celestial",
  "construct",
  "dragon",
  "elemental",
  "fey",
  "fiend",
  "giant",
  "humanoid",
  "monstrosity",
  "ooze",
  "plant",
  "undead",
  "other",
] as const;

const BUTTON_COLORS = ["neutral", "primary", "accent", "destructive"] as const;

const BUTTON_STYLES = [
  "filled",
  "light",
  "outline",
  "ghost",
  "transparent",
] as const;

const BADGE_VARIANTS = [
  "default",
  "secondary",
  "accent",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const;

const DEMO_TYPES = [
  { value: "dragon", label: "Dragon", description: "Winged, scaled, greedy" },
  { value: "fiend", label: "Fiend", description: "Denizens of the Lower Planes" },
  { value: "ooze", label: "Ooze", description: "Gelatinous and hungry" },
  { value: "undead", label: "Undead", description: "Formerly alive" },
];

const SECTIONS = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Badges" },
  { id: "alerts", label: "Alerts" },
  { id: "form-controls", label: "Form controls" },
  { id: "fields", label: "Fields" },
  { id: "cards", label: "Cards" },
  { id: "items", label: "Items" },
  { id: "accordion", label: "Accordion" },
  { id: "table", label: "Table" },
  { id: "typeset", label: "Typeset" },
  { id: "overlays", label: "Overlays" },
  { id: "command", label: "Command" },
  { id: "misc", label: "Misc" },
] as const;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-4 border-b pb-2 font-heading">{title}</h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Demo({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <div
        className={
          className ?? "flex flex-wrap items-center gap-3 border border-dashed p-4"
        }
      >
        {children}
      </div>
    </div>
  );
}

function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-12 w-full border"
        style={{ background: `var(${cssVar})` }}
      />
      <span className="text-[10px] text-muted-foreground">{name}</span>
    </div>
  );
}

export function ComponentLibrary() {
  const [comboboxValue, setComboboxValue] = useState("");
  const [sliderValue, setSliderValue] = useState<number | ReadonlyArray<number>>(
    30,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10 px-6 py-10">
      {/* Section nav */}
      <nav className="sticky top-20 hidden h-fit w-40 shrink-0 flex-col gap-1 lg:flex">
        <p className="mb-2 text-xs font-medium tracking-widest text-primary uppercase">
          Sections
        </p>
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col gap-14">
        <header>
          <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase">
            <span aria-hidden className="size-1.5 bg-primary" />
            Dev only
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Component library
          </h1>
          <p className="mt-2 text-muted-foreground">
            A visual inventory of every UI component and design token. This page
            is only reachable on localhost.
          </p>
        </header>

        <Section id="colors" title="Colors">
          <Demo label="Scales" className="flex flex-col gap-4 border border-dashed p-4">
            {COLOR_SCALES.map((scale) => (
              <div key={scale}>
                <p className="mb-1 text-xs font-medium">{scale}</p>
                <div className="grid grid-cols-5 gap-2">
                  {SCALE_STEPS.map((step) => (
                    <Swatch
                      key={step}
                      name={`${step}`}
                      cssVar={`--${scale}-${step}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </Demo>
          <Demo
            label="Semantic tokens"
            className="grid grid-cols-3 gap-3 border border-dashed p-4 sm:grid-cols-5"
          >
            {SEMANTIC_TOKENS.map((token) => (
              <Swatch key={token} name={token} cssVar={`--${token}`} />
            ))}
          </Demo>
          <Demo
            label="Creature type colors"
            className="grid grid-cols-3 gap-3 border border-dashed p-4 sm:grid-cols-5"
          >
            {CREATURE_TYPE_COLORS.map((type) => (
              <Swatch key={type} name={type} cssVar={`--color-${type}`} />
            ))}
          </Demo>
        </Section>

        <Section id="typography" title="Typography">
          <Demo label="Headings" className="flex flex-col gap-2 border border-dashed p-4">
            <span className="text-4xl font-bold tracking-tight">
              Heading one
            </span>
            <span className="text-3xl font-medium">Heading two</span>
            <span className="text-xl font-bold">Heading three</span>
          </Demo>
          <Demo label="Fonts" className="flex flex-col gap-2 border border-dashed p-4">
            <p className="font-mono">
              JetBrains Mono — the quick brown fox jumps over the lazy dog.
            </p>
            <p className="font-heading text-lg">
              Oxanium — the quick brown fox jumps over the lazy dog.
            </p>
            <p className="font-nippo text-lg">
              Nippo — the quick brown fox jumps over the lazy dog.
            </p>
          </Demo>
          <Demo label="Body" className="flex flex-col gap-2 border border-dashed p-4">
            <p>Default body text.</p>
            <p className="text-muted-foreground">Muted body text.</p>
            <p className="text-primary">Primary text.</p>
            <p className="text-accent">Accent text.</p>
            <p className="text-destructive">Destructive text.</p>
          </Demo>
        </Section>

        <Section id="buttons" title="Buttons">
          <Demo
            label="Color × variant"
            className="flex flex-col gap-3 border border-dashed p-4"
          >
            {BUTTON_COLORS.map((color) => (
              <div key={color} className="flex flex-wrap items-center gap-3">
                <span className="w-20 text-xs text-muted-foreground">
                  {color}
                </span>
                {BUTTON_STYLES.map((variant) => (
                  <Button key={variant} color={color} variant={variant}>
                    {variant}
                  </Button>
                ))}
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-20 text-xs text-muted-foreground">link</span>
              <Button variant="link">link</Button>
            </div>
          </Demo>
          <Demo label="Sizes">
            <Button size="xs">xs</Button>
            <Button size="sm">sm</Button>
            <Button size="default">default</Button>
            <Button size="lg">lg</Button>
            <Button size="icon-xs" aria-label="Settings">
              <Settings />
            </Button>
            <Button size="icon-sm" aria-label="Settings">
              <Settings />
            </Button>
            <Button size="icon" aria-label="Settings">
              <Settings />
            </Button>
            <Button size="icon-lg" aria-label="Settings">
              <Settings />
            </Button>
          </Demo>
          <Demo label="States">
            <Button disabled>Disabled</Button>
            <Button color="neutral" variant="outline">
              <Download data-icon="inline-start" />
              With icon
            </Button>
            <Button color="neutral" variant="outline">
              <LoadingSpinner className="size-4" />
              Loading
            </Button>
          </Demo>
        </Section>

        <Section id="badges" title="Badges">
          <Demo label="Variants">
            {BADGE_VARIANTS.map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
            <Badge>
              <Skull />
              With icon
            </Badge>
          </Demo>
          <Demo label="Creature types">
            {CREATURE_TYPE_COLORS.map((type) => (
              <Badge key={type} variant={type}>
                {type}
              </Badge>
            ))}
          </Demo>
        </Section>

        <Section id="alerts" title="Alerts">
          <Demo label="Variants" className="flex flex-col gap-3 border border-dashed p-4">
            <Alert>
              <Info />
              <AlertTitle>Heads up</AlertTitle>
              <AlertDescription>
                Your creatures are stored locally in this browser.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <Skull />
              <AlertTitle>Deletion is permanent</AlertTitle>
              <AlertDescription>
                Clearing browser data removes all saved creatures.
              </AlertDescription>
            </Alert>
          </Demo>
        </Section>

        <Section id="form-controls" title="Form controls">
          <Demo label="Input" className="grid max-w-md gap-3 border border-dashed p-4">
            <Input placeholder="Creature name" />
            <Input placeholder="Disabled" disabled />
            <Input placeholder="Invalid" aria-invalid />
          </Demo>
          <Demo label="Input group" className="grid max-w-md gap-3 border border-dashed p-4">
            <InputGroup>
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search monsters…" />
            </InputGroup>
            <InputGroup>
              <InputGroupInput placeholder="Hit points" />
              <InputGroupAddon align="inline-end">
                <InputGroupText>HP</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <InputGroup>
              <InputGroupInput placeholder="With a button" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton>Apply</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Demo>
          <Demo label="Textarea" className="grid max-w-md gap-3 border border-dashed p-4">
            <Textarea placeholder="Describe the creature's lair…" />
          </Demo>
          <Demo label="Select" className="grid max-w-md gap-3 border border-dashed p-4">
            <Select defaultValue="Medium">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"].map(
                  (size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </Demo>
          <Demo label="Combobox" className="grid max-w-md gap-3 border border-dashed p-4">
            <Combobox
              items={DEMO_TYPES}
              inputValue={comboboxValue}
              itemToStringValue={(item: (typeof DEMO_TYPES)[number]) =>
                item.label
              }
              onInputValueChange={setComboboxValue}
            >
              <ComboboxInput placeholder="Select a type" showClear />
              <ComboboxContent>
                <ComboboxEmpty>No items found.</ComboboxEmpty>
                <ComboboxList>
                  {(item: (typeof DEMO_TYPES)[number]) => (
                    <ComboboxItem key={item.value} value={item.value}>
                      <Item size="sm">
                        <ItemContent>
                          <ItemTitle>{item.label}</ItemTitle>
                          <ItemDescription>{item.description}</ItemDescription>
                        </ItemContent>
                      </Item>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Demo>
          <Demo label="Checkbox / Switch / Slider" className="grid max-w-md gap-4 border border-dashed p-4">
            <div className="flex items-center gap-2">
              <Checkbox id="cl-checkbox" defaultChecked />
              <Label htmlFor="cl-checkbox">Legendary creature</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="cl-switch" defaultChecked />
              <Label htmlFor="cl-switch">Custom hit points</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="cl-switch-sm" size="sm" />
              <Label htmlFor="cl-switch-sm">Small switch</Label>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={sliderValue}
                onValueChange={setSliderValue}
                min={0}
                max={30}
              />
              <span className="w-8 text-right text-xs text-muted-foreground">
                {Array.isArray(sliderValue) ? sliderValue[0] : sliderValue}
              </span>
            </div>
          </Demo>
        </Section>

        <Section id="fields" title="Fields">
          <Demo label="Field set" className="max-w-md border border-dashed p-4">
            <FieldSet>
              <FieldLegend>Identity</FieldLegend>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="cl-field-name">Name</FieldLabel>
                  <Input id="cl-field-name" placeholder="Ancient Red Dragon" />
                  <FieldDescription>
                    The creature's display name.
                  </FieldDescription>
                </Field>
                <Field data-invalid>
                  <FieldLabel htmlFor="cl-field-cr">Challenge rating</FieldLabel>
                  <Input id="cl-field-cr" defaultValue="Banana" aria-invalid />
                  <FieldError errors={[{ message: "Must be a number." }]} />
                </Field>
              </FieldGroup>
            </FieldSet>
          </Demo>
        </Section>

        <Section id="cards" title="Cards">
          <Demo label="Card" className="max-w-md border border-dashed p-4">
            <Card>
              <CardHeader>
                <CardTitle>Ancient Red Dragon</CardTitle>
                <CardDescription>
                  Gargantuan dragon, chaotic evil
                </CardDescription>
                <CardAction>
                  <Badge variant="accent">CR 24</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The most covetous of the chromatic dragons, red dragons
                  tirelessly seek to increase their treasure hoards.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Edit</Button>
                <Button size="sm" color="destructive" variant="light">
                  <Trash2 data-icon="inline-start" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          </Demo>
        </Section>

        <Section id="items" title="Items">
          <Demo label="Item group" className="max-w-md border border-dashed p-4">
            <ItemGroup>
              <Item>
                <ItemMedia variant="icon">
                  <Swords />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Multiattack</ItemTitle>
                  <ItemDescription>
                    The dragon makes three Rend attacks.
                  </ItemDescription>
                </ItemContent>
              </Item>
              <ItemSeparator />
              <Item>
                <ItemMedia variant="icon">
                  <Skull />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Frightful Presence</ItemTitle>
                  <ItemDescription>
                    Each creature within 120 feet must succeed on a Wisdom
                    save or become frightened.
                  </ItemDescription>
                </ItemContent>
              </Item>
            </ItemGroup>
          </Demo>
        </Section>

        <Section id="accordion" title="Accordion">
          <Demo label="Accordion" className="max-w-md border border-dashed p-4">
            <Accordion>
              <AccordionItem>
                <AccordionTrigger>Traits</AccordionTrigger>
                <AccordionContent>
                  Legendary Resistance, Fire Aura, Incandescent Wrath.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem>
                <AccordionTrigger>Actions</AccordionTrigger>
                <AccordionContent>
                  Multiattack, Rend, Fire Breath.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem>
                <AccordionTrigger>Legendary actions</AccordionTrigger>
                <AccordionContent>Commanding Presence, Fiery Rays.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </Demo>
        </Section>

        <Section id="table" title="Table">
          <Demo label="Table" className="border border-dashed p-4">
            <Table>
              <TableCaption>Ability scores</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Ability</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Mod</TableHead>
                  <TableHead>Save</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["STR", 30, "+10", "+10"],
                  ["DEX", 10, "+0", "+7"],
                  ["CON", 29, "+9", "+9"],
                  ["INT", 18, "+4", "+4"],
                ].map(([ability, score, mod, save]) => (
                  <TableRow key={ability}>
                    <TableCell className="font-medium">{ability}</TableCell>
                    <TableCell>{score}</TableCell>
                    <TableCell>{mod}</TableCell>
                    <TableCell>{save}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Demo>
        </Section>

        <Section id="typeset" title="Typeset">
          <Demo
            label="Prose sample (.typeset)"
            className="max-w-2xl border border-dashed p-6"
          >
            <div className="typeset">
              <h1>The Ancient Red Dragon</h1>
              <p>
                The most covetous of the <strong>chromatic dragons</strong>,
                red dragons tirelessly seek to increase their treasure hoards.
                They are <em>exceptionally vain</em>, and this is reflected in
                their <a href="#typeset">lairs</a>.
              </p>
              <h2>Lair actions</h2>
              <p>
                On initiative count <code>20</code> (losing ties), the dragon
                takes a lair action:
              </p>
              <ul>
                <li>Magma erupts from a point within 120 feet.</li>
                <li>
                  A tremor shakes the lair; each creature makes a{" "}
                  <kbd>DC 15</kbd> Dexterity save.
                </li>
                <li>Volcanic gases fill a 20-foot-radius sphere.</li>
              </ul>
              <h3>Regional effects</h3>
              <blockquote>
                The region containing a legendary red dragon's lair is warped
                by the dragon's magic.
              </blockquote>
              <pre>
                <code>{`{ "name": "Ancient Red Dragon", "cr": 24 }`}</code>
              </pre>
              <table>
                <thead>
                  <tr>
                    <th>Die</th>
                    <th>Effect</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1–3</td>
                    <td>Small earthquakes are common.</td>
                  </tr>
                  <tr>
                    <td>4–6</td>
                    <td>Water sources are warm and sulphurous.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Demo>
        </Section>

        <Section id="overlays" title="Overlays">
          <Demo label="Dialog / Sheet / Popover / Dropdown / Tooltip / Toast">
            <Dialog>
              <DialogTrigger render={<Button color="neutral" variant="outline">Dialog</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save creature</DialogTitle>
                  <DialogDescription>
                    Stores the creature in this browser's IndexedDB.
                  </DialogDescription>
                </DialogHeader>
                <Input placeholder="Creature name" />
                <DialogFooter>
                  <DialogClose render={<Button color="neutral" variant="ghost">Cancel</Button>} />
                  <DialogClose render={<Button>Save</Button>} />
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger render={<Button color="neutral" variant="outline">Sheet</Button>} />
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet title</SheetTitle>
                  <SheetDescription>
                    Slides in from the side of the screen.
                  </SheetDescription>
                </SheetHeader>
                <SheetFooter>
                  <SheetClose render={<Button color="neutral" variant="ghost">Close</Button>} />
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <Popover>
              <PopoverTrigger render={<Button color="neutral" variant="outline">Popover</Button>} />
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle>Popover title</PopoverTitle>
                  <PopoverDescription>
                    Anchored floating content.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button color="neutral" variant="outline">Dropdown</Button>}
              />
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Export</DropdownMenuLabel>
                  <DropdownMenuItem>Homebrewery markdown</DropdownMenuItem>
                  <DropdownMenuItem>Improved Initiative</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Include lore
                </DropdownMenuCheckboxItem>
                <DropdownMenuItem variant="destructive">
                  Delete creature
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
              <TooltipTrigger
                render={<Button color="neutral" variant="outline">Tooltip</Button>}
              />
              <TooltipContent>Helpful hover hint.</TooltipContent>
            </Tooltip>

            <Button color="neutral" variant="outline" onClick={() => toast("A plain toast.")}>
              Toast
            </Button>
            <Button
              color="neutral" variant="outline"
              onClick={() => toast.success("Creature saved.")}
            >
              Toast success
            </Button>
            <Button
              color="neutral" variant="outline"
              onClick={() => toast.error("Something went wrong.")}
            >
              Toast error
            </Button>
            <Button
              color="neutral" variant="outline"
              onClick={() => toast.warning("This creature has no actions.")}
            >
              Toast warning
            </Button>
            <Button
              color="neutral" variant="outline"
              onClick={() => toast.info("Import finished with 2 skips.")}
            >
              Toast info
            </Button>
          </Demo>
        </Section>

        <Section id="command" title="Command">
          <Demo label="Command palette (inline)" className="max-w-md border border-dashed p-4">
            <Command className="border">
              <CommandInput placeholder="Search actions…" />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Creatures">
                  <CommandItem>Ancient Red Dragon</CommandItem>
                  <CommandItem>Gelatinous Cube</CommandItem>
                  <CommandItem>Lich</CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Actions">
                  <CommandItem>New creature</CommandItem>
                  <CommandItem>Import from 5e.tools</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Demo>
        </Section>

        <Section id="misc" title="Misc">
          <Demo label="Separator" className="max-w-md border border-dashed p-4">
            <div className="flex flex-col gap-3">
              <p>Above the line</p>
              <Separator />
              <div className="flex h-5 items-center gap-3">
                <span>Left</span>
                <Separator orientation="vertical" />
                <span>Right</span>
              </div>
            </div>
          </Demo>
          <Demo label="Scroll area" className="max-w-md border border-dashed p-4">
            <ScrollArea className="h-32 w-full border p-3">
              {Array.from({ length: 20 }, (_, i) => (
                <p key={i} className="py-1 text-muted-foreground">
                  Scrollable row {i + 1}
                </p>
              ))}
            </ScrollArea>
          </Demo>
          <Demo label="Loading spinner">
            <LoadingSpinner />
            <LoadingSpinner className="size-8 text-primary" />
          </Demo>
          <Demo label="Stand-alone description" className="max-w-md border border-dashed p-4">
            <StandAloneDescription
              title="Fire Breath (Recharge 5–6)"
              description="The dragon exhales fire in a 90-foot cone. *Dexterity Saving Throw:* DC 24."
            />
          </Demo>
        </Section>
      </div>
    </div>
  );
}
