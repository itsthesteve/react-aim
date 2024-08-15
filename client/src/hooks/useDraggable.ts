import { MutableRefObject, useCallback, useEffect, useState } from "react";

export interface DragState {
  elementX: number;
  elementY: number;
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
  elementX: 0,
  elementY: 0,
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

  useEffect(() => {
    if (!ref?.current) return;
    const { offsetLeft, offsetTop } = ref.current;
    setState((prev) => ({ ...prev, elementX: offsetLeft, elementY: offsetTop }));
  }, [ref]);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      // Only listen to primary (left) clicks and when a .title-bar is clicked
      if (e.button !== 0 || !(e.target as HTMLElement).classList.contains("title-bar")) {
        return;
      }

      const { clientX, clientY } = e;

      const initialX = clientX - state.xOffset;
      const initialY = clientY - state.yOffset;

      setState((prev) => ({ ...prev, initialX, initialY, pressed: true }));
    },
    [state.xOffset, state.yOffset]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!state.pressed) return;
      const { clientX, clientY } = e;

      let currentX = clientX - state.initialX;
      let currentY = clientY - state.initialY;
      let xOffset = currentX;
      let yOffset = currentY;

      // At left edge
      if (xOffset < -state.elementX) {
        xOffset = currentX = -state.elementX;
      }

      // At right edge
      if (xOffset > state.elementX) {
        xOffset = currentX = state.elementX;
      }

      // At top edge
      if (yOffset < -state.elementY) {
        yOffset = currentY = -state.elementY;
      }

      // At bottom edge
      if (yOffset > state.elementY) {
        yOffset = currentY = state.elementY;
      }

      setState((prev) => ({
        ...prev,
        elementX: ref.current!.offsetLeft,
        elementY: ref.current!.offsetTop,
        currentX,
        currentY,
        xOffset,
        yOffset,
      }));
    },
    [ref, state.initialX, state.initialY, state.pressed, state.elementX, state.elementY]
  );

  const onMouseUp = useCallback(() => {
    const initialX = state.currentX;
    const initialY = state.currentY;

    setState((prev) => ({ ...prev, initialX, initialY, pressed: false }));
  }, [state.currentX, state.currentY]);

  useEffect(() => {
    const current = ref.current;
    if (!current) {
      return;
    }

    const { width, height } = current.getBoundingClientRect();
    setState((prev) => ({ ...prev, width, height }));

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [ref, onMouseDown, onMouseMove, onMouseUp]);

  return { x: state.currentX, y: state.currentY };
}
