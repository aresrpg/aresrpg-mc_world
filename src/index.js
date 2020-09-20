import Spiral from 'spiralloop'
import Progress from 'cli-progress'
import 'colors'

const make_progress_bar = () => new Progress.Bar(
    {
      fps    : 5,
      stream : process.stdout,
      barsize: 65,
      format :
    '[aresrpg] Preloading chunks'.magenta
    + ' {bar} | [{value}/{total}] - '
    + '{duration}s'.magenta,
    },
    progress.Presets.shades_classic,
)
const World = {
  /**
   * @returns the block position relative to the chunk (1 to 16)
   */
  relative_block_position: ({ chunk_x, chunk_z, x, z }) => ({
    x: x - chunk_x * 16,
    z: z - chunk_z * 16,
  }),
  /**
   * @returns the block position relative
   * to the chunk (1 to 16) encoded on 8 bits
   */
  encode_relative_block_position: ({ x, z }) => x << 4 | z,
  /**
   * @returns an Object { x, z } representing the provided position
   */
  read_horizontal_block_position: ({ position, chunkX, chunkZ }) => ({
    x: (position >> 4) + chunkX * 16,
    z: (position & 0xF) + chunkZ * 16,
  }),
  /**
   *
   * @param {Number} blockX
   * @param {Number} blockZ
   * @returns the { x, z } chunk position
   */
  chunk_from_block: ({ blockX, blockZ }) => ({
    x: Math.floor(blockX / 16),
    z: Math.floor(blockZ / 16),
  }),
}

export default ({ read_chunk, read_bitmap }) => {
  const chunks = []
  const progress = make_progress_bar()
  const cached_chunk = async ({ x, z }) => {
    const { chunk, bitmap, cache_hit }
      = chunks[x]?.[z]
      ?? await read_chunk({
        x,
        z,
      })

    if (!cache_hit) {
      // eslint-disable-next-line require-atomic-updates
      if (!chunks[x]) chunks[x] = []
      // eslint-disable-next-line require-atomic-updates
      chunks[x][z] = {
        chunk,
        bitmap,
        cache_hit: true,
      }
    }

    return {
      x,
      z,
      chunk,
      bitmap,
    }
  }

  return {
    ...World,
    cached_chunk,
  }
}

// export default class S {

//   async preload(centerX, centerZ, distance) {
//     let toLoad = 0
//     const range = distance * 2
//     spiral([range, range], () => {
//       toLoad++
//     })
//     console.log('[aresrpg] Loading world..'.magenta)
//     this.progress.start(toLoad, 0)
//     const chunks = this.nearbyChunks(centerX, centerZ, distance, () => this.progress.increment())
//     await Promise.all(chunks)
//     this.progress.stop()
//     console.log('[aresrpg] World loaded!'.magenta)
//   }

//   /**
//    *
//    * @param {Number} chunkX
//    * @param {Number} chunkZ
//    * @param {Number} distance view distance
//    * @param {Function} callback optional callback executed every time a chunk is retrieved from the provided loader
//    * @returns {Promise[]} An array of promises which resolve as an Object { x, z, chunk, bitMap }
//    */
//   nearbyChunks(chunkX, chunkZ, distance, callback = undefined) {
//     const chunks = []
//     const range = distance * 2
//     const posX = chunkX - distance
//     const posZ = chunkZ - distance
//     spiral([range, range], (x, z) => {
//       chunks.push(this.cachedChunk(x + posX, z + posZ, callback))
//     })
//     return chunks
//   }

// }
