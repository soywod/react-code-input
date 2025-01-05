import {
  FC,
  InputHTMLAttributes,
  useEffect,
  useReducer,
  useRef,
  KeyboardEventHandler,
  KeyboardEvent,
  ChangeEventHandler,
  useCallback,
  CompositionEventHandler,
  forwardRef,
  useImperativeHandle,
  RefObject,
  ActionDispatch,
  useMemo,
} from "react";

import { noop, range } from "../utils";

const BACKSPACE = 8;
const DELETE = 46;

export type InnerProps = {
  length: number;
  format: (char: string) => string;
  formatAriaLabel: (index: number, total: number) => string;
  onChange: (value: string) => void;
  onComplete: (value: string) => void;
};

export const defaultProps: InnerProps = {
  length: 5,
  format: char => char,
  formatAriaLabel: (index: number, total: number) => `PIN field ${index} of ${total}`,
  onChange: noop,
  onComplete: noop,
};

export type NativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "onKeyDown" | "onCompositionStart" | "onCompositionEnd"
>;

export const defaultNativeProps: NativeProps = {
  type: "text",
  inputMode: "text",
  autoCapitalize: "off",
  autoCorrect: "off",
  autoComplete: "off",
};

export type Props = NativeProps &
  Partial<InnerProps> & {
    handler?: Handler;
  };

export type StateProps = Pick<NativeProps, "dir"> & Pick<InnerProps, "length" | "format">;

export type State = StateProps & {
  cursor: number;
  values: string[];
  backspace: boolean;
  composition: boolean;
  ready: boolean;
  dirty: boolean;
};

export const defaultState: State = {
  length: defaultProps.length,
  format: defaultProps.format,
  dir: "ltr",
  cursor: 0,
  values: Array(defaultProps.length),
  backspace: false,
  composition: false,
  ready: false,
  dirty: false,
};

export type Action =
  | { type: "update-props"; props: Partial<StateProps> }
  | { type: "handle-change"; index: number; value: string | null; reset?: boolean }
  | { type: "handle-key-down"; index: number; event: KeyboardEvent<HTMLInputElement> }
  | { type: "start-composition"; index: number }
  | { type: "end-composition"; index: number; value: string };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "update-props": {
      state = { ...state, ...action.props, ready: true };
      // cannot use Array.splice as it does not keep empty array length
      state.values = state.values.slice(state.cursor, state.length);
      state.cursor = Math.min(state.cursor, state.length - 1);

      return state;
    }

    case "start-composition": {
      return { ...state, dirty: true, composition: true };
    }

    case "end-composition": {
      if (action.value) {
        state.values[action.index] = action.value;
      } else {
        delete state.values[action.index];
      }

      const dir = state.values[action.index] ? 1 : 0;
      state.cursor = Math.min(action.index + dir, state.length - 1);

      return { ...state, dirty: true, composition: false };
    }

    case "handle-change": {
      if (state.composition) {
        break;
      }

      if (action.reset) {
        state.values = Array(state.length);
      }

      if (action.value) {
        const values = action.value.split("").map(state.format);
        const length = Math.min(state.length - action.index, values.length);
        state.values.splice(action.index, length, ...values.slice(0, length));
        state.cursor = Math.min(action.index + length, state.length - 1);
      } else {
        delete state.values[action.index];
        const dir = state.backspace ? 0 : 1;
        state.cursor = Math.max(0, action.index - dir);
      }

      return { ...state, dirty: true, backspace: false };
    }

    case "handle-key-down": {
      // determine if a deletion key is pressed
      const fromKey = action.event.key === "Backspace" || action.event.key === "Delete";
      const fromCode = action.event.code === "Backspace" || action.event.code === "Delete";
      const fromKeyCode = action.event.keyCode === BACKSPACE || action.event.keyCode === DELETE;
      const fromWhich = action.event.which === BACKSPACE || action.event.which === DELETE;
      const deletion = fromKey || fromCode || fromKeyCode || fromWhich;

      // return the same state reference if no deletion detected
      if (!deletion) {
        break;
      }

      // Deletion is a bit tricky and requires special attention.
      //
      // When the field under cusor has a value and a deletion key is
      // pressed, we want to let the browser to do the deletion for
      // us, like a regular deletion in a normal input via the
      // `onchange` event. For this to happen, we need to return the
      // same state reference in order not to trigger any change. The
      // state will be automatically updated by the handle-change
      // action, when the deleted value will trigger the `onchange`
      // event.
      if (state.values[action.index]) {
        break;
      }

      // But when the field under cursor is empty, deletion cannot
      // happen by itself. The trick is to manually move the cursor
      // backwards: the browser will then delete the value under this
      // new cursor and perform the changes via the triggered
      // `onchange` event.
      else {
        state.cursor = Math.max(0, action.index - 1);

        // let know the handle-change action that we already moved
        // backwards and that we don't need to touch the cursor
        // anymore
        state.backspace = true;

        return { ...state, dirty: true };
      }
    }
  }

  return state;
}

export type Handler = {
  refs: RefObject<HTMLInputElement[]>;
  state: State;
  dispatch: ActionDispatch<[Action]>;
  value: string;
  setValue: (value: string) => void;
};

