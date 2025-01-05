import React from "react";

import { noop } from "../utils";
import { BACKSPACE, DELETE, defaultProps, defaultState } from "./pin-field-v2";

jest.mock("react", () => ({
  useCallback: (f: any) => f,
  forwardRef: (f: any) => f,
}));

function mockInput(value: string) {
  const setValMock = jest.fn();
  const ref = {
    focus: jest.fn(),
    setCustomValidity: jest.fn(),
    set value(val: string) {
      setValMock(val);
    },
    get value() {
      return value;
    },
  };

  return { ref, setValMock };
}

test("constants", () => {
  expect(BACKSPACE).toEqual(8);
  expect(DELETE).toEqual(46);
});

test("default props", () => {
  expect(defaultProps).toHaveProperty("length", 5);
  expect(defaultProps).toHaveProperty("format", expect.any(Function));
  expect(defaultProps.format("a")).toStrictEqual("a");
  expect(defaultProps).toHaveProperty("formatAriaLabel", expect.any(Function));
  expect(defaultProps.formatAriaLabel(1, 2)).toStrictEqual("PIN field 1 of 2");
  expect(defaultProps).toHaveProperty("onChange");
  expect(defaultProps.onChange("a")).toStrictEqual(undefined);
  expect(defaultProps).toHaveProperty("onComplete");
  expect(defaultProps.onComplete("a")).toStrictEqual(undefined);
});

test("default state", () => {
  expect(defaultState).toHaveProperty("length", 5);
  expect(defaultState).toHaveProperty("format", expect.any(Function));
  expect(defaultState).toHaveProperty("dir", "ltr");
  expect(defaultState).toHaveProperty("cursor", 0);
  expect(defaultState).toHaveProperty("values", Array(5));
  expect(defaultState).toHaveProperty("backspace", false);
  expect(defaultState).toHaveProperty("composition", false);
  expect(defaultState).toHaveProperty("ready", false);
  expect(defaultState).toHaveProperty("dirty", false);
});

// describe("state reducer", () => {
//   const { NO_EFFECTS, stateReducer, defaultState, defaultProps } = pinField;
//   const currState = defaultState(defaultProps);

//   test("default action", () => {
//     // @ts-expect-error bad action
//     const [state, eff] = stateReducer(currState, { type: "bad-action" });

//     expect(state).toMatchObject(state);
//     expect(eff).toEqual(NO_EFFECTS);
//   });

//   describe("handle-key-down", () => {
//     test("unidentified", () => {
//       const [state, eff] = stateReducer(currState, {
//         type: "handle-key-down",
//         key: "Unidentified",
//         idx: 0,
//         val: "",
//       });

//       expect(state).toMatchObject(state);
//       expect(eff).toEqual([]);
//     });

//     test("dead", () => {
//       const [state, eff] = stateReducer(currState, {
//         type: "handle-key-down",
//         key: "Dead",
//         idx: 0,
//         val: "",
//       });

//       expect(state).toMatchObject(state);
//       expect(eff).toEqual([
//         { type: "set-input-val", idx: 0, val: "" },
//         { type: "reject-key", idx: 0, key: "Dead" },
//         { type: "handle-code-change" },
//       ]);
//     });

//     describe("left arrow", () => {
//       test("from the first input", () => {
//         const [state, eff] = stateReducer(currState, {
//           type: "handle-key-down",
//           key: "ArrowLeft",
//           idx: 0,
//           val: "",
//         });

//         expect(state).toMatchObject({ ...state, focusIdx: 0 });
//         expect(eff).toEqual([{ type: "focus-input", idx: 0 }]);
//       });

//       test("from the last input", () => {
//         const [state, eff] = stateReducer(
//           { ...currState, focusIdx: 4 },
//           { type: "handle-key-down", key: "ArrowLeft", idx: 0, val: "" },
//         );

