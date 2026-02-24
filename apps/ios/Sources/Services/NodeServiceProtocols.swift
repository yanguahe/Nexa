import CoreLocation
import Foundation
import NexaKit
import UIKit

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: NexaCameraSnapParams) async throws -> (format: String, base64: String, width: Int, height: Int)
    func clip(params: NexaCameraClipParams) async throws -> (format: String, base64: String, durationMs: Int, hasAudio: Bool)
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: NexaLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: NexaLocationGetParams,
        desiredAccuracy: NexaLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
}

protocol DeviceStatusServicing: Sendable {
    func status() async throws -> NexaDeviceStatusPayload
    func info() -> NexaDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: NexaPhotosLatestParams) async throws -> NexaPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: NexaContactsSearchParams) async throws -> NexaContactsSearchPayload
    func add(params: NexaContactsAddParams) async throws -> NexaContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: NexaCalendarEventsParams) async throws -> NexaCalendarEventsPayload
    func add(params: NexaCalendarAddParams) async throws -> NexaCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: NexaRemindersListParams) async throws -> NexaRemindersListPayload
    func add(params: NexaRemindersAddParams) async throws -> NexaRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: NexaMotionActivityParams) async throws -> NexaMotionActivityPayload
    func pedometer(params: NexaPedometerParams) async throws -> NexaPedometerPayload
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
