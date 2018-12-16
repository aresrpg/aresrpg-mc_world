# aresrpg-world

Minecraft worlds dead-simple caching with spiral nearby chunks.

> When nearby chunks are demanded the module will retrieve them from cache or from your provider in case they don't exists

![](https://i.imgur.com/DAAZ2Hp.png)

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
async function readChunk(x, z) {
	return await myAwesomeChunkFileReader.chunkAt(x, z)
}

async function readBitmap(x, z) {
	return await myAwesomeChunkFileReader.bitMap(x, z)
}
```

We can now create the world instance with the chunk provider

```js
const myWorld = new World(readChunk, readBitmap)
```

You may want to preload some chunks to enhance user experience. Find the coords of a chunk in the center
of your map and provide them

```js
const centerX = 0
const centerZ = 0

void (async function() {
	myWorld.preload(centerX, centerZ, 50)
})()
```

You can now update a player as many as needed

```js
void (async function() {
	const userViewDistance = 10
	const userChunkX = 0
	const userChunkZ = 0
	const nearbyChunks = myWorld.nearbyChunks(userChunkX, userChunkZ, userViewDistance)
	const chunks = await Promise.all(nearbyChunks)
	// chunks.forEach(c => player.sendChunkPacket(c))
})()
```

The module also help you to encode a block position to use with the multiBlockChange packet

```js
compressBlock(x, y, z, blockId) {
	const { x: chunkX, z: chunkZ } = World.chunkFromBlock(x, z)
	const relative = World.relativeBlockPosition(chunkX, chunkZ, x, z)
	const horizontalPos = World.encodeRelativeBlockPosition(relative)
	return { horizontalPos, y, blockId }
}

const blocks = []
for(let i = 0; i < 10; i++)
	blocks.push(compressBlock(0,0,0,0))
```
