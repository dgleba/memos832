export const FOCUS_MODE_STYLES = {
  backdrop: "fixed inset-0 bg-black/20 backdrop-blur-sm z-40",
  container: {
    // This makes the editor 97% wide and 97% high, centered on screen
    base: "fixed inset-0 z-[1000] m-auto w-[97vw] h-[97vh] max-h-[97vh] overflow-y-auto shadow-2xl",
    spacing: "p-6",
  },
  transition: "transition-all duration-100 ease-in-out",
  exitButton: "absolute top-2 right-2 z-10 opacity-60 hover:opacity-100",
} as const;

export const EDITOR_HEIGHT = {
  // Max height for normal mode - focus mode uses flex-1 to grow dynamically
  normal: "max-h-[50vh]",
} as const;
