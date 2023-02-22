import { execSync } from "child_process";
import fs, {
  copyFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import path from "path";
import { PREFIX } from "./const.mjs";

export const enableLibMp3Lame = (isWindows) => {
  if (isWindows) {
    const remotionLibDir = path.join(process.cwd(), "remotion", "lib");
    copyFileSync("libmp3lame.dll", path.join(remotionLibDir, "libmp3lame.dll"));
    return;
  }
  if (!fs.existsSync("libmp3lame")) {
    // Using newer than 3.100 because it has support for aarch64
    execSync("unzip libmp3lame.zip -d libmp3lame", {
      stdio: "inherit",
    });
  }

  execSync(
    [
      path.posix.join(
        process.cwd().replace(/\\/g, "/"),
        "libmp3lame",
        "configure"
      ),
      `--prefix=${path.join(process.cwd(), "libmp3lame", PREFIX)}`,
      "--enable-static",
      "--disable-shared",
      "--disable-decoder",
      "--enable-nasm",
      "--disable-rpath",
    ]
      .filter(Boolean)
      .join(" "),
    {
      cwd: "libmp3lame",
      stdio: "inherit",
    }
  );

  execSync("make", {
    cwd: "libmp3lame",
    stdio: "inherit",
  });

  execSync("make install", {
    cwd: "libmp3lame",
    stdio: "inherit",
  });

  unlinkSync("libmp3lame/remotion/lib/libmp3lame.la");
  unlinkSync("libmp3lame/remotion/bin/lame");
  rmSync("libmp3lame/remotion/share", { recursive: true });

  execSync(`cp -r ${PREFIX} ../`, { cwd: "libmp3lame", stdio: "inherit" });
};
