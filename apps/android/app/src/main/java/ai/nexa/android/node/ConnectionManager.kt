package ai.nexa.android.node

import android.os.Build
import ai.nexa.android.BuildConfig
import ai.nexa.android.SecurePrefs
import ai.nexa.android.gateway.GatewayClientInfo
import ai.nexa.android.gateway.GatewayConnectOptions
import ai.nexa.android.gateway.GatewayEndpoint
import ai.nexa.android.gateway.GatewayTlsParams
import ai.nexa.android.protocol.NexaCanvasA2UICommand
import ai.nexa.android.protocol.NexaCanvasCommand
import ai.nexa.android.protocol.NexaCameraCommand
import ai.nexa.android.protocol.NexaLocationCommand
import ai.nexa.android.protocol.NexaScreenCommand
import ai.nexa.android.protocol.NexaSmsCommand
import ai.nexa.android.protocol.NexaCapability
import ai.nexa.android.LocationMode
import ai.nexa.android.VoiceWakeMode

class ConnectionManager(
  private val prefs: SecurePrefs,
  private val cameraEnabled: () -> Boolean,
  private val locationMode: () -> LocationMode,
  private val voiceWakeMode: () -> VoiceWakeMode,
  private val smsAvailable: () -> Boolean,
  private val hasRecordAudioPermission: () -> Boolean,
  private val manualTls: () -> Boolean,
) {
  companion object {
    internal fun resolveTlsParamsForEndpoint(
      endpoint: GatewayEndpoint,
      storedFingerprint: String?,
      manualTlsEnabled: Boolean,
    ): GatewayTlsParams? {
      val stableId = endpoint.stableId
      val stored = storedFingerprint?.trim().takeIf { !it.isNullOrEmpty() }
      val isManual = stableId.startsWith("manual|")

      if (isManual) {
        if (!manualTlsEnabled) return null
        if (!stored.isNullOrBlank()) {
          return GatewayTlsParams(
            required = true,
            expectedFingerprint = stored,
            allowTOFU = false,
            stableId = stableId,
          )
        }
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = null,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      // Prefer stored pins. Never let discovery-provided TXT override a stored fingerprint.
      if (!stored.isNullOrBlank()) {
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = stored,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      val hinted = endpoint.tlsEnabled || !endpoint.tlsFingerprintSha256.isNullOrBlank()
      if (hinted) {
        // TXT is unauthenticated. Do not treat the advertised fingerprint as authoritative.
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = null,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      return null
    }
  }

  fun buildInvokeCommands(): List<String> =
    buildList {
      add(NexaCanvasCommand.Present.rawValue)
      add(NexaCanvasCommand.Hide.rawValue)
      add(NexaCanvasCommand.Navigate.rawValue)
      add(NexaCanvasCommand.Eval.rawValue)
      add(NexaCanvasCommand.Snapshot.rawValue)
      add(NexaCanvasA2UICommand.Push.rawValue)
      add(NexaCanvasA2UICommand.PushJSONL.rawValue)
      add(NexaCanvasA2UICommand.Reset.rawValue)
      add(NexaScreenCommand.Record.rawValue)
      if (cameraEnabled()) {
        add(NexaCameraCommand.Snap.rawValue)
        add(NexaCameraCommand.Clip.rawValue)
      }
      if (locationMode() != LocationMode.Off) {
        add(NexaLocationCommand.Get.rawValue)
      }
      if (smsAvailable()) {
        add(NexaSmsCommand.Send.rawValue)
      }
      if (BuildConfig.DEBUG) {
        add("debug.logs")
        add("debug.ed25519")
      }
      add("app.update")
    }

  fun buildCapabilities(): List<String> =
    buildList {
      add(NexaCapability.Canvas.rawValue)
      add(NexaCapability.Screen.rawValue)
      if (cameraEnabled()) add(NexaCapability.Camera.rawValue)
      if (smsAvailable()) add(NexaCapability.Sms.rawValue)
      if (voiceWakeMode() != VoiceWakeMode.Off && hasRecordAudioPermission()) {
        add(NexaCapability.VoiceWake.rawValue)
      }
      if (locationMode() != LocationMode.Off) {
        add(NexaCapability.Location.rawValue)
      }
    }

  fun resolvedVersionName(): String {
    val versionName = BuildConfig.VERSION_NAME.trim().ifEmpty { "dev" }
    return if (BuildConfig.DEBUG && !versionName.contains("dev", ignoreCase = true)) {
      "$versionName-dev"
    } else {
      versionName
    }
  }

  fun resolveModelIdentifier(): String? {
    return listOfNotNull(Build.MANUFACTURER, Build.MODEL)
      .joinToString(" ")
      .trim()
      .ifEmpty { null }
  }

  fun buildUserAgent(): String {
    val version = resolvedVersionName()
    val release = Build.VERSION.RELEASE?.trim().orEmpty()
    val releaseLabel = if (release.isEmpty()) "unknown" else release
    return "NexaAndroid/$version (Android $releaseLabel; SDK ${Build.VERSION.SDK_INT})"
  }

  fun buildClientInfo(clientId: String, clientMode: String): GatewayClientInfo {
    return GatewayClientInfo(
      id = clientId,
      displayName = prefs.displayName.value,
      version = resolvedVersionName(),
      platform = "android",
      mode = clientMode,
      instanceId = prefs.instanceId.value,
      deviceFamily = "Android",
      modelIdentifier = resolveModelIdentifier(),
    )
  }

  fun buildNodeConnectOptions(): GatewayConnectOptions {
    return GatewayConnectOptions(
      role = "node",
      scopes = emptyList(),
      caps = buildCapabilities(),
      commands = buildInvokeCommands(),
      permissions = emptyMap(),
      client = buildClientInfo(clientId = "nexa-android", clientMode = "node"),
      userAgent = buildUserAgent(),
    )
  }

  fun buildOperatorConnectOptions(): GatewayConnectOptions {
    return GatewayConnectOptions(
      role = "operator",
      scopes = listOf("operator.read", "operator.write", "operator.talk.secrets"),
      caps = emptyList(),
      commands = emptyList(),
      permissions = emptyMap(),
      client = buildClientInfo(clientId = "nexa-control-ui", clientMode = "ui"),
      userAgent = buildUserAgent(),
    )
  }

  fun resolveTlsParams(endpoint: GatewayEndpoint): GatewayTlsParams? {
    val stored = prefs.loadGatewayTlsFingerprint(endpoint.stableId)
    return resolveTlsParamsForEndpoint(endpoint, storedFingerprint = stored, manualTlsEnabled = manualTls())
  }
}