//         expect(state).toMatchObject({ ...state, focusIdx: 3 });
//         expect(eff).toEqual([{ type: "focus-input", idx: 3 }]);
//       });
//     });

//     describe("right arrow", () => {
//       test("from the first input", () => {
//         const [state, eff] = stateReducer(currState, {
//           type: "handle-key-down",
//           key: "ArrowRight",
//           idx: 0,
//           val: "",
//         });

//         expect(state).toMatchObject({ ...state, focusIdx: 1 });
//         expect(eff).toEqual([{ type: "focus-input", idx: 1 }]);
//       });

//       test("from the last input", () => {
//         const [state, eff] = stateReducer(
//           { ...currState, focusIdx: 4 },
//           { type: "handle-key-down", key: "ArrowRight", idx: 0, val: "" },
//         );

//         expect(state).toMatchObject({ ...state, focusIdx: 4 });
//         expect(eff).toEqual([{ type: "focus-input", idx: 4 }]);
//       });
//     });

//     test("backspace", () => {
//       const [state, eff] = stateReducer(currState, {
//         type: "handle-key-down",
//         key: "Backspace",
//         idx: 0,
//         val: "",
//       });

//       expect(state).toMatchObject({ ...state, focusIdx: 0 });
//       expect(eff).toEqual([{ type: "handle-delete", idx: 0 }, { type: "handle-code-change" }]);
//     });

//     test("delete", () => {
//       const [state, eff] = stateReducer(currState, {
//         type: "handle-key-down",
//         key: "Delete",
//         idx: 0,
//         val: "",
//       });

//       expect(state).toMatchObject({ ...state, focusIdx: 0 });
//       expect(eff).toEqual([{ type: "handle-delete", idx: 0 }, { type: "handle-code-change" }]);
//     });

//     describe("default", () => {
//       test("resolve", () => {
//         const [state, eff] = stateReducer(currState, {
//           type: "handle-key-down",
//           key: "a",
//           idx: 0,
//           val: "",
//         });

//         expect(state).toMatchObject({ ...state, focusIdx: 1 });
//         expect(eff).toEqual([
//           { type: "set-input-val", idx: 0, val: "a" },
//           { type: "resolve-key", idx: 0, key: "a" },
//           { type: "focus-input", idx: 1 },
//           { type: "handle-code-change" },
//         ]);
//       });

//       test("reject", () => {
//         const [state, eff] = stateReducer(currState, {
//           type: "handle-key-down",
//           key: "@",
//           idx: 0,
//           val: "",
//         });

//         expect(state).toMatchObject(state);
//         expect(eff).toEqual([{ type: "reject-key", idx: 0, key: "@" }]);
//       });
//     });
//   });

//   describe("handle-key-up", () => {
//     test("no fallback", () => {
//       const [state, eff] = stateReducer(currState, {
//         type: "handle-key-up",
//         idx: 0,
//         val: "",
//       });

//       expect(state).toMatchObject(state);
//       expect(eff).toEqual([]);
//     });

//     test("empty prevVal, empty val", () => {
//       const [state, eff] = stateReducer(
//         { ...currState, fallback: { idx: 0, val: "" } },
//         { type: "handle-key-up", idx: 0, val: "" },
//       );

//       expect(state).toMatchObject({ fallback: null });
//       expect(eff).toEqual([{ type: "handle-delete", idx: 0 }, { type: "handle-code-change" }]);
//     });

//     test("empty prevVal, not empty allowed val", () => {
//       const [state, eff] = stateReducer(
//         { ...currState, fallback: { idx: 0, val: "" } },
//         { type: "handle-key-up", idx: 0, val: "a" },
//       );

//       expect(state).toMatchObject({ fallback: null });
//       expect(eff).toEqual([
//         { type: "set-input-val", idx: 0, val: "a" },
//         { type: "resolve-key", idx: 0, key: "a" },
//         { type: "focus-input", idx: 1 },
//         { type: "handle-code-change" },
//       ]);
//     });

