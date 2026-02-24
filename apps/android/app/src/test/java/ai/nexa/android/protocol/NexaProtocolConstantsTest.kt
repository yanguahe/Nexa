package ai.nexa.android.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class NexaProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", NexaCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", NexaCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", NexaCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", NexaCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", NexaCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", NexaCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", NexaCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", NexaCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", NexaCapability.Canvas.rawValue)
    assertEquals("camera", NexaCapability.Camera.rawValue)
    assertEquals("screen", NexaCapability.Screen.rawValue)
    assertEquals("voiceWake", NexaCapability.VoiceWake.rawValue)
  }

  @Test
  fun screenCommandsUseStableStrings() {
    assertEquals("screen.record", NexaScreenCommand.Record.rawValue)
  }
}
