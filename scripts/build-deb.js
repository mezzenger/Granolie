const fs = require("node:fs/promises");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

const execFileAsync = promisify(execFile);

const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");
const UNPACKED_DIR = path.join(DIST_DIR, "linux-unpacked");
const ICONS_DIR = path.join(ROOT, "build", "icons");
const STAGING_DIR = path.join(DIST_DIR, "deb-staging");
const APP_DIR = path.join(STAGING_DIR, "opt", "Granolie");
const DEBIAN_DIR = path.join(STAGING_DIR, "DEBIAN");
const APPLICATIONS_DIR = path.join(STAGING_DIR, "usr", "share", "applications");
const BIN_DIR = path.join(STAGING_DIR, "usr", "bin");
const HICOLOR_DIR = path.join(STAGING_DIR, "usr", "share", "icons", "hicolor");

const CONTROL_DEPENDS = [
  "libgtk-3-0",
  "libnotify4",
  "libnss3",
  "libxss1",
  "libxtst6",
  "xdg-utils",
  "libatspi2.0-0",
  "libuuid1",
  "libsecret-1-0",
];

const CONTROL_RECOMMENDS = ["libappindicator3-1"];
const ICON_SIZES = [32, 64, 128, 256, 512, 1024];

function archName() {
  switch (process.arch) {
    case "x64":
      return "amd64";
    case "arm64":
      return "arm64";
    default:
      return process.arch;
  }
}

function longDescriptionLines(text) {
  return text
    .split("\n")
    .flatMap((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return [" ."];
      }
      return [` ${trimmed}`];
    })
    .join("\n");
}

async function ensureFileExists(target, message) {
  try {
    await fs.access(target);
  } catch {
    throw new Error(message);
  }
}

async function writeControlFile(metadata) {
  const control = [
    `Package: ${metadata.name}`,
    `Version: ${metadata.version}`,
    "Section: utils",
    "Priority: optional",
    `Architecture: ${metadata.architecture}`,
    `Maintainer: ${metadata.maintainer}`,
    `Homepage: ${metadata.homepage}`,
    `Depends: ${CONTROL_DEPENDS.join(", ")}`,
    `Recommends: ${CONTROL_RECOMMENDS.join(", ")}`,
    `Description: ${metadata.synopsis}`,
    longDescriptionLines(metadata.description),
    "",
  ].join("\n");

  await fs.writeFile(path.join(DEBIAN_DIR, "control"), control, { mode: 0o644 });
}

async function writeDesktopFile() {
  const desktop = [
    "[Desktop Entry]",
    "Version=1.0",
    "Type=Application",
    "Name=Granolie",
    "Comment=Local AI meeting notes for Linux",
    "Exec=/opt/Granolie/granolie %U",
    "Icon=granolie",
    "Terminal=false",
    "Categories=Office;",
    "Keywords=notes;meetings;transcription;ai;productivity;",
    "StartupWMClass=Granolie",
    "",
  ].join("\n");

  await fs.writeFile(path.join(APPLICATIONS_DIR, "granolie.desktop"), desktop, { mode: 0o644 });
}

async function copyIcons() {
  for (const size of ICON_SIZES) {
    const source = path.join(ICONS_DIR, `${size}x${size}.png`);
    const destination = path.join(HICOLOR_DIR, `${size}x${size}`, "apps", "granolie.png");
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(source, destination);
  }
}

async function prepareStaging(metadata) {
  await fs.rm(STAGING_DIR, { recursive: true, force: true });
  await fs.mkdir(DEBIAN_DIR, { recursive: true });
  await fs.mkdir(APPLICATIONS_DIR, { recursive: true });
  await fs.mkdir(BIN_DIR, { recursive: true });

  await fs.cp(UNPACKED_DIR, APP_DIR, { recursive: true });
  await writeControlFile(metadata);
  await writeDesktopFile();
  await copyIcons();

  const launcherPath = path.join(BIN_DIR, "granolie");
  await fs.symlink("/opt/Granolie/granolie", launcherPath);
}

async function buildDebPackage(metadata) {
  const artifact = path.join(DIST_DIR, `Granolie-${metadata.version}-${metadata.architecture}.deb`);
  await fs.rm(artifact, { force: true });
  await execFileAsync("dpkg-deb", ["--build", "--root-owner-group", STAGING_DIR, artifact], {
    cwd: ROOT,
  });
  return artifact;
}

async function main() {
  const packageJsonPath = path.join(ROOT, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));

  await ensureFileExists(
    UNPACKED_DIR,
    "Missing dist/linux-unpacked. Run `npm run package` or `npm run dist:appimage` first."
  );
  await ensureFileExists(ICONS_DIR, "Missing build/icons. Packaging icons have not been generated.");

  const metadata = {
    architecture: archName(),
    description:
      packageJson.build?.linux?.description ||
      packageJson.description ||
      "Local AI meeting notes for Linux.",
    homepage: packageJson.homepage || "https://granolie.invalid",
    maintainer:
      packageJson.build?.deb?.maintainer ||
      "Granolie contributors <maintainers@granolie.invalid>",
    name: packageJson.name || "granolie",
    synopsis: packageJson.build?.linux?.synopsis || packageJson.description || "Granolie",
    version: packageJson.version || "0.1.0",
  };

  await prepareStaging(metadata);
  const artifact = await buildDebPackage(metadata);
  console.log(`Created ${artifact}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
