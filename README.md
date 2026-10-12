# Mobile tokens spike

This repository tests distributing generated design tokens from one platform-neutral source. The default branch contains the token JSON, the [Style Dictionary](https://styledictionary.com/) build, and Android library packaging. Generated output and the SwiftPM manifest are absent from the default branch.

## How it works

1. `data/tokens/core.json` holds the shared token values, using `$type` and `$value` entries. Its location and core layer are inspired by [Sage's token repository](https://github.com/Sage/design-tokens/tree/master/data/tokens); the sample values here are ours.
2. `npm run build` uses Style Dictionary to generate `dist/ios/DesignTokens.swift`, `dist/android/res/values/{colors,dimens}.xml`, and `dist/css/tokens.css` from that same source.
3. `npm run generate:package` creates a root `Package.swift` whose library target uses `dist/ios`. It declares iOS 13 and macOS 10.15 as minimum versions so the SwiftUI tokens also compile during the macOS CI build.
4. The Android library packages the generated XML resources into an AAR with a Maven publication. No remote Maven repository is configured yet.
5. The **Release mobile tokens** workflow builds the Android AAR on default-branch pushes. When run manually with a version, it also commits only `dist/ios` and the Swift manifest in a release-only commit, tags that commit, and publishes a GitHub release with the Android AAR attached. It does not push the release commit to the default branch.

Swift Package Manager resolves the Git tag and reads `Package.swift` and `dist/ios` from that tagged commit. The CSS and Android outputs are excluded from the release tag. The Android AAR is a GitHub Release asset for manual download; Gradle cannot use the Release URL as a Maven repository. The Swift package version comes from the tag, not from `Package.swift`.

## Try it locally

Node 22 or later and npm are required. A Swift toolchain is needed for the last two commands.

```sh
npm ci
npm run build
npm run generate:package
swift package dump-package
swift build
```

The whole `dist/` tree and `Package.swift` are ignored by Git on the default branch. The sample colours are intentionally distinct. Version `0.2.0` adds purple `#6D28D9`, yellow `#FACC15`, and `extraLarge` spacing alongside the original tokens. The CSS output exposes colours as custom properties such as `--core-color-signal-magenta`.

## Android AAR

The generated Android resources are `dist/android/res/values/colors.xml` and `dimens.xml`. They use prefixed names such as `dt_core_color_royal_purple` and `dt_core_spacing_extra_large`; spacing numbers are interpreted as `dp`.

On a machine with JDK 17, Android SDK API 35, and Gradle 8.13, build the AAR after generating tokens:

```sh
npm ci
npm run build
gradle :android-tokens:assembleRelease
```

The AAR is at `android-tokens/build/outputs/aar/android-tokens-release.aar`. To try the attached Release asset in an Android app, download it into the app's `libs/` directory and add `implementation(files("libs/android-tokens-release.aar"))` to the app module. For example, use `@color/dt_core_color_royal_purple` and `@dimen/dt_core_spacing_extra_large` in an XML layout. This manual AAR installation is only for this stage of the spike.

The library also declares a Maven publication, using `com.example.design:tokens-android:0.3.0-SNAPSHOT` by default. `gradle :android-tokens:publishToMavenLocal` can exercise that publication without uploading to a registry. Set `-PtokenGroup=...` and `-PtokenVersion=...` when the final coordinates and release version are decided. A future registry release will let consumers use `implementation("group:tokens-android:version")` directly.

## Publish a release

From the default branch, run **Actions → Release mobile tokens → Run workflow** and enter a version such as `0.3.0`. The workflow creates tag `v0.3.0` and a GitHub release with the Android AAR. Versions must be unique `major.minor.patch` values. The workflow runs only from the default branch and needs Actions permission to write repository contents.

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
            Rectangle().fill(DesignTokens.Color.royalPurple)
            Rectangle().fill(DesignTokens.Color.sunflowerYellow)
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

## Check an update in Xcode

After publishing `v0.2.0`, change an app using the exact `0.1.0` package version to exact `0.2.0` in its package dependency settings, then resolve package versions. The two new colours above and `DesignTokens.Spacing.extraLarge` should become available. An app using a version range from `0.1.0` can instead update package versions within that range.
