import type { RefObject } from "react";

type SpecialCharKeysProps = {
  chars: string[];
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

/** Bulles de caractères fon, insérées à la position du curseur. */
export function SpecialCharKeys({
  chars,
  inputRef,
  value,
  onChange,
  disabled,
}: SpecialCharKeysProps) {
  if (chars.length === 0) return null;

  function insert(char: string) {
    const input = inputRef.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + char + value.slice(end);
    onChange(next);
    const caret = start + char.length;
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {chars.map((char) => (
        <button
          key={char}
          type="button"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => insert(char)}
          className="min-w-11 rounded-lg border border-primary/40 bg-secondary px-3 py-2 text-lg leading-none text-secondary-foreground transition-colors hover:border-primary hover:bg-accent disabled:opacity-40"
          aria-label={`Insérer ${char}`}
        >
          {char}
        </button>
      ))}
    </div>
  );
}
