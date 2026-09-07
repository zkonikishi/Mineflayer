# Native 26.2 teams

The 26.2 packet schema already decodes the correct wire order, but the team plugin
previously read the older `name` and `formatting` fields. Reading the absent name
caused prismarine-chat to receive undefined and throw while accessing `type`.

The plugin now accepts `displayName` and nullable `color`, while retaining the
legacy fields. Decoded `flags` map to the existing numeric friendlyFire bitmask
(friendly fire = 1, see friendly invisible players = 2). Missing color maps to
reset, not black. Team removal emits the removed object, not a deleted lookup.

`node --test tools/team-regression.js` exercises create/update/join/leave/remove
for 1.8.9, 1.21.11 and 26.2. Native 26.2 packets make a serializer/deserializer
round trip before entering the plugin. Existing window and resource-pack
regression scripts also remain passing. These targeted tests are not the full
upstream external Minecraft test suite.
