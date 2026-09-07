const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
for (const event of ['add_resource_pack', 'resource_pack_send']) {
  const bot = new EventEmitter()
  bot._client = new EventEmitter()
  bot.supportFeature = name => name === 'resourcePackUsesUUID'
  const sent = []
  bot._client.write = (name, data) => sent.push(data)
  require('../lib/plugins/resource_pack')(bot)
  const uuid = '12345678-1234-4321-8765-123456789abc'
  bot._client.emit(event, { uuid, url: 'https://example.invalid/pack.zip' })
  bot.acceptResourcePack()
  assert.equal(sent.length, 2)
  for (const packet of sent) assert.equal(packet.uuid, uuid)
}
console.log('2 resource-pack UUID regressions passed')
