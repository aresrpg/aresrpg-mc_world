# aresrpg-world

Minecraft worlds dead-simple caching with spiral nearby chunks.

> When nearby chunks are demanded the module will retrieve them from cache or from your provider in case they don't exists

### Install

`npm i @aresrpg/aresrpg-world`

### Use:

```js
import World from 'aresrpg-world'

async function readChunk(x, z) {
	return await myAwesomeChunkFileReader.chunkAt(x, z)
}

const myWorld = new World(readChunk)

void (async function() {
	const viewDistance = 10
	const chunkX = 0
	const chunkZ = 0
	const nearbyChunks = myWorld.nearbyChunks(chunkX, chunkZ, viewDistance)
	const chunks = await Promise.all(nearbyChunks)
})()
```
