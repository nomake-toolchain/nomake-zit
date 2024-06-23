import { Target } from "nomake";
import { BuildConfig, NM } from "./config.ts";

export const zitDists = {
    "windows": {
        "x64": dist("windows", "x64"),
    },
    "linux": {
        "x64": dist("linux", "x64"),
        "arm64": dist("linux", "arm64"),
    },
    "macos": {
        "x64": dist("macos", "x64"),
        "arm64": dist("macos", "arm64"),
    },
};

export class Zit {
    static exePath?: string = undefined;

    static async compress(sourcePath: string, targetPath: string) {
        return compress(await Zit.setup(), sourcePath, targetPath);
    }

    static async decompress(sourcePath: string, targetPath: string) {
        return decompress(await Zit.setup(), sourcePath, targetPath);
    }

    static async setup() {
        if (Zit.exePath != undefined) {
            return Zit.exePath;
        }
        const { os, arch } = NM.Platform.current;
        if (typeof os !== 'string') NM.fail("Unsupported platform: " + JSON.stringify({ os, arch }));
        if (typeof arch !== 'string') NM.fail("Unsupported platform: " + JSON.stringify({ os, arch }));
        if (os in zitDists) {
            const dists = zitDists[os];
            if (arch in dists) {
                // deno-lint-ignore no-explicit-any
                const t = (dists as any)[arch] as Target;
                // prerun to download zit
                await NM.makefile([t.name, ...Deno.args.filter((x) => x.startsWith("-D"))]);
                Zit.exePath = t.name;
                if (await new NM.Path(Zit.exePath).exists()) {
                    return Zit.exePath;
                }
                NM.fail("Failed to set up zit.");
            }
        }
        NM.fail("Unsupported platform: " + JSON.stringify({ os, arch }));
    }
}

export default Zit;

export async function compress(zitExecutable: string, sourcePath: string, targetPath: string) {
    await NM.Shell.runChecked(
        [
            zitExecutable,
            '-c',
            sourcePath,
            '-o',
            targetPath
        ],
        { logError: true, printCmd: true }
    )
}

export async function decompress(zitExecutable: string, sourcePath: string, targetPath: string) {
    await NM.Shell.runChecked(
        [
            zitExecutable,
            '-d',
            sourcePath,
            '-o',
            targetPath
        ],
        { logError: true, printCmd: true }
    )
}

function dist(os: NM.OS, arch: NM.Arch) {
    const download = NM.webArchive(
        resourceUrl(os, arch),
        {
            suffixRespectUrl: false,
        },
    );
    const identifier = dotnetIdentifier(os, arch);

    return NM.target(
        {
            name: fixExe(`tmp/nm/zit/zit-${identifier}`, os),
            deps: { download },
            async build({ deps, target }) {
                await new NM.Path(deps.download).copyTo(target);
                if (os !== "windows") {
                    await new NM.Path(target).chmod(0o755);
                }

                NM.Log.ok("zit is set up (dotnet identifier: " + identifier);
            },
        },
    );
}

function resourceUrl(os: NM.OS, arch: NM.Arch) {
    const identifier = dotnetIdentifier(os, arch);
    const urlToAdjust =
        `${BuildConfig.ZIT_DOWNLOAD_URL}/v${BuildConfig.version}/zit-${identifier}-${BuildConfig.version}`;
    return fixExe(urlToAdjust, os);
}

function fixExe(p: string, os: NM.OS) {
    if (os == "windows") return p + ".exe";
    return p;
}

function dotnetIdentifier(os: NM.OS, arch: NM.Arch) {
    if (os == "windows" && arch == "x64") return "win-x64";
    if (os == "windows" && arch == "arm64") return "win-arm64";
    if (os == "linux" && arch == "x64") return "linux-x64";
    if (os == "linux" && arch == "arm64") return "linux-arm64";
    if (os == "macos" && arch == "x64") return "osx-x64";
    if (os == "macos" && arch == "arm64") return "osx-arm64";
    throw new Error(`Unsupported platform: ${JSON.stringify({ os, arch })}`);
}
