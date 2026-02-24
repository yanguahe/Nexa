import Foundation

// Stable identifier used for both the macOS LaunchAgent label and Nix-managed defaults suite.
// nix-nexa writes app defaults into this suite to survive app bundle identifier churn.
let launchdLabel = "ai.nexa.mac"
let gatewayLaunchdLabel = "ai.nexa.gateway"
let onboardingVersionKey = "nexa.onboardingVersion"
let onboardingSeenKey = "nexa.onboardingSeen"
let currentOnboardingVersion = 7
let pauseDefaultsKey = "nexa.pauseEnabled"
let iconAnimationsEnabledKey = "nexa.iconAnimationsEnabled"
let swabbleEnabledKey = "nexa.swabbleEnabled"
let swabbleTriggersKey = "nexa.swabbleTriggers"
let voiceWakeTriggerChimeKey = "nexa.voiceWakeTriggerChime"
let voiceWakeSendChimeKey = "nexa.voiceWakeSendChime"
let showDockIconKey = "nexa.showDockIcon"
let defaultVoiceWakeTriggers = ["nexa"]
let voiceWakeMaxWords = 32
let voiceWakeMaxWordLength = 64
let voiceWakeMicKey = "nexa.voiceWakeMicID"
let voiceWakeMicNameKey = "nexa.voiceWakeMicName"
let voiceWakeLocaleKey = "nexa.voiceWakeLocaleID"
let voiceWakeAdditionalLocalesKey = "nexa.voiceWakeAdditionalLocaleIDs"
let voicePushToTalkEnabledKey = "nexa.voicePushToTalkEnabled"
let talkEnabledKey = "nexa.talkEnabled"
let iconOverrideKey = "nexa.iconOverride"
let connectionModeKey = "nexa.connectionMode"
let remoteTargetKey = "nexa.remoteTarget"
let remoteIdentityKey = "nexa.remoteIdentity"
let remoteProjectRootKey = "nexa.remoteProjectRoot"
let remoteCliPathKey = "nexa.remoteCliPath"
let canvasEnabledKey = "nexa.canvasEnabled"
let cameraEnabledKey = "nexa.cameraEnabled"
let systemRunPolicyKey = "nexa.systemRunPolicy"
let systemRunAllowlistKey = "nexa.systemRunAllowlist"
let systemRunEnabledKey = "nexa.systemRunEnabled"
let locationModeKey = "nexa.locationMode"
let locationPreciseKey = "nexa.locationPreciseEnabled"
let peekabooBridgeEnabledKey = "nexa.peekabooBridgeEnabled"
let deepLinkKeyKey = "nexa.deepLinkKey"
let modelCatalogPathKey = "nexa.modelCatalogPath"
let modelCatalogReloadKey = "nexa.modelCatalogReload"
let cliInstallPromptedVersionKey = "nexa.cliInstallPromptedVersion"
let heartbeatsEnabledKey = "nexa.heartbeatsEnabled"
let debugPaneEnabledKey = "nexa.debugPaneEnabled"
let debugFileLogEnabledKey = "nexa.debug.fileLogEnabled"
let appLogLevelKey = "nexa.debug.appLogLevel"
let voiceWakeSupported: Bool = ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26
