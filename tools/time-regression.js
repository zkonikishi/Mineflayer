const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const { test } = require('node:test')
const nbt = require('prismarine-nbt')
function setup () {
  const bot = new EventEmitter()
  bot._client = new EventEmitter()
  bot.game = { dimension: 'overworld' }
  require('../lib/plugins/time')(bot)
  return bot
}
test('registry clock IDs, partial updates and no guessed clock', () => {
  const bot = setup()
  bot._client.emit('registry_data', { id: 'minecraft:world_clock', entries: [{ key: 'custom:other' }, { key: 'custom:day' }] })
  bot._client.emit('registry_data', { id: 'minecraft:dimension_type', entries: [{ key: 'minecraft:overworld', value: nbt.comp({ default_clock: nbt.string('custom:day') }) }] })
  bot._client.emit('update_time', { gameTime: 4n, clockUpdates: [{ id: 0, totalTicks: 111n, rate: 1 }, { id: 1, totalTicks: 6000n, rate: 0 }] })
  assert.equal(bot.time.bigTime, 6000n)
  assert.equal(bot.time.doDaylightCycle, false)
  bot._client.emit('update_time', { gameTime: 5n, clockUpdates: [] })
  assert.equal(bot.time.bigTime, 6000n)
  assert.equal(bot.time.bigAge, 5n)
  bot.game.dimension = 'custom:unknown'
  bot._client.emit('update_time', { gameTime: 6n, clockUpdates: [{ id: 0, totalTicks: 999n, rate: 1 }] })
  assert.equal(bot.time.bigTime, null)
  bot._client.emit('start_configuration')
  bot.game.dimension = 'overworld'
  bot._client.emit('update_time', { gameTime: 7n, clockUpdates: [] })
  assert.equal(bot.time.bigTime, null)
})
test('legacy signed time remains compatible', () => {
  const bot = setup()
  bot._client.emit('update_time', { age: [0, -1], time: [-1, -6000] })
  assert.equal(bot.time.bigAge, 4294967295n)
  assert.equal(bot.time.bigTime, 6000n)
  assert.equal(bot.time.doDaylightCycle, false)
})
