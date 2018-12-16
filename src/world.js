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
	 * @param {Promise<Function>} readBitMap function(x,z) to retrieve the bitmap for a chunk column
	 */
	constructor(readChunk, readBitMap) {
		this.readChunk = readChunk
		this.readBitMap = readBitMap
	}

	async cachedChunk(x, z, callback) {
		await Promise.resolve() // ¯\_(ツ)_/¯
		let { chunk, bitMap } = (this.chunks[x] && this.chunks[x][z]) || {}
		if (!chunk) {
			const [_chunk, _bitMap] = await Promise.all([this.readChunk(x, z), this.readBitMap(x, z)])
			chunk = _chunk
			bitMap = _bitMap
			if (!this.chunks[x]) this.chunks[x] = []
			this.chunks[x][z] = { chunk, bitMap }
			if (callback) callback()
		}
		return { x, z, chunk, bitMap }
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
	 * @returns {Promise[]} An array of promises which resolve as an Object { x, z, chunk, bitMap }
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

	/**
	 *
	 * @param {Number} chunkX
	 * @param {Number} chunkZ
	 * @param {Number} x blockX
	 * @param {Number} z blockZ
	 * @returns the block position relative to the chunk (1 to 16)
	 */
	static relativeBlockPosition(chunkX, chunkZ, x, z) {
		return { x: x - chunkX * 16, z: z - chunkZ * 16 }
	}

	/**
	 *
	 * @param {Object} relativePosition
	 * @returns the block position relative to the chunk (1 to 16) encoded on 8 bits
	 */
	static encodeRelativeBlockPosition({ x, z }) {
		return (x << 4) | z
	}

	/**
	 *
	 * @param {Number} position binary encoded horizontal block position
	 * @param {Number} chunkX
	 * @param {Number} chunkZ
	 * @returns an Object { x, z } representing the provided position
	 */
	static readHorizontalBlockPosition(position, chunkX, chunkZ) {
		return {
			x: (position >> 4) + chunkX * 16,
			z: (position & 0xf) + chunkZ * 16,
		}
	}

	/**
	 *
	 * @param {Number} blockX
	 * @param {Number} blockZ
	 * @returns the { x, z } chunk position
	 */
	static chunkFromBlock(blockX, blockZ) {
		const x = Math.floor(blockX / 16)
		const z = Math.floor(blockZ / 16)
		return { x, z }
	}
}
