import Foundation

public enum NexaDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum NexaBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum NexaThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum NexaNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum NexaNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct NexaBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: NexaBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: NexaBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct NexaThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: NexaThermalState

    public init(state: NexaThermalState) {
        self.state = state
    }
}

public struct NexaStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct NexaNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: NexaNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [NexaNetworkInterfaceType]

    public init(
        status: NexaNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [NexaNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct NexaDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: NexaBatteryStatusPayload
    public var thermal: NexaThermalStatusPayload
    public var storage: NexaStorageStatusPayload
    public var network: NexaNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: NexaBatteryStatusPayload,
        thermal: NexaThermalStatusPayload,
        storage: NexaStorageStatusPayload,
        network: NexaNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct NexaDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
