import Foundation
import Testing
@testable import Nexa

@Suite(.serialized)
struct NexaConfigFileTests {
    @Test
    func configPathRespectsEnvOverride() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("nexa-config-\(UUID().uuidString)")
            .appendingPathComponent("nexa.json")
            .path

        await TestIsolation.withEnvValues(["NEXA_CONFIG_PATH": override]) {
            #expect(NexaConfigFile.url().path == override)
        }
    }

    @MainActor
    @Test
    func remoteGatewayPortParsesAndMatchesHost() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("nexa-config-\(UUID().uuidString)")
            .appendingPathComponent("nexa.json")
            .path

        await TestIsolation.withEnvValues(["NEXA_CONFIG_PATH": override]) {
            NexaConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "ws://gateway.ts.net:19999",
                    ],
                ],
            ])
            #expect(NexaConfigFile.remoteGatewayPort() == 19999)
            #expect(NexaConfigFile.remoteGatewayPort(matchingHost: "gateway.ts.net") == 19999)
            #expect(NexaConfigFile.remoteGatewayPort(matchingHost: "gateway") == 19999)
            #expect(NexaConfigFile.remoteGatewayPort(matchingHost: "other.ts.net") == nil)
        }
    }

    @MainActor
    @Test
    func setRemoteGatewayUrlPreservesScheme() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("nexa-config-\(UUID().uuidString)")
            .appendingPathComponent("nexa.json")
            .path

        await TestIsolation.withEnvValues(["NEXA_CONFIG_PATH": override]) {
            NexaConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                    ],
                ],
            ])
            NexaConfigFile.setRemoteGatewayUrl(host: "new-host", port: 2222)
            let root = NexaConfigFile.loadDict()
            let url = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any])?["url"] as? String
            #expect(url == "wss://new-host:2222")
        }
    }

    @Test
    func stateDirOverrideSetsConfigPath() async {
        let dir = FileManager().temporaryDirectory
            .appendingPathComponent("nexa-state-\(UUID().uuidString)", isDirectory: true)
            .path

        await TestIsolation.withEnvValues([
            "NEXA_CONFIG_PATH": nil,
            "NEXA_STATE_DIR": dir,
        ]) {
            #expect(NexaConfigFile.stateDirURL().path == dir)
            #expect(NexaConfigFile.url().path == "\(dir)/nexa.json")
        }
    }

    @MainActor
    @Test
    func saveDictAppendsConfigAuditLog() async throws {
        let stateDir = FileManager().temporaryDirectory
            .appendingPathComponent("nexa-state-\(UUID().uuidString)", isDirectory: true)
        let configPath = stateDir.appendingPathComponent("nexa.json")
        let auditPath = stateDir.appendingPathComponent("logs/config-audit.jsonl")

        defer { try? FileManager().removeItem(at: stateDir) }

        try await TestIsolation.withEnvValues([
            "NEXA_STATE_DIR": stateDir.path,
            "NEXA_CONFIG_PATH": configPath.path,
        ]) {
            NexaConfigFile.saveDict([
                "gateway": ["mode": "local"],
            ])

            let configData = try Data(contentsOf: configPath)
            let configRoot = try JSONSerialization.jsonObject(with: configData) as? [String: Any]
            #expect((configRoot?["meta"] as? [String: Any]) != nil)

            let rawAudit = try String(contentsOf: auditPath, encoding: .utf8)
            let lines = rawAudit
                .split(whereSeparator: \.isNewline)
                .map(String.init)
            #expect(!lines.isEmpty)
            guard let last = lines.last else {
                Issue.record("Missing config audit line")
                return
            }
            let auditRoot = try JSONSerialization.jsonObject(with: Data(last.utf8)) as? [String: Any]
            #expect(auditRoot?["source"] as? String == "macos-nexa-config-file")
            #expect(auditRoot?["event"] as? String == "config.write")
            #expect(auditRoot?["result"] as? String == "success")
            #expect(auditRoot?["configPath"] as? String == configPath.path)
        }
    }
}
