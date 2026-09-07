const assert = require('node:assert/strict')
const { test } = require('node:test')
const { EventEmitter } = require('node:events')
const inject = require('../lib/plugins/team')

for (const version of ['1.8.9', '1.21.11', '26.2']) {
  test(`team lifecycle and chat components ${version}`, () => {
    const bot = new EventEmitter()
    bot.version = version
    bot.registry = require('minecraft-data')(version)
    bot.supportFeature = name => bot.registry.supportFeature(name)
    bot._client = new EventEmitter()
    bot._warn = message => { throw new Error(message) }
    inject(bot)
    const component = text => version === '1.8.9' ? text : { type: 'string', value: text }
    const event = bot.supportFeature('teamUsesScoreboard') ? 'scoreboard_team' : 'teams'
    const properties = {
      prefix: component('[R]'),
      suffix: component('!'),
      nameTagVisibility: 'always',
      collisionRule: 'always'
    }
    Object.assign(properties, version === '26.2'
      ? { displayName: component('Red'), color: 12, flags: { friendly_fire: true, see_friendly_invisible: true } }
      : { name: component('Red'), formatting: 12, friendlyFire: 3 })
    const protocol = version === '26.2' ? require('minecraft-protocol') : null
    const serializer = protocol?.createSerializer({ state: 'play', isServer: true, version })
    const deserializer = protocol?.createDeserializer({ state: 'play', isServer: false, version })
    const send = packet => {
      let decoded = { team: 'red', ...packet }
      if (serializer) {
        if (typeof decoded.mode === 'number') decoded.mode = ['add', 'remove', 'change', 'join', 'leave'][decoded.mode]
        const buffer = serializer.createPacketBuffer({ name: 'teams', params: decoded })
        decoded = deserializer.parsePacketBuffer(buffer).data.params
      }
      bot._client.emit(event, decoded)
    }
    send({ mode: 'add', ...properties, players: ['Alice'] })
    const team = bot.teams.red
    assert.equal(team.name.toString(), 'Red')
    assert.equal(team.displayName('Alice').toString(), '[R]Alice!')
    assert.equal(team.color, 'red')
    assert.equal(team.friendlyFire, 3)
    assert.equal(bot.teamMap.Alice, team)
    send({ mode: 3, players: ['Bob'] })
    assert.deepEqual(team.members, ['Alice', 'Bob'])
    send({ mode: 4, players: ['Alice'] })
    assert.equal(bot.teamMap.Alice, undefined)
    const changed = version === '26.2'
      ? { displayName: component('Updated'), color: null, flags: { friendly_fire: false, see_friendly_invisible: true } }
      : { name: component('Updated'), formatting: -1, friendlyFire: 2 }
    send({ mode: 'change', ...properties, ...changed })
    assert.equal(team.name.toString(), 'Updated')
    assert.equal(team.color, 'reset')
    assert.equal(team.friendlyFire, 2)
    let removed
    bot.once('teamRemoved', value => { removed = value })
    send({ mode: 'remove' })
    assert.equal(removed, team)
    assert.equal(bot.teams.red, undefined)
    assert.equal(bot.teamMap.Bob, undefined)
  })
}
