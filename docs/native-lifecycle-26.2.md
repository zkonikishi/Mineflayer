# Native 26.2 lifecycle acceptance - 2026-09-07

- player_loaded: schema/state gated; repeated spawn supported; errors not silently discarded. Red 4/4 -> green 4/4 across 1.8.9, 1.21.3, 1.21.4 and 26.2.
- Time: server registry IDs and dimension default_clock replace hardcoded 0/1 and first-clock fallback. Cached partial updates; configuration clears mappings. Unknown clocks expose null day fields while preserving age. Two fixtures passed (one originally failed).
- Data installer: preflight reviewed versions 3.113.0 / 3.116.0 and destination JSON before writes. Recognized old protocol dataset may migrate by exact semantic SHA256; unknown contents rejected. One test with rejection/no-write/idempotence checks passed.
- Total targeted checks 15: game4 + time2 + team3 + window3 + UUID2 + installer1. Lint passed. Full legacy external matrix is not claimed.
- Native Paper 26.2-92, 127.0.0.1:29565: 8/8 integration assertions passed using MCP with the candidate game/time modules installed locally. Both child exit codes 0. No ViaVersion or production port.
- Real-plugin subset: ModelEngine R4.1.1, MythicMobs 5.13.1 snapshot, MythicDungeons 2.1 snapshot, PacketEvents 2.13. GUI, custom item, entity, multiline response and startup recovery covered. No graphical/model rendering or full production-stack claim.
- ModelEngine MECommand.onCommand(CommandSender,String[]) bytecode returns false with no sendMessage. Bare /meg response timeout is not a packet-loss reproduction. Use an actual response-producing subcommand or GUI tool as appropriate.
- Clock schema reference: https://www.minecraft.net/en-us/article/minecraft-java-edition-26-1 (World Clocks / Dimension Types).