//     test("empty prevVal, not empty denied val", () => {
//       const [state, eff] = stateReducer(
//         { ...currState, fallback: { idx: 0, val: "" } },
//         { type: "handle-key-up", idx: 0, val: "@" },
//       );

//       expect(state).toMatchObject({ fallback: null });
//       expect(eff).toEqual([
//         { type: "set-input-val", idx: 0, val: "" },
//         { type: "reject-key", idx: 0, key: "@" },
//         { type: "handle-code-change" },
//       ]);
//     });

//     test("not empty prevVal", () => {
//       const [state, eff] = stateReducer(
//         { ...currState, fallback: { idx: 0, val: "a" } },
//         { type: "handle-key-up", idx: 0, val: "a" },
//       );

//       expect(state).toMatchObject({ fallback: null });
//       expect(eff).toEqual([
//         { type: "set-input-val", idx: 0, val: "a" },
//         { type: "resolve-key", idx: 0, key: "a" },
//         { type: "focus-input", idx: 1 },
//         { type: "handle-code-change" },
//       ]);
//     });
//   });

//   describe("handle-paste", () => {
//     test("paste smaller text than code length", () => {
//       const [state, eff] = stateReducer(currState, {
//         type: "handle-paste",
//         idx: 0,
//         val: "abc",
//       });

//       expect(state).toMatchObject({ ...state, focusIdx: 3 });
//       expect(eff).toEqual([
//         { type: "set-input-val", idx: 0, val: "a" },
//         { type: "resolve-key", idx: 0, key: "a" },
//         { type: "set-input-val", idx: 1, val: "b" },
//         { type: "resolve-key", idx: 1, key: "b" },
//         { type: "set-input-val", idx: 2, val: "c" },
//         { type: "resolve-key", idx: 2, key: "c" },
//         { type: "focus-input", idx: 3 },
//         { type: "handle-code-change" },
//       ]);
//     });

//     test("paste bigger text than code length", () => {
//       const [state, eff] = stateReducer(currState, {
//         type: "handle-paste",
//         idx: 0,
//         val: "abcdefgh",
//       });

//       expect(state).toMatchObject({ ...state, focusIdx: 4 });
//       expect(eff).toEqual([
//         { type: "set-input-val", idx: 0, val: "a" },
//         { type: "resolve-key", idx: 0, key: "a" },
//         { type: "set-input-val", idx: 1, val: "b" },
//         { type: "resolve-key", idx: 1, key: "b" },
//         { type: "set-input-val", idx: 2, val: "c" },
//         { type: "resolve-key", idx: 2, key: "c" },
//         { type: "set-input-val", idx: 3, val: "d" },
//         { type: "resolve-key", idx: 3, key: "d" },
//         { type: "set-input-val", idx: 4, val: "e" },
//         { type: "resolve-key", idx: 4, key: "e" },
//         { type: "focus-input", idx: 4 },
//         { type: "handle-code-change" },
//       ]);
//     });

//     test("paste on last input", () => {
//       const [state, eff] = stateReducer({ ...currState, focusIdx: 4 }, { type: "handle-paste", idx: 0, val: "abc" });

//       expect(state).toMatchObject({ ...state, focusIdx: 4 });
//       expect(eff).toEqual([
//         { type: "set-input-val", idx: 4, val: "a" },
//         { type: "resolve-key", idx: 4, key: "a" },
//         { type: "handle-code-change" },
//       ]);
//     });

//     test("paste with denied key", () => {
//       const [state, eff] = stateReducer(currState, {
//         type: "handle-paste",
//         idx: 1,
//         val: "ab@",
//       });

//       expect(state).toMatchObject(state);
//       expect(eff).toEqual([
//         { type: "set-input-val", idx: 0, val: "" },
//         { type: "reject-key", idx: 1, key: "ab@" },
//         { type: "handle-code-change" },
//       ]);
//     });
//   });

