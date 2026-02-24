// swift-tools-version: 6.2
// Package manifest for the Nexa macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "Nexa",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "NexaIPC", targets: ["NexaIPC"]),
        .library(name: "NexaDiscovery", targets: ["NexaDiscovery"]),
        .executable(name: "Nexa", targets: ["Nexa"]),
        .executable(name: "nexa-mac", targets: ["NexaMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/NexaKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "NexaIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "NexaDiscovery",
            dependencies: [
                .product(name: "NexaKit", package: "NexaKit"),
            ],
            path: "Sources/NexaDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "Nexa",
            dependencies: [
                "NexaIPC",
                "NexaDiscovery",
                .product(name: "NexaKit", package: "NexaKit"),
                .product(name: "NexaChatUI", package: "NexaKit"),
                .product(name: "NexaProtocol", package: "NexaKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/Nexa.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "NexaMacCLI",
            dependencies: [
                "NexaDiscovery",
                .product(name: "NexaKit", package: "NexaKit"),
                .product(name: "NexaProtocol", package: "NexaKit"),
            ],
            path: "Sources/NexaMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "NexaIPCTests",
            dependencies: [
                "NexaIPC",
                "Nexa",
                "NexaDiscovery",
                .product(name: "NexaProtocol", package: "NexaKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
