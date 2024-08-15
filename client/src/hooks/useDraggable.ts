import { MutableRefObject, useCallback, useEffect, useState } from "react";

export interface DragState {
  currentX: number;
  currentY: number;
  initialX: number;
  initialY: number;
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
  pressed: boolean;
}

const initialState: DragState = {
  currentX: 0,
  currentY: 0,
  initialX: 0,
  initialY: 0,
  xOffset: 0,
  yOffset: 0,
  width: 0,
  height: 0,
  pressed: false,
};

export function useDraggable<T extends HTMLElement | null>(ref: MutableRefObject<T>) {
  const [state, setState] = useState<DragState>(initialState);

  const onMouseDown = useCallback(
    (e: PointerEvent) => {
      // Only listen to primary (left) clicks
      if (e.button !== 0) {
        return;
      }

      e.preventDefault();
      const { clientX, clientY } = e;

      const initialX = clientX - state.xOffset;
      const initialY = clientY - state.yOffset;
      ref.current.classList.add("active");

      setState((prev) => ({ ...prev, initialX, initialY, pressed: true }));
    },
    [ref, state.xOffset, state.yOffset]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!state.pressed) return;
      e.preventDefault();
      const { clientX, clientY } = e;

      const currentX = clientX - state.initialX;
      const currentY = clientY - state.initialY;

      const xOffset = currentX;
      const yOffset = currentY;

      setState((prev) => ({
        ...prev,
        currentX,
        currentY,
        xOffset,
        yOffset,
      }));
    },
    [state.initialX, state.initialY, state.pressed]
  );

  const onMouseUp = useCallback(() => {
    const initialX = state.currentX;
    const initialY = state.currentY;

    setState((prev) => ({ ...prev, initialX, initialY, pressed: false }));

    ref.current.classList.remove("active");
  }, [ref, state.currentX, state.currentY]);

  useEffect(() => {
    const current = ref.current;
    if (!current) {
      return;
    }

    const { width, height } = current.getBoundingClientRect();
    setState((prev) => ({ ...prev, width, height }));

    current.addEventListener("mousedown", onMouseDown);
    current.addEventListener("mousemove", onMouseMove);
    current.addEventListener("mouseup", onMouseUp);

    return () => {
      current.removeEventListener("mousedown", onMouseDown);
      current.removeEventListener("mousemove", onMouseMove);
      current.removeEventListener("mouseup", onMouseUp);
    };
  }, [ref, onMouseDown, onMouseMove, onMouseUp]);

  return { x: state.currentX, y: state.currentY };
}