//   test("focus-input", () => {
//     const [state, eff] = stateReducer(currState, { type: "focus-input", idx: 2 });

//     expect(state).toMatchObject({ ...state, focusIdx: 2 });
//     expect(eff).toEqual([{ type: "focus-input", idx: 2 }]);
//   });
// });

// describe("effect reducer", () => {
//   const { defaultProps, useEffectReducer } = pinField;
//   const inputA = mockInput("a");
//   const inputB = mockInput("b");
//   const inputC = mockInput("");
//   const propsFormatMock = jest.fn();
//   const propsMock = {
//     ...defaultProps,
//     length: 3,
//     format: (char: string) => {
//       propsFormatMock.apply(char);
//       return char;
//     },
//     onResolveKey: jest.fn(),
//     onRejectKey: jest.fn(),
//     onChange: jest.fn(),
//     onComplete: jest.fn(),
//   };

//   const refs: React.RefObject<any> = {
//     current: [inputA.ref, inputB.ref, inputC.ref],
//   };
//   const effectReducer = useEffectReducer({ ...propsMock, refs });

//   beforeEach(() => {
//     jest.resetAllMocks();
//   });

//   test("default action", () => {
//     // @ts-expect-error bad action
//     effectReducer({ type: "bad-action" });
//   });

//   test("focus input", () => {
//     effectReducer({ type: "focus-input", idx: 0 }, noop);
//     expect(inputA.ref.focus).toHaveBeenCalledTimes(1);
//   });

//   describe("set input val", () => {
//     test("empty char", () => {
//       effectReducer({ type: "set-input-val", idx: 0, val: "" }, noop);

//       expect(propsFormatMock).toHaveBeenCalledTimes(1);
//       expect(inputA.setValMock).toHaveBeenCalledTimes(1);
//       expect(inputA.setValMock).toHaveBeenCalledWith("");
//     });

//     test("non empty char", () => {
//       effectReducer({ type: "set-input-val", idx: 0, val: "a" }, noop);

//       expect(propsFormatMock).toHaveBeenCalledTimes(1);
//       expect(inputA.setValMock).toHaveBeenCalledTimes(1);
//       expect(inputA.setValMock).toHaveBeenCalledWith("a");
//     });
//   });

//   test("resolve key", () => {
//     effectReducer({ type: "resolve-key", idx: 0, key: "a" }, noop);

//     expect(inputA.ref.setCustomValidity).toHaveBeenCalledTimes(1);
//     expect(inputA.ref.setCustomValidity).toHaveBeenCalledWith("");
//     expect(propsMock.onResolveKey).toHaveBeenCalledTimes(1);
//     expect(propsMock.onResolveKey).toHaveBeenCalledWith("a", inputA.ref);
//   });

//   test("reject key", () => {
//     effectReducer({ type: "reject-key", idx: 0, key: "a" }, noop);

//     expect(inputA.ref.setCustomValidity).toHaveBeenCalledTimes(1);
//     expect(inputA.ref.setCustomValidity).toHaveBeenCalledWith("Invalid key");
//     expect(propsMock.onRejectKey).toHaveBeenCalledTimes(1);
//     expect(propsMock.onRejectKey).toHaveBeenCalledWith("a", inputA.ref);
//   });

//   describe("handle backspace", () => {
//     test("from input A, not empty val", () => {
//       effectReducer({ type: "handle-delete", idx: 0 }, noop);

//       expect(inputA.ref.setCustomValidity).toHaveBeenCalledTimes(1);
//       expect(inputA.ref.setCustomValidity).toHaveBeenCalledWith("");
//       expect(inputA.setValMock).toHaveBeenCalledTimes(1);
//       expect(inputA.setValMock).toHaveBeenCalledWith("");
//     });

//     test("from input B, not empty val", () => {
//       effectReducer({ type: "handle-delete", idx: 1 }, noop);

