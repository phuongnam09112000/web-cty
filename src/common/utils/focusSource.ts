// Marks text inputs / textareas that received focus from a mouse or touch
// press with data-istt-pointer-focus, for as long as they keep focus.
//
// Browsers apply :focus-visible to text fields even when they are clicked,
// so CSS alone cannot tell keyboard focus from mouse focus there. The global
// styles hide the keyboard focus ring only on fields carrying this attribute;
// those fields still show their own focus border. Every other control relies
// on :focus-visible alone.
//
// The decision is made per focus event, not stored globally:
// - a mouse / touch press sets a "pointer" flag; any key press clears it;
// - a field focused while the flag is set is marked (clicked into);
// - a field focused with the flag clear (Tab, Enter on a control that moves
//   focus, assistive-technology commands that send key events, focus moved
//   by script before any interaction) is not marked and keeps the ring;
// - the mark is removed when the field loses focus, so it cannot go stale,
//   and typing inside a clicked field does not bring the ring back.

const ATTRIBUTE = "data-istt-pointer-focus";
const TEXT_FIELD =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="image"]):not([type="file"]):not([type="range"]):not([type="color"]), textarea';

let initialised = false;

export const initFocusSourceTracking = () => {
  if (initialised || typeof document === "undefined") return;
  initialised = true;

  let pointerActive = false;
  const onPointer = () => { pointerActive = true; };

  document.addEventListener("mousedown", onPointer, true);
  document.addEventListener("touchstart", onPointer, { capture: true, passive: true });
  document.addEventListener("keydown", () => { pointerActive = false; }, true);

  document.addEventListener("focusin", (e) => {
    const el = e.target;
    if (!(el instanceof HTMLElement) || !el.matches(TEXT_FIELD)) return;
    if (pointerActive) el.setAttribute(ATTRIBUTE, "");
    else el.removeAttribute(ATTRIBUTE);
  }, true);

  document.addEventListener("focusout", (e) => {
    const el = e.target;
    if (el instanceof HTMLElement) el.removeAttribute(ATTRIBUTE);
  }, true);
};
