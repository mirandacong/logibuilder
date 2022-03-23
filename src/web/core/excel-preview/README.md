# Why not move `toSpreadJs()` into `lib/csf/sheet.ts`

Because moving it into `lib/csf/sheet.ts`,
that cause an issue in the browser,
when running the ts_devserver.

And the exact reason not be found yet.

It will be move into proper place after the issue fixed.

## Reproduce the issue

Step 1

Write code in src/lib/csf/sheet.ts

```typescript
//...
import * as GC from '@grapecity/spread-sheets';
//...

class SheetImpl extends logi.core.csf.Sheet {}
export class Sheet extends SheetImpl implements CsfBase<CsfSheet> {
    //...

    public toSpreadJs(): void {
        // This line cause the crash.
        new GC.Spread.Sheets.Worksheet('name');
    }
}
```

Step 2

Import the module somewhere,
like src/web/components/samples/csf-sheet/data.ts

```typescript
import * as csf from 'relative/path/to/csf';
```

Step 3

Run the devserver.

```text
bazel run src/ui:devserver
```

## Console in browser

The console output:

```text
<!-- markdownlint-disable line-length -->
zone.min.js:formatted:1008 Uncaught TypeError: Object prototype may only be an Object or null: undefined
<!-- markdownlint-enable line-length -->
    at setPrototypeOf (<anonymous>)
    at __extends (tslib.js:64)
    at eval (sheet.ts:10)
    at Object.eval (sheet.ts:10)
    at Object.execCb (bundle.min.js:1701)
    at Module.check (bundle.min.js:888)
    at Module.<anonymous> (bundle.min.js:1144)
    at bundle.min.js:139
    at bundle.min.js:1194
    at each (bundle.min.js:64)
```

Raise `at eval (sheet.ts:10)`, that is:

```typescript
class SheetImpl extends logi.core.csf.Sheet {}
```

## Need to know

- `@grapecity/spread-sheet` is place in node_modules.

- `@grapecity/spread-sheet` work fine as static file for ts_devserver.

- `@grapecity/spread-sheet` is not set as a dependence in BUILD file yet.