//       expect(inputB.ref.setCustomValidity).toHaveBeenCalledTimes(1);
//       expect(inputB.ref.setCustomValidity).toHaveBeenCalledWith("");
//       expect(inputB.setValMock).toHaveBeenCalledTimes(1);
//       expect(inputB.setValMock).toHaveBeenCalledWith("");
//     });

//     test("from input C, empty val", () => {
//       effectReducer({ type: "handle-delete", idx: 2 }, noop);

//       expect(inputC.ref.setCustomValidity).toHaveBeenCalledTimes(1);
//       expect(inputC.ref.setCustomValidity).toHaveBeenCalledWith("");
//       expect(inputC.setValMock).toHaveBeenCalledTimes(1);
//       expect(inputC.setValMock).toHaveBeenCalledWith("");
//       expect(inputB.ref.focus).toHaveBeenCalledTimes(1);
//       expect(inputB.ref.setCustomValidity).toHaveBeenCalledWith("");
//       expect(inputB.setValMock).toHaveBeenCalledTimes(1);
//       expect(inputB.setValMock).toHaveBeenCalledWith("");
//     });
//   });

//   describe("handle-code-change", () => {
//     test("code not complete", () => {
//       effectReducer({ type: "handle-code-change" }, noop);

//       expect(propsMock.onChange).toHaveBeenCalledTimes(1);
//       expect(propsMock.onChange).toHaveBeenCalledWith("ab");
//     });

//     test("code complete", () => {
//       const inputA = mockInput("a");
//       const inputB = mockInput("b");
//       const inputC = mockInput("c");
//       const refs: React.RefObject<any> = {
//         current: [inputA.ref, inputB.ref, inputC.ref],
//       };
//       const notify = useEffectReducer({ ...propsMock, refs });

//       notify({ type: "handle-code-change" }, noop);

//       expect(propsMock.onChange).toHaveBeenCalledTimes(1);
//       expect(propsMock.onChange).toHaveBeenCalledWith("abc");
//       expect(propsMock.onComplete).toHaveBeenCalledTimes(1);
//       expect(propsMock.onComplete).toHaveBeenCalledWith("abc");
//     });

//     test("rtl", () => {
//       jest.spyOn(document.documentElement, "getAttribute").mockImplementation(() => "rtl");

//       const inputA = mockInput("a");
//       const inputB = mockInput("b");
//       const inputC = mockInput("c");
//       const refs: React.RefObject<any> = {
//         current: [inputA.ref, inputB.ref, inputC.ref],
//       };
//       const notify = useEffectReducer({ ...propsMock, refs });

//       notify({ type: "handle-code-change" }, noop);

//       expect(propsMock.onChange).toHaveBeenCalledTimes(1);
//       expect(propsMock.onChange).toHaveBeenCalledWith("cba");
//       expect(propsMock.onComplete).toHaveBeenCalledTimes(1);
//       expect(propsMock.onComplete).toHaveBeenCalledWith("cba");
//     });

//     test("rtl with override in props", () => {
//       jest.spyOn(document.documentElement, "getAttribute").mockImplementation(() => "rtl");

//       const inputA = mockInput("a");
//       const inputB = mockInput("b");
//       const inputC = mockInput("c");
//       const refs: React.RefObject<any> = {
//         current: [inputA.ref, inputB.ref, inputC.ref],
//       };
//       const propsWithDir = { ...propsMock, dir: "ltr" };
//       const notify = useEffectReducer({ ...propsWithDir, refs });

//       notify({ type: "handle-code-change" }, noop);

//       expect(propsMock.onChange).toHaveBeenCalledTimes(1);
//       expect(propsMock.onChange).toHaveBeenCalledWith("abc");
//       expect(propsMock.onComplete).toHaveBeenCalledTimes(1);
//       expect(propsMock.onComplete).toHaveBeenCalledWith("abc");
//     });
//   });
// });
