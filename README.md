# NoMake-Zit

## Installation as a NoMake Rule Sets

In your `deno.json`, add `"nomake"` and `"nomake-toolchain/zit"` to `"imports"`:

```json
{
    "imports": {
        "nomake": "https://raw.githubusercontent.com/thautwarm/nomake/v0.1.9/mod.ts",
        "nomake-toolchain/zit": "https://raw.githubusercontent.com/nomake-toolchain/nomake-zit/v0.1.0/mod.ts"
    }
}
```

## Usage

```typescript
import Zit from "nomake-toolchain/zit";
```

## Example

Create a `build.ts` in the root directory, and run `deno run -A build.ts build` automatically
updating the `dir.zip.zst` file when any `.txt` file in the `dir` directory changes.

```typescript
// build.ts
import { NM } from "nomake";
import Zit from "nomake-toolchain/zit";

NM.target(
    {
        name: 'dir.zip.zst',
        deps: NM.Path.glob("dir/**/*.txt"),
        async build() {
            await await Zit.compress('dir', 'dir.zip.zst');
        }
    })

NM.target(
    {
        name: 'build',
        virtual: true,
        deps: { file: 'dir.zip.zst' },
        build({ deps }) {
            NM.Log.ok(`${deps.file} rebuilt.`);
        }
    })

await NM.makefile()
```
