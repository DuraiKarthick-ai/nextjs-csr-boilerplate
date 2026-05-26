import { createContext, useContext } from "react";

export interface WindowControlsContextValue {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

const WindowControlsContext = createContext<WindowControlsContextValue>({});

export const WindowControlsProvider = WindowControlsContext.Provider;

export function useWindowControls(): WindowControlsContextValue {
  return useContext(WindowControlsContext);
}
