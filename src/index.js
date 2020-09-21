import Spiral from 'spiralloop'

/**
 * @returns the block position relative to the chunk (1 to 16)
 */
export const relative_block_position = ({ chunk_x, chunk_z, x, z }) => ({
  x: x - chunk_x * 16,
  z: z - chunk_z * 16,
})

/**
 * @returns the block position relative
 * to the chunk (1 to 16) encoded on 8 bits
 */
export const encode_relative_block_position = ({ x, z }) => x << 4 | z

/**
 * @returns an Object { x, z } representing the provided position
 */
export const read_horizontal_block_position = ({
  position,
  chunk_x,
  chunk_z,
}) => ({
  x: (position >> 4) + chunk_x * 16,
  z: (position & 0xF) + chunk_z * 16,
})

/**
 *
 * @returns the { x, z } chunk position
 */
export const chunk_from_block = ({ x, z }) => ({
  x: Math.floor(z / 16),
  z: Math.floor(z / 16),
})

export default ({ read_chunk, read_bitmap }) => {
  const chunks = []
  const cached_chunk = async block => {
    const { x, z } = block
    const { chunk, bitmap, cache_hit } = chunks[x]?.[z] ?? {
      ...await read_chunk(block),
      ...await read_bitmap(block),
    }

    // atomic updates could be improved here
    if (!cache_hit) {
      // eslint-disable-next-line require-atomic-updates
      chunks[x] ||= []
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
  const nearby_chunks = ({ chunk_x, chunk_z, distance }) => {
    const result = []
    const range = distance * 2
    const pos_x = chunk_x - distance
    const pos_z = chunk_z - distance

    Spiral([range, range], (x, z) => {
      const block = {
        x: x + pos_x,
        z: z + pos_z,
      }

      result.push(cached_chunk(block))
    })

    return result
  }

  return {
    preload: async ({ chunk_x, chunk_z, distance }) => {
      console.log('[aresrpg] Loading world..')
      await Promise.all(nearby_chunks({
        chunk_x,
        chunk_z,
        distance,
      }))
      console.log('[aresrpg] World loaded!')
    },
    nearby_chunks,
  }
}
