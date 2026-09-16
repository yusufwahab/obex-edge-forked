package com.yusufwahabraotech.obexedge.onvif

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.wifi.WifiManager
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.SocketTimeoutException
import java.util.UUID
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

private const val MULTICAST_ADDRESS = "239.255.255.250"
private const val MULTICAST_PORT = 3702
private const val LISTEN_DURATION_MS = 5000L
private const val SOCKET_TIMEOUT_MS = 500
private const val WIFI_WAIT_TIMEOUT_MS = 2000L

class OnvifDiscoveryModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val context = reactContext
    private val executor = Executors.newSingleThreadExecutor()

    override fun getName(): String = "OnvifDiscovery"

    @ReactMethod
    fun discover(promise: Promise) {
        executor.execute {
            var multicastLock: WifiManager.MulticastLock? = null
            var socket: DatagramSocket? = null
            var networkCallback: ConnectivityManager.NetworkCallback? = null
            val connectivityManager =
                context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

            try {
                val wifiManager =
                    context.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
                        ?: return@execute promise.reject("E_NO_WIFI_MANAGER", "WifiManager unavailable")

                multicastLock = wifiManager.createMulticastLock("obexedge-onvif").apply {
                    setReferenceCounted(true)
                    acquire()
                }

                val wifiNetwork = resolveWifiNetwork(connectivityManager) { callback ->
                    networkCallback = callback
                }
                    ?: return@execute promise.reject("E_NO_WIFI", "No Wi-Fi network available")

                socket = DatagramSocket().apply {
                    wifiNetwork.bindSocket(this)
                    reuseAddress = true
                    soTimeout = SOCKET_TIMEOUT_MS
                }

                sendProbe(socket)

                val results = collectProbeMatches(socket)

                val array = Arguments.createArray()
                for ((ip, port) in results) {
                    val map = Arguments.createMap()
                    map.putString("ip", ip)
                    map.putInt("port", port)
                    array.pushMap(map)
                }
                promise.resolve(array)
            } catch (e: Exception) {
                Log.e("OnvifDiscovery", "Discovery failed", e)
                promise.reject("E_SOCKET", e.message, e)
            } finally {
                try {
                    socket?.close()
                } catch (_: Exception) {
                }
                try {
                    multicastLock?.let { if (it.isHeld) it.release() }
                } catch (_: Exception) {
                }
                try {
                    networkCallback?.let { connectivityManager.unregisterNetworkCallback(it) }
                } catch (_: Exception) {
                }
            }
        }
    }

    /**
     * Returns the device's current Wi-Fi Network, preferring the already-active network
     * if it's Wi-Fi, otherwise briefly requesting one. WS-Discovery must go out on Wi-Fi
     * specifically (never cellular), so we never fall back to the "default" network.
     */
    private fun resolveWifiNetwork(
        connectivityManager: ConnectivityManager,
        onCallbackRegistered: (ConnectivityManager.NetworkCallback) -> Unit
    ): Network? {
        val active = connectivityManager.activeNetwork
        val activeCaps = active?.let { connectivityManager.getNetworkCapabilities(it) }
        if (activeCaps?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true) {
            return active
        }

        val latch = CountDownLatch(1)
        var found: Network? = null
        val request = NetworkRequest.Builder()
            .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
            .build()
        val callback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                found = network
                latch.countDown()
            }
        }
        onCallbackRegistered(callback)
        connectivityManager.requestNetwork(request, callback)
        latch.await(WIFI_WAIT_TIMEOUT_MS, TimeUnit.MILLISECONDS)
        return found
    }

    private fun sendProbe(socket: DatagramSocket) {
        val probeXml = """<?xml version="1.0" encoding="UTF-8"?>
<e:Envelope xmlns:e="http://www.w3.org/2003/05/soap-envelope"
    xmlns:w="http://schemas.xmlsoap.org/ws/2004/08/addressing"
    xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery"
    xmlns:dn="http://www.onvif.org/ver10/network/wsdl">
  <e:Header>
    <w:MessageID>urn:uuid:${UUID.randomUUID()}</w:MessageID>
    <w:To e:mustUnderstand="true">urn:schemas-xmlsoap-org:ws:2005:04:discovery</w:To>
    <w:Action>http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</w:Action>
  </e:Header>
  <e:Body>
    <d:Probe>
      <d:Types>dn:NetworkVideoTransmitter</d:Types>
    </d:Probe>
  </e:Body>
</e:Envelope>"""
        val bytes = probeXml.toByteArray(Charsets.UTF_8)
        val address = InetAddress.getByName(MULTICAST_ADDRESS)
        socket.send(DatagramPacket(bytes, bytes.size, address, MULTICAST_PORT))
    }

    private fun collectProbeMatches(socket: DatagramSocket): LinkedHashMap<String, Int> {
        val found = LinkedHashMap<String, Int>()
        val buf = ByteArray(8192)
        val deadline = System.currentTimeMillis() + LISTEN_DURATION_MS
        val xAddrsRegex = Regex("<[^:>]*:XAddrs>(.*?)</[^:>]*:XAddrs>", RegexOption.DOT_MATCHES_ALL)
        val urlRegex = Regex("^https?://([^:/]+)(?::(\\d+))?")

        while (System.currentTimeMillis() < deadline) {
            try {
                val packet = DatagramPacket(buf, buf.size)
                socket.receive(packet)
                val reply = String(packet.data, 0, packet.length, Charsets.UTF_8)

                val xAddrs = xAddrsRegex.find(reply)?.groupValues?.get(1)?.trim()
                val firstAddr = xAddrs?.split(Regex("\\s+"))?.firstOrNull()
                firstAddr?.let { addr ->
                    urlRegex.find(addr)?.let { m ->
                        val ip = m.groupValues[1]
                        val port = m.groupValues[2].toIntOrNull() ?: 80
                        found[ip] = port
                    }
                }
            } catch (_: SocketTimeoutException) {
                // no reply within this tick, keep looping until the deadline
            }
        }

        return found
    }
}
