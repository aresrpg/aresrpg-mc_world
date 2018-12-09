# aresrpg-world

Minecraft worlds dead-simple caching with spiral nearby chunks.

> When nearby chunks are demanded the module will retrieve them from cache or from your provider in case they don't exists

![](https://i.imgur.com/DAAZ2Hp.png)

### Install

`npm i @aresrpg/aresrpg-world`

### Use:

```js
import World from 'aresrpg-world'
```

You will need to provide a way to read a chunk from a file, database, or anywhere else.
Here we'll use this snippet

```js
async function readChunk(x, z) {
	return await myAwesomeChunkFileReader.chunkAt(x, z)
}
```
We can now create the world instance with the chunk provider

```js
const myWorld = new World(readChunk)
```

You may want to preload some chunks to enhance user experience. Find the coords of a chunk in the center
of your map and provide them

```js
const centerX = 0
const centerZ = 0

void async function(){
	myWorld.preload(centerX, centerZ, 50)
}()
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
