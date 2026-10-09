import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
function option(flag, fallback) {
  const index = args.indexOf(flag);
  if (index < 0) return fallback;
  if (!args[index + 1]) throw new Error(`Missing value for ${flag}`);
  return args[index + 1];
}

const name = option('--name', 'MobileTokens');
const minimumIOS = option('--ios-min-version', '13');
if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error('Package name must be a Swift identifier');
if (!/^[0-9]+$/.test(minimumIOS)) throw new Error('iOS minimum version must be a whole number');

function swiftFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return swiftFiles(path);
    return entry.isFile() && entry.name.endsWith('.swift') ? [path] : [];
  });
}

const sources = swiftFiles('dist/ios');
if (sources.length === 0) throw new Error('dist/ios has no Swift sources; run npm run build first');

const manifest = `// swift-tools-version: 5.9
// Generated for a release tag. Do not commit to main.
import PackageDescription

let package = Package(
    name: "${name}",
    platforms: [.iOS(.v${minimumIOS})],
    products: [
        .library(name: "${name}", targets: ["${name}"])
    ],
    targets: [
        .target(name: "${name}", path: "dist/ios")
    ]
)
`;
writeFileSync('Package.swift', manifest);
console.log(`Generated Package.swift for ${sources.length} Swift source(s)`);
