// swift-tools-version: 5.9
// Generated for a release tag. Do not commit to the default branch.
import PackageDescription

let package = Package(
    name: "MobileTokens",
    platforms: [.iOS(.v13), .macOS("10.15")],
    products: [
        .library(name: "MobileTokens", targets: ["MobileTokens"])
    ],
    targets: [
        .target(name: "MobileTokens", path: "dist/ios")
    ]
)
