import '@hydre/doubt'
import World from '../src/world'

'Cached chunks'.doubt(async () => {
	const world = new World(() => 'chunk', () => 'bitmap')
	await world.cachedChunk(0, 0)
	'should have a length of 1'.because(world.chunks.length).isEqualTo(1)
	const { chunk } = world.chunks[0][0]
	'should contain valid chunks'.because(chunk).isEqualTo('chunk')
})
