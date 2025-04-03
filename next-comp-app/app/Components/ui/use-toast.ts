// app/Components/ui/use-toast.ts
// Inspired by react-hot-toast library
import * as React from "react"
// Assuming ToastProps is based on the props of your Toast component,
// which likely wraps Radix UI Toast Root. Radix Root takes open and onOpenChange.
import type { ToastProps } from "@/app/Components/ui/toast"; // Adjust path if needed

// Updated ToasterToast type to include open and onOpenChange
type ToasterToast = Required<Pick<ToastProps, "id" | "title">> &
  Omit<ToastProps, "id" | "title"> & {
    description?: React.ReactNode;
    action?: React.ReactElement<{ onClick: (event: React.MouseEvent<HTMLButtonElement>) => void }>;
    // Add properties from Radix UI Toast Root used internally
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }


const TOAST_LIMIT = 1 // Max number of toasts shown at once
const TOAST_REMOVE_DELAY = 1000000 // Long delay, toasts removed manually or by duration

// type StringOrReactNode = string | React.ReactNode; // Already handled by ToastProps import presumably

// Removed redundant ToastProps definition, assuming it's imported correctly

type ToastActionType =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> }
  | { type: "DISMISS_TOAST"; toastId?: ToasterToast["id"] }
  | { type: "REMOVE_TOAST"; toastId?: ToasterToast["id"] }

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type MemoryState = {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: MemoryState, action: ToastActionType): MemoryState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        // Add new toast and slice to limit
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Side effect in reducer: schedule removal
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        // Set open state to false for dismissal
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false, // Mark as not open
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        // Remove all toasts
        return {
          ...state,
          toasts: [],
        }
      }
      // Remove specific toast
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

type Listener = (state: MemoryState) => void

const listeners: Listener[] = []
let memoryState: MemoryState = { toasts: [] }

function dispatch(action: ToastActionType) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Define the input props for the toast function, excluding internal state like 'open'
type ToastInputProps = Omit<ToasterToast, "id" | "open" | "onOpenChange">;

function toast(props: ToastInputProps) {
  const id = genId()

  // Define update and dismiss functions specific to this toast instance
  const update = (props: Partial<ToasterToast>) => // Allow partial updates
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id }, // Ensure ID is included in update
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  // Dispatch ADD_TOAST with the full ToasterToast structure, including internal state handlers
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props, // Spread the input props (title, description, variant, etc.)
      id,
      open: true, // Set initial open state
      // Define onOpenChange handler, explicitly typing 'open'
      onOpenChange: (open: boolean) => {
        if (!open) dismiss() // Call dismiss when Radix signals the toast should close
      },
    },
  })

  // Return controls for the created toast
  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<MemoryState>(memoryState)

  React.useEffect(() => {
    // Subscribe to state changes
    listeners.push(setState)
    // Unsubscribe on cleanup
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state]) // Re-subscribe if state instance changes (shouldn't normally happen)

  return {
    ...state, // Return current toasts array
    toast, // Return the function to add a toast
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }), // Return dismiss function
  }
}

export { useToast, toast }
export type { ToastProps }; // Re-export ToastProps if needed elsewhere

