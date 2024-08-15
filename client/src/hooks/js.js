let dragItem = document.querySelector("#draggableDiv");
let container = document.querySelector("#body");

let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;
let state = false;

const Draggable = (DragArea, DraggableItem) => {
  const events = {
    mouse: {
      dragStart: "mousedown",
      drag: "mousemove",
      dragEnd: "mouseup",
    },
    touch: {
      dragStart: "touchstart",
      drag: "touchmove",
      dragEnd: "touchend",
    },
  };

  const deviceType = () => {
    try {
      document.createEvent("TouchEvent");
      return "touch";
    } catch (error) {
      return "mouse";
    }
  };

  DragArea.addEventListener(
    events[deviceType()].dragStart,
    (e) => {
      e.preventDefault();
      let eventClientX = deviceType() == "touch" ? e.touches[0].clientX : e.clientX;

      let eventClientY = deviceType() == "touch" ? e.touches[0].clientY : e.clientY;

      initialX = eventClientX - xOffset;
      initialY = eventClientY - yOffset;

      e.target == DraggableItem ? (state = true) : (state = false);

      if (state) {
        DraggableItem.classList.add("active");
      }
    },
    { passive: false }
  );

  DragArea.addEventListener(
    events[deviceType()].drag,
    (e) => {
      let eventClientX = deviceType() == "touch" ? e.touches[0].clientX : e.clientX;

      let eventClientY = deviceType() == "touch" ? e.touches[0].clientY : e.clientY;

      if (state) {
        e.preventDefault();

        currentX = eventClientX - initialX;
        currentY = eventClientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, DraggableItem);
      }
    },
    { passive: false }
  );

  DragArea.addEventListener(events[deviceType()].dragEnd, () => {
    initialX = currentX;
    initialY = currentY;
    state = false;
    DraggableItem.classList.remove("active");
  });

  function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }
};

Draggable(container, dragItem);
