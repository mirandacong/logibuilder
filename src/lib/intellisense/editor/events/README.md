# EditorEvents

EditorEvents are the events indicating the user actions from frontend.
They are similar to the browser events.

| BrowserEvent     | EditorEvent            |
| ---------------- | ---------------------- |
| InputEvent       | EditorInputEvent       |
| CompositionEvent | EditorCompositionEvent |
| KeyboardEvent    | EditorKeyboardEvent    |
| MouseClickEvent  | EditorMouseEvent       |

## EditorMouseEvent

**EditorMouseEvent** is the event wrapped from the browser **MouseEvent**.
Check it in *mouse.ts*. The most significant difference is that
**EditorEvents** has the fileds (startOffset and endOffset) which requires extra
computing of the frontend.

## EditorCompositionEvent

This event is wrapped from browser **CompositionEvent**. **CompositionEvent**
dedicates to deliver the event that occurs by the input method.
There are 3 kinds of **CompositionEvent**. *start*, *update* and *end*.
So is **EditorCompositonEvent**.
We only need the composition end event whose data contains the whole information
about the input data from the input method.

## EditorInputEvent

The **InputEvent** always go with **KeyboardEvent**. But at the same time, the
*keyCode* of the **KeyboardEvent** will always be undefined. On the contrast,
InputEvent will not occur when a KeyboardEvent occurs and its keyCode is defined.

Therefore, **EditorInputEvent** dedicates to deliver some full-width characters
like '，' or '。' and the EditorInputEventHandler is major to do the conversion
from full-width to half-width.

## EditorKeyboardEvent

**EditorKeyboardEvent** is similar to the browser **KeyboardEvent**.
The most important difference is that the **keyCode** in the
EditorKeyboardEvent is always defined (Those undefined ones will not
be sent to us), which means that EditorKeyboardEvent dedicates to deliver the
half-width characters and the actions(i.e. Enter, Backspace, ArrowUp).

## Keyboard related event

|            | EditorKeyboardEvent | EditorInputEvent  | EditorCompositionEvent |
| ---------- | ------------------- | ----------------- | ---------------------- |
| half-width | true                | false             | false                  |
| full-width | false               | true(isComposing) | true                   |
| IME        | false               | true(isComposing) | true                   |
