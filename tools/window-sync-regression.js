const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const inject = require('../lib/plugins/inventory')

for (const reset of [null, 'login', 'respawn']) {
  const bot = new EventEmitter()
  bot.version = '1.21.11'
  bot.registry = require('minecraft-data')(bot.version)
  bot.supportFeature = name => bot.registry.supportFeature(name)
  bot._client = new EventEmitter()
  bot._client.write = () => {}
  inject(bot, { hideErrors: true })
  const windows = require('prismarine-windows')(bot.version)
  const old = windows.createWindow(1, 'minecraft:generic_9x3', 'Old')
  bot.currentWindow = old
  bot.closeWindow(old)
  if (reset) bot._client.emit(reset, {})
  const next = windows.createWindow(1, 'minecraft:generic_9x1', 'New')
  bot._client.emit('window_items', { windowId: 1, items: Array(next.slots.length).fill({ present: false }) })
  let opened = 0
  bot.on('windowOpen', () => { opened++ })
  bot._client.emit('open_window', { windowId: 1, inventoryType: 'minecraft:generic_9x1', windowTitle: 'New' })
  assert.equal(opened, 1, `early window contents lost after ${reset}`)
  bot.closeWindow(bot.currentWindow)
  bot._client.emit('open_window', { windowId: 1, inventoryType: 'minecraft:generic_9x1', windowTitle: 'Again' })
  assert.equal(opened, 1, 'consumed contents reused for another window')
}
console.log('3 window reuse/reset regressions passed')
