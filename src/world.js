import spiral from 'spiralloop'
import progress from 'cli-progress'
import 'colors'

export default class World {
	chunks = []
	progress = new progress.Bar(
		{
			fps: 5,
			stream: process.stdout,
			barsize: 65,
			format: '[aresrpg] Preloading chunks'.magenta + ' {bar} | [{value}/{total}] - ' + '{duration}s'.magenta,
		},
		progress.Presets.shades_classic,
	)

	/**
	 *
	 * @param {Promise<Function>} readChunk function(x,z) to retrieve a chunk from a file or wherever
	 */
	constructor(readChunk) {
		this.readChunk = readChunk
	}

	async cachedChunk(x, z, callback) {
		await Promise.resolve() // ¯\_(ツ)_/¯
		let chunk = this.chunks[x] && this.chunks[x][z]
		if (!chunk) {
			chunk = await this.readChunk(x, z)
			if (!this.chunks[x]) this.chunks[x] = []
			this.chunks[x][z] = chunk
			if (callback) callback()
		}
		return { x, z, chunk }
	}

	async preload(centerX, centerZ, distance) {
		let toLoad = 0
		const range = distance * 2
		spiral([range, range], () => {
			toLoad++
		})
		console.log('[aresrpg] Loading world..'.magenta)
		this.progress.start(toLoad, 0)
		const chunks = this.nearbyChunks(centerX, centerZ, distance, () => this.progress.increment())
		await Promise.all(chunks)
		this.progress.stop()
		console.log('[aresrpg] World loaded!'.magenta)
	}

	/**
	 *
	 * @param {Number} chunkX
	 * @param {Number} chunkZ
	 * @param {Number} distance view distance
	 * @param {Function} callback optional callback executed every time a chunk is retrieved from the provided loader
	 * @returns {Promise[]} An array of promises which resolve as a Object { x, z, chunk }
	 */
	nearbyChunks(chunkX, chunkZ, distance, callback = undefined) {
		const chunks = []
		const range = distance * 2
		const posX = chunkX - distance
		const posZ = chunkZ - distance
		spiral([range, range], (x, z) => {
			chunks.push(this.cachedChunk(x + posX, z + posZ, callback))
		})
		return chunks
	}
}