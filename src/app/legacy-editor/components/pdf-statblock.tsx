import type { RefObject } from "react";

export function PdfStatblock({
  contentRef,
}: {
  contentRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div>
      <div ref={contentRef}>Content to print</div>
    </div>
  );
}
