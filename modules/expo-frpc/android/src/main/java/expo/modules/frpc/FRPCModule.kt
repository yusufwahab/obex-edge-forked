package expo.modules.frpc

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class FRPCModule : Module() {
  override fun definition() = ModuleDefinition {
    name("ExpoFRPC")
    
    function("startTunnel") { url: String ->
      // TODO: Implement FRPC tunnel functionality
      return@function "Tunnel started for: $url"
    }
    
    function("stopTunnel") {
      // TODO: Implement stop tunnel functionality
      return@function "Tunnel stopped"
    }
  }
}