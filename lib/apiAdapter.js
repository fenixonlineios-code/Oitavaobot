import axios from 'axios'

const BASE = 'https://adultcolonyapi.onrender.com'

export async function apiRequest(apiName, endpoint, params = {}) {
  const baseUrl = `${BASE}/${apiName}/${endpoint}`

  const queryString = new URLSearchParams(params).toString()
  const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl

  console.log('🔥 URL FINAL:', fullUrl)

  const { data } = await axios.get(fullUrl, {
    headers: { accept: 'application/json' }
  })

  return data
}

export async function searchAPI(apiName, query, page = 1) {
  const data = await apiRequest(apiName, 'search', { query, page })

  const list = data.results || data.data || []

  return {
    results: list.map(v => ({
      title: v.title || 'Sem título',
      url: v.link || v.url || v.video || '',
      id: extractId(v.id || v.link || v.url || v.video),
      thumbnail: v.thumbnail || v.image || v.thumb || '',
      duration: v.duration || 'N/A',
      views: v.views || 'N/A',
      rating: v.rating || 'N/A'
    })),
    pagination: data.pagination || { currentPage: page, totalPages: 1 }
  }
}


export async function getAPI(apiName, input) {
  const id = extractId(input, apiName)

  if (!id) throw new Error('ID inválido.')

  const data = await apiRequest(apiName, 'get', { id })

  return {
    title: data.title || 'Sem título',
    description: data.description || '',
    thumbnails: data.thumbnails || [],
    thumbnail: data.thumbnails?.[0] || '',
    streams: data.streams || [],
    tags: data.tags || []
  }
}

const ID_EXTRACTORS = {
  xvideos2: input => {
    const str = String(input)

    // exemplo: /012345/good
   const match = str.match(/(video\.[^\/]+\/[^\/]+)\/?$/)
return match?.[1] || null
  },

  hentaicity: input => {
    const str = String(input)

  const match = str.match(/([^\/]+)\.html$/)
return match?.[1] || null
  },

hentaifox: input => {
  const str = String(input)

  const match = str.match(/\/(\d+)\/?$/)
  return match?.[1] || null
},

pornhub: input => {
  const str = String(input)

  const match = str.match(/[?&]viewkey=([^&]+)/)
  return match?.[1] || null
},

xhamster: input => {
  const str = String(input)

const match = str.match(/videos\/[^\/]+/)
return match?.[0] || null
},

xnxx: input => {
  const str = String(input)

  const match = str.match(/\/(video-[^\/]+\/[^\/]+)\/?$/)
  return match?.[1] || null
},

  eporner: input => {
    const str = String(input)

    // exemplo: /video/123456
   const match = str.match(/\/(\d+)\//)
    return match?.[1] || null
  }
}


export function extractId(input = '', apiName = '') {
  const str = String(input)

  if (/^\d+$/.test(str)) return str

  const extractor = ID_EXTRACTORS[apiName]
  if (extractor) {
    const id = extractor(str)
    if (id) return id
  }

  // fallback genérico
  const param = str.match(/[?&]id=(\d+)/)
  if (param) return param[1]

  const slash = str.match(/\/(\d+)(?:\/|$)/)
  if (slash) return slash[1]

  const last = str.match(/(\d+)(?:\/)?$/)
  if (last) return last[1]

  return null
}

export function getBestStream(streams = []) {
  if (!streams.length) return null

  return streams
    .filter(v => v.url)
    .sort((a, b) => {
      const qa = parseInt(String(a.quality).replace(/\D/g, '')) || 0
      const qb = parseInt(String(b.quality).replace(/\D/g, '')) || 0
      return qb - qa
    })[0]
}
