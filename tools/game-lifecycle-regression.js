const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const { test } = require('node:test')
for (const version of ['1.8.9', '1.21.3', '1.21.4', '26.2']) {
  test(`player_loaded protocol and lifecycle ${version}`, () => {
    const bot = new EventEmitter()
    bot.registry = require('minecraft-data')(version)
    bot.supportFeature = name => bot.registry.supportFeature(name)
    bot._client = new EventEmitter()
    bot._client.state = 'play'
    bot._client.registerChannel = () => {}
    const writes = []
    bot._client.write = (name, data) => writes.push({ name, data })
    require('../lib/plugins/game')(bot, {})
    const supported = Boolean(bot.registry.protocol.play.toServer.types.packet_player_loaded)
    bot.emit('spawn')
    assert.equal(writes.length, supported ? 1 : 0)
    bot._client.state = 'configuration'
    bot.emit('spawn')
    assert.equal(writes.length, supported ? 1 : 0)
    bot._client.state = 'play'
    bot.emit('spawn')
    assert.equal(writes.length, supported ? 2 : 0)
    if (supported) {
      bot._client.write = () => { throw new Error('write failed') }
      assert.throws(() => bot.emit('spawn'), /write failed/)
    }
  })
}
