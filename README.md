# Mobile tokens spike

This repository tests publishing generated design tokens only in release tags. The default branch contains a platform neutral token source and a [Style Dictionary](https://styledictionary.com/) build. Generated output and the SwiftPM manifest are absent from the default branch.

## How it works

1. `data/tokens/core.json` holds the shared token values, using `$type` and `$value` entries. Its location and core layer are inspired by [Sage's token repository](https://github.com/Sage/design-tokens/tree/master/data/tokens); the sample values here are ours.
2. `npm run build` uses Style Dictionary to generate `dist/ios/DesignTokens.swift` and `dist/css/tokens.css` from that same source.
3. `npm run generate:package` creates a root `Package.swift` whose library target uses `dist/ios`. It declares iOS 13 and macOS 10.15 as minimum versions so the SwiftUI tokens also compile during the macOS CI build.
4. The **Release Swift tokens** workflow commits only `dist/ios` and the manifest in a release-only commit, tags that commit, and publishes a GitHub release. It does not push the release commit to the default branch.

Swift Package Manager resolves the Git tag and reads `Package.swift` and `dist/ios` from that tagged commit. The CSS output is built locally but excluded from the release tag. Uploading the files solely as GitHub release assets would not make them available to SwiftPM. The package version comes from the tag, not from `Package.swift`.

## Try it locally

Node 22 or later and npm are required. A Swift toolchain is needed for the last two commands.

```sh
npm ci
npm run build
npm run generate:package
swift package dump-package
swift build
```

The whole `dist/` tree and `Package.swift` are ignored by Git on the default branch. The four sample colours are intentionally distinct: magenta `#E6007E`, cyan `#00B8D9`, lime `#A3E635`, and orange `#FF6B35`. The CSS output exposes them as custom properties such as `--core-color-signal-magenta`.

## Publish a release

From the default branch, run **Actions → Release Swift tokens → Run workflow** and enter a version such as `0.1.0`. The workflow creates tag `v0.1.0` and a GitHub release. Versions must be unique `major.minor.patch` values. The workflow runs only from the default branch and needs Actions permission to write repository contents.

Consumers can add this repository in Xcode using `https://github.com/tomdavies73/mobile-tokens-spike.git` and select a released version. The product and import name are both `MobileTokens`:

```swift
import SwiftUI
import MobileTokens

struct TokenPreview: View {
    var body: some View {
        HStack(spacing: DesignTokens.Spacing.medium) {
            Rectangle().fill(DesignTokens.Color.signalMagenta)
            Rectangle().fill(DesignTokens.Color.electricCyan)
            Rectangle().fill(DesignTokens.Color.acidLime)
            Rectangle().fill(DesignTokens.Color.warmOrange)
        }
        .frame(height: 80)
        .padding(DesignTokens.Spacing.small)
    }
}
```

For a package manifest in another project, use:

```swift
.package(url: "https://github.com/tomdavies73/mobile-tokens-spike.git", from: "0.1.0")
```

The repository has no SwiftPM manifest on the default branch, so consumers must resolve a release tag.
