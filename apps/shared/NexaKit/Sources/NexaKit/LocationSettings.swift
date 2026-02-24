import Foundation

public enum NexaLocationMode: String, Codable, Sendable, CaseIterable {
    case off
    case whileUsing
    case always
}
