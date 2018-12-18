import tape from 'blue-tape'
import World from '../src/world'

tape('Chunks should be cached', async t => {
	const world = new World(() => 'chunk', () => 'bitmap')
	await world.cachedChunk(0, 0)
	t.equal(world.chunks.length, 1, `cache length should be 1 but is ${world.chunks.length}`)
	const { chunk } = world.chunks[0][0]
	t.equal(chunk, 'chunk', `${chunk} should be chunk`)
})
