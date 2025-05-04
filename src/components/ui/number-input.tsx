import { ChevronDown, ChevronUp } from "lucide-react";
import {
  ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Button } from "./button";
import { Input } from "./input";

export interface NumberInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "value" | "defaultValue" | "onChange"
  > {
  suffix?: string;
  prefix?: string;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
  value?: number;
  defaultValue?: number;
  onChange: (...event: any[]) => void;
}

export const NumberInput = ({
  placeholder,
  fixedDecimalScale = false,
  decimalScale = 0,
  suffix,
  prefix,
  defaultValue,
  value,
  onChange,
  ...props
}: NumberInputProps) => {
  const handleIncrement = () => {
    onChange(Number(value) + 1);
  };

  const handleDecrement = () => {
    if (value === 0) return;
    onChange(Number(value) - 1);
  };

  return (
    <div className="flex items-center">
      <Input
        type="number"
        min={0}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          if (Math.sign(Number(e.currentTarget.value)) === -1) return;
          onChange(e);
        }}
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative"
        {...props}
      />

      <div className="flex  h-9 flex-col">
        <button
          type="button"
          aria-label="Increase value"
          className="h-1/2 px-1 border transition-[color,box-shadow]  border-carrara-100 rounded-tr-md border-l-0 border-b-[0.5px] outline-none focus-visible:border-stromboli-400 focus-visible:ring-stromboli-400/50 focus-visible:ring-[3px]"
          onClick={handleIncrement}
        >
          <ChevronUp className="size-3" />
        </button>
        <button
          type="button"
          aria-label="Decrease value"
          className="h-1/2 px-1 border transition-[color,box-shadow]  border-carrara-100 rounded-br-md border-l-0 border-t-[0.5px] outline-none focus-visible:border-stromboli-400 focus-visible:ring-stromboli-400/50 focus-visible:ring-[3px]"
          onClick={handleDecrement}
          disabled={value === 0}
        >
          <ChevronDown className="size-3" />
        </button>
      </div>
    </div>
  );
};