export function usePinField(): Handler {
  const refs = useRef<HTMLInputElement[]>([]);
  const [state, dispatch] = useReducer(reducer, defaultState);

  const value = useMemo(() => {
    let value = "";
    for (let index = 0; index < state.values.length; index++) {
      value += index in state.values ? state.values[index] : "";
    }
    return value;
  }, [state]);

  const setValue = useCallback(
    (value: string) => {
      dispatch({ type: "handle-change", index: 0, value, reset: true });
    },
    [dispatch, state.cursor],
  );

  return useMemo(() => ({ refs, state, dispatch, value, setValue }), [refs, state, dispatch, value, setValue]);
}

export const PinFieldV2: FC<Props> = forwardRef(
  (
    {
      length = defaultProps.length,
      format = defaultProps.format,
      formatAriaLabel = defaultProps.formatAriaLabel,
      onChange: handleChange = defaultProps.onChange,
      onComplete: handleComplete = defaultProps.onComplete,
      handler: customHandler,
      autoFocus,
      ...nativeProps
    },
    fwdRef,
  ) => {
    const internalHandler = usePinField();
    const { refs, state, dispatch } = customHandler || internalHandler;

    useImperativeHandle(fwdRef, () => refs.current, [refs]);

    function setRefAt(index: number): (ref: HTMLInputElement) => void {
      return ref => {
        if (ref) {
          refs.current[index] = ref;
        }
      };
    }

    function handleKeyDownAt(index: number): KeyboardEventHandler<HTMLInputElement> {
      return event => {
        dispatch({ type: "handle-key-down", index, event });
      };
    }

    function handleChangeAt(index: number): ChangeEventHandler<HTMLInputElement> {
      return event => {
        // should never happen, mostly for typescript to infer properly
        if (!(event.nativeEvent instanceof InputEvent)) return;
        dispatch({ type: "handle-change", index, value: event.nativeEvent.data });
      };
    }

    function startCompositionAt(index: number): CompositionEventHandler<HTMLInputElement> {
      return () => {
        dispatch({ type: "start-composition", index });
      };
    }

    function endCompositionAt(index: number): CompositionEventHandler<HTMLInputElement> {
      return event => {
        dispatch({ type: "end-composition", index, value: event.data });
      };
    }

    // initial props to state update
    useEffect(() => {
      if (state.ready) return;
      const dir = nativeProps.dir?.toLowerCase() || document.documentElement.getAttribute("dir")?.toLowerCase();
      dispatch({ type: "update-props", props: { length, format, dir } });
    }, [state.ready, dispatch, length, format]);

    // props.length to state update
    useEffect(() => {
      if (!state.ready) return;
      if (length === state.length) return;
      dispatch({ type: "update-props", props: { length } });
    }, [state.ready, length, state.length, dispatch]);

    // props.format to state update
    useEffect(() => {
      if (!state.ready) return;
      if (format === state.format) return;
      dispatch({ type: "update-props", props: { format } });
    }, [state.ready, format, state.format, dispatch]);

    // nativeProps.dir to state update
    useEffect(() => {
      if (!state.ready) return;
      const dir = nativeProps.dir?.toLowerCase() || document.documentElement.getAttribute("dir")?.toLowerCase();
      if (dir === state.dir) return;
      dispatch({ type: "update-props", props: { dir } });
    }, [state.ready, nativeProps.dir, state.dir, dispatch]);

    // state to view update
    useEffect(() => {
      if (!refs.current) return;
      if (!state.ready) return;
      if (!state.dirty) return;

      let innerFocus = false;
      let completed = state.values.length == state.length;
      let value = "";

      for (let index = 0; index < state.values.length; index++) {
        const char = index in state.values ? state.values[index] : "";
        refs.current[index].value = char;
        innerFocus = innerFocus || hasFocus(refs.current[index]);
        completed = completed && index in state.values && refs.current[index].checkValidity();
        value += char;
      }

      if (innerFocus) {
        refs.current[state.cursor].focus();
      }

      if (handleChange) {
        handleChange(value);
      }

      if (handleComplete && completed) {
        handleComplete(value);
      }
    }, [refs, state, handleChange, handleComplete]);

    // wait for props to be accessible in the state
    if (!state.ready) {
      return null;
    }

    const inputs = range(0, state.length).map(index => (
      <input
        {...defaultNativeProps}
        {...nativeProps}
        key={index}
        ref={setRefAt(index)}
        autoFocus={index === 0 && autoFocus}
        onKeyDown={handleKeyDownAt(index)}
        onChange={handleChangeAt(index)}
        onCompositionStart={startCompositionAt(index)}
        onCompositionEnd={endCompositionAt(index)}
        aria-label={formatAriaLabel(index + 1, state.length)}
        aria-required={nativeProps.required ? "true" : undefined}
        aria-disabled={nativeProps.disabled ? "true" : undefined}
        aria-readonly={nativeProps.readOnly ? "true" : undefined}
      />
    ));

    if (state.dir === "rtl") {
      inputs.reverse();
    }

    return inputs;
  },
);

export function hasFocus(el: HTMLElement): boolean {
  try {
    const matches = el.webkitMatchesSelector || el.matches;
    return matches.call(el, ":focus");
  } catch (err: any) {
    return false;
  }
}

export default PinFieldV2;
