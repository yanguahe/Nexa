import Foundation

public enum NexaChatTransportEvent: Sendable {
    case health(ok: Bool)
    case tick
    case chat(NexaChatEventPayload)
    case agent(NexaAgentEventPayload)
    case seqGap
}

public protocol NexaChatTransport: Sendable {
    func requestHistory(sessionKey: String) async throws -> NexaChatHistoryPayload
    func sendMessage(
        sessionKey: String,
        message: String,
        thinking: String,
        idempotencyKey: String,
        attachments: [NexaChatAttachmentPayload]) async throws -> NexaChatSendResponse

    func abortRun(sessionKey: String, runId: String) async throws
    func listSessions(limit: Int?) async throws -> NexaChatSessionsListResponse

    func requestHealth(timeoutMs: Int) async throws -> Bool
    func events() -> AsyncStream<NexaChatTransportEvent>

    func setActiveSessionKey(_ sessionKey: String) async throws
}

extension NexaChatTransport {
    public func setActiveSessionKey(_: String) async throws {}

    public func abortRun(sessionKey _: String, runId _: String) async throws {
        throw NSError(
            domain: "NexaChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "chat.abort not supported by this transport"])
    }

    public func listSessions(limit _: Int?) async throws -> NexaChatSessionsListResponse {
        throw NSError(
            domain: "NexaChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "sessions.list not supported by this transport"])
    }
}
