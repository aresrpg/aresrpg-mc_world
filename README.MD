![][licence] [![][npm]][npmlink] [![][travis]][travislink] [![][npmdl]][npmlink]

# aresrpg-world

[![][discord]][discordlink] [![][twitter]][twitterlink] ![][mcversion]

[licence]: https://img.shields.io/github/license/AresRPG/aresrpg-world.svg?style=for-the-badge
[npm]: https://img.shields.io/npm/v/@aresrpg/aresrpg-world.svg?logo=npm&style=for-the-badge
[npmlink]: https://www.npmjs.com/package/@aresrpg/aresrpg-world
[travis]: https://img.shields.io/travis/com/AresRPG/aresrpg-world.svg?logo=travis&style=for-the-badge
[travislink]: https://travis-ci.com/AresRPG/aresrpg-world
[npmdl]: https://img.shields.io/npm/dw/@aresrpg/aresrpg-world.svg?color=%239C27B0&style=for-the-badge
[twitter]: https://img.shields.io/badge/follow-us-blue.svg?logo=twitter&style=for-the-badge
[twitterlink]: https://twitter.com/AresRPG
[discord]: https://img.shields.io/discord/265104803531587584.svg?logo=discord&style=for-the-badge
[discordlink]: https://discord.gg/Ea6a5cn
[mcversion]: https://img.shields.io/badge/minecraft-1.12+-AB47BC.svg?style=for-the-badge

Minecraft worlds dead-simple caching with spiral nearby chunks.

> When nearby chunks are demanded the module will retrieve them from cache or from your provider in case they don't exists

### Install

`npm i @aresrpg/aresrpg-world`

### Use:

```js
import World from '@aresrpg/aresrpg-world'
```

You will need to provide a way to read a chunk and his bitmap from a file, database, or anywhere else.
Here we'll use this snippet

> the bitmap is a 16 bits mask (0xffff) or 0000 0000 0000 0000 with bits set to 1 for every 16×16×16 chunk section whose contain non air block. The least significant bit represents the chunk section at the bottom of the chunk column (from y=0 to y=15).

```js
const my_reader = ({ x, z }) => ({ chunk, bitmap })
```

We can now create the world instance with the chunk provider

```js
const my_world = World(my_reader)
```

You may want to preload some chunks to enhance user experience. Find the coords of a chunk in the center
of your map and provide them

```js
const center_x = 0
const center_z = 0

await my_world.preload({
  chunk_x: center_x,
  chunk_z: center_z,
  distance: 5
})
```

You can now update a player as many as needed

```js
const userViewDistance = 10
const user_chunk_x = 0
const user_chunk_z = 0
const chunks = await Promise.all(my_world.nearby_chunks({
  chunk_x: user_chunk_x,
  chunk_z: user_chunk_z,
  distance
}))
// chunks.forEach(c => player.sendChunkPacket(c))
```

The module also help you to encode a block position to use with the multiBlockChange packet

```js
import {
  relative_block_position,
  encode_relative_block_position,
  read_horizontal_block_position,
  chunk_from_block
} from '@aresrpg/aresrpg-world'

const compress_block = ({ x, y, z, block_id }) => {
  const { x: chunk_x, z: chunk_z } = chunk_from_block({ x, z })
  const relative = relative_block_position({ chunk_x, chunk_z, x, z })
  const horizontal_position = encode_relative_block_position(relative)
  return { horizontal_position, y, block_id }
}

const blocks = []

for(let i = 0; i < 10; i++)
  blocks.push(compress_block({
    x       : 0,
    y       : 0,
    z       : 0,
    block_id: 0
  }))
```
