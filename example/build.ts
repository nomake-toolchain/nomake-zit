import * as NM from 'nomake';
import Zit from "../mod.ts";

NM.target(
    {
        name: 'dir.zip.zst',
        deps: NM.Path.glob("dir/**/*.txt"),
        async build() {
            await await Zit.compress(
                'dir',
                'dir.zip.zst'
            );

            // await await Zit.decompress(
            //     'dir.zip.zst',
            //     'dir2'
            // );
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