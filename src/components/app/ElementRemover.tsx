import { useState, useEffect, useCallback, useRef } from 'react';
import { Scissors, Trash2, Undo2, X, MousePointer2, RotateCcw } from 'lucide-react';

interface RemovedEntry {
  element: HTMLElement;
  parent: HTMLElement;
  nextSibling: Node | null;
  originalDisplay: string;
  label: string;
}

/**
 * ElementRemover: A DOM-level tool that lets users visually select and remove
 * elements from the live invoice preview. Works by injecting CSS outlines directly
 * onto the template elements — avoids all overlay/positioning/scale complexity.
 */
export function ElementRemover() {
  const [active, setActive] = useState(false);
  const [selectedEls, setSelectedEls] = useState<Set<HTMLElement>>(new Set());
  const [undoStack, setUndoStack] = useState<RemovedEntry[]>([]);
  const [hoveredEl, setHoveredEl] = useState<HTMLElement | null>(null);
  const handlerMapRef = useRef<Map<HTMLElement, {
    click: (e: Event) => void;
    mouseenter: (e: Event) => void;
    mouseleave: (e: Event) => void;
  }>>(new Map());

  // Style constants
  const OUTLINE_IDLE = '2px dashed rgba(147, 197, 253, 0.7)';
  const OUTLINE_HOVER = '2px solid #60a5fa';
  const OUTLINE_SELECTED = '2px solid #ef4444';
  const BG_SELECTED = 'rgba(239, 68, 68, 0.06)';

  // Collect meaningful elements from the preview
  const getSelectableElements = useCallback((): HTMLElement[] => {
    const target = document.getElementById('invoice-preview-target');
    if (!target) return [];
    const templateRoot = target.firstElementChild as HTMLElement;
    if (!templateRoot) return [];

    const els: HTMLElement[] = [];

    function walk(node: HTMLElement, depth: number) {
      if (depth > 3) return;
      const children = Array.from(node.children) as HTMLElement[];
      for (const child of children) {
        if (['SCRIPT', 'STYLE', 'BR', 'LINK', 'META'].includes(child.tagName)) continue;
        const style = window.getComputedStyle(child);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const rect = child.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 4) continue;

        // Prefer leaf-ish blocks (those with fewer children or actual content)
        const hasDirectText = Array.from(child.childNodes).some(
          n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()
        );
        const childElCount = child.children.length;

        // For leaf elements or small containers, add directly
        if (hasDirectText || childElCount <= 2 || ['IMG', 'TABLE', 'HR', 'SVG'].includes(child.tagName)) {
          els.push(child);
        }

        // Always recurse for containers to find nested selectable elements
        if (childElCount > 0) {
          walk(child, depth + 1);
        }
      }
    }

    walk(templateRoot, 0);

    // Deduplicate — keep the deepest unique elements
    const unique: HTMLElement[] = [];
    for (const el of els) {
      // Skip if a more specific child of this element is already in the list
      const hasChildInList = els.some(other => other !== el && el.contains(other));
      if (!hasChildInList) {
        unique.push(el);
      }
    }
    return unique;
  }, []);

  // Apply visual outlines to all selectable elements
  const applySelectionMode = useCallback(() => {
    // Clean up old handlers first
    cleanupHandlers();

    const elements = getSelectableElements();
    const map = new Map<HTMLElement, {
      click: (e: Event) => void;
      mouseenter: (e: Event) => void;
      mouseleave: (e: Event) => void;
    }>();

    for (const el of elements) {
      // Save original styles
      const origOutline = el.style.outline;
      const origOutlineOffset = el.style.outlineOffset;
      const origCursor = el.style.cursor;
      const origBg = el.style.backgroundColor;
      const origTransition = el.style.transition;
      const origPosition = el.style.position;

      // Apply idle outline
      el.style.outline = OUTLINE_IDLE;
      el.style.outlineOffset = '-1px';
      el.style.cursor = 'pointer';
      el.style.transition = 'outline 0.15s ease, background-color 0.15s ease';
      if (el.style.position === '' || el.style.position === 'static') {
        el.style.position = 'relative';
      }

      const clickHandler = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        setSelectedEls(prev => {
          const next = new Set(prev);
          if (next.has(el)) {
            next.delete(el);
            el.style.outline = OUTLINE_IDLE;
            el.style.backgroundColor = origBg;
          } else {
            next.add(el);
            el.style.outline = OUTLINE_SELECTED;
            el.style.backgroundColor = BG_SELECTED;
          }
          return next;
        });
      };

      const mouseenterHandler = () => {
        setHoveredEl(el);
        setSelectedEls(current => {
          if (!current.has(el)) {
            el.style.outline = OUTLINE_HOVER;
          }
          return current;
        });
      };

      const mouseleaveHandler = () => {
        setHoveredEl(prev => prev === el ? null : prev);
        setSelectedEls(current => {
          if (!current.has(el)) {
            el.style.outline = OUTLINE_IDLE;
          }
          return current;
        });
      };

      el.addEventListener('click', clickHandler, true);
      el.addEventListener('mouseenter', mouseenterHandler);
      el.addEventListener('mouseleave', mouseleaveHandler);

      map.set(el, {
        click: clickHandler,
        mouseenter: mouseenterHandler,
        mouseleave: mouseleaveHandler,
      });

      // Store originals on the element for cleanup
      (el as any).__erOriginal = { origOutline, origOutlineOffset, origCursor, origBg, origTransition, origPosition };
    }

    handlerMapRef.current = map;
  }, [getSelectableElements]);

  // Clean up all event handlers and styles
  const cleanupHandlers = useCallback(() => {
    for (const [el, handlers] of handlerMapRef.current.entries()) {
      el.removeEventListener('click', handlers.click, true);
      el.removeEventListener('mouseenter', handlers.mouseenter);
      el.removeEventListener('mouseleave', handlers.mouseleave);

      const orig = (el as any).__erOriginal;
      if (orig) {
        el.style.outline = orig.origOutline;
        el.style.outlineOffset = orig.origOutlineOffset;
        el.style.cursor = orig.origCursor;
        el.style.backgroundColor = orig.origBg;
        el.style.transition = orig.origTransition;
        el.style.position = orig.origPosition;
        delete (el as any).__erOriginal;
      }
    }
    handlerMapRef.current.clear();
  }, []);

  // Activate / deactivate
  useEffect(() => {
    if (active) {
      applySelectionMode();
    } else {
      cleanupHandlers();
      setSelectedEls(new Set());
      setHoveredEl(null);
    }
    return () => {
      cleanupHandlers();
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const getElementLabel = (el: HTMLElement): string => {
    const tag = el.tagName.toLowerCase();
    const text = el.textContent?.trim().slice(0, 40) || '';
    if (tag === 'img') return 'Image / Logo';
    if (tag === 'table') return 'Table';
    if (tag === 'h1' || tag === 'h2' || tag === 'h3') return `Heading: ${text}`;
    if (tag === 'p') return text.length > 35 ? text.slice(0, 35) + '…' : text || 'Paragraph';
    if (tag === 'tr') return `Row: ${text.slice(0, 30)}`;
    if (tag === 'thead') return 'Table Header';
    if (tag === 'tbody') return 'Table Body';
    return text.length > 35 ? text.slice(0, 35) + '…' : text || 'Section';
  };

  const handleRemove = () => {
    const toRemove = Array.from(selectedEls);
    const newUndoEntries: RemovedEntry[] = [];

    for (const el of toRemove) {
      if (el.parentElement) {
        // Remove event handlers from this element before removal
        const handlers = handlerMapRef.current.get(el);
        if (handlers) {
          el.removeEventListener('click', handlers.click, true);
          el.removeEventListener('mouseenter', handlers.mouseenter);
          el.removeEventListener('mouseleave', handlers.mouseleave);
          handlerMapRef.current.delete(el);
        }

        // Restore original styles before storing for undo
        const orig = (el as any).__erOriginal;
        if (orig) {
          el.style.outline = orig.origOutline;
          el.style.outlineOffset = orig.origOutlineOffset;
          el.style.cursor = orig.origCursor;
          el.style.backgroundColor = orig.origBg;
          el.style.transition = orig.origTransition;
          el.style.position = orig.origPosition;
          delete (el as any).__erOriginal;
        }

        newUndoEntries.push({
          element: el,
          parent: el.parentElement,
          nextSibling: el.nextSibling,
          originalDisplay: el.style.display,
          label: getElementLabel(el),
        });

        el.parentElement.removeChild(el);
      }
    }

    setUndoStack(prev => [...prev, ...newUndoEntries]);
    setSelectedEls(new Set());
    setHoveredEl(null);

    // Re-apply selection mode to remaining elements
    setTimeout(() => {
      if (active) applySelectionMode();
    }, 50);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    try {
      if (last.nextSibling && last.parent.contains(last.nextSibling)) {
        last.parent.insertBefore(last.element, last.nextSibling);
      } else {
        last.parent.appendChild(last.element);
      }
    } catch {
      try { last.parent.appendChild(last.element); } catch {}
    }

    setUndoStack(prev => prev.slice(0, -1));

    // Re-apply selection mode
    setTimeout(() => {
      if (active) applySelectionMode();
    }, 50);
  };

  const handleUndoAll = () => {
    // Undo all entries in reverse
    const entries = [...undoStack].reverse();
    for (const entry of entries) {
      try {
        if (entry.nextSibling && entry.parent.contains(entry.nextSibling)) {
          entry.parent.insertBefore(entry.element, entry.nextSibling);
        } else {
          entry.parent.appendChild(entry.element);
        }
      } catch {
        try { entry.parent.appendChild(entry.element); } catch {}
      }
    }
    setUndoStack([]);

    setTimeout(() => {
      if (active) applySelectionMode();
    }, 50);
  };

  const handleClose = () => {
    setActive(false);
  };

  // --- Render ---

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all
          bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 hover:border-red-300
          hover:shadow-sm active:scale-[0.97]"
        title="Remove elements from the invoice preview"
      >
        <Scissors size={13} />
        Remove Elements
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status indicator */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-lg">
        <MousePointer2 size={12} className="text-red-400 animate-pulse" />
        <span className="text-[11px] text-red-600 font-medium">
          {selectedEls.size > 0 ? `${selectedEls.size} selected` : 'Click to select'}
        </span>
      </div>

      {/* Remove button */}
      {selectedEls.size > 0 && (
        <button
          onClick={handleRemove}
          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-semibold transition-all
            bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow active:scale-[0.97]"
        >
          <Trash2 size={12} />
          Remove ({selectedEls.size})
        </button>
      )}

      {/* Undo last */}
      {undoStack.length > 0 && (
        <button
          onClick={handleUndo}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all
            bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60 hover:border-amber-300
            hover:shadow-sm active:scale-[0.97]"
          title={`Undo: restore "${undoStack[undoStack.length - 1]?.label}"`}
        >
          <Undo2 size={12} />
          Undo
        </button>
      )}

      {/* Undo all */}
      {undoStack.length > 1 && (
        <button
          onClick={handleUndoAll}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all
            bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60 hover:border-amber-300
            hover:shadow-sm active:scale-[0.97]"
          title="Undo all removals"
        >
          <RotateCcw size={12} />
          Undo All
        </button>
      )}

      {/* Done / Close */}
      <button
        onClick={handleClose}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg font-medium transition-all
          text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:scale-[0.97]"
        title="Exit remove mode"
      >
        <X size={13} />
        Done
      </button>

      {/* Hovered element tooltip */}
      {hoveredEl && !selectedEls.has(hoveredEl) && (
        <span className="text-[10px] text-blue-500 font-medium ml-1 truncate max-w-[160px]">
          {getElementLabel(hoveredEl)}
        </span>
      )}
    </div>
  );
}
