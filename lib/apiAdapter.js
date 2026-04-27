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

  // 🔥 SÓ A API8 É DIFERENTE
  if (apiName === 'pornhub2') {
    const url = `https://adultcolonyapi.onrender.com/pornhub2/video/${id}`

    console.log('🔥 api8 URL:', url)

    const { data: raw } = await axios.get(url)

    return {
      title: raw.title || 'Sem título',
      description: '',
      thumbnail: raw.thumb || raw.preview || '',
      streams: (raw.mediaDefinitions || [])
        .filter(v => v.videoUrl)
        .map(v => ({
          quality: Array.isArray(v.quality) || !v.quality ? 'auto' : `${v.quality}p`,
          url: v.videoUrl,
          format: v.format || 'mp4'
        })),
      tags: raw.tags || [],
      views: raw.views || 'N/A',
      duration: raw.durationFormatted || 'N/A',
      rating: raw.vote?.rating || 'N/A'
    }
  }

  // 🔥 TODAS AS OUTRAS APIS (NÃO MEXE)
  const raw = await apiRequest(apiName, 'get', { id })
  const item = raw.data || raw.result || raw
  const assets = raw.assets || item.assets || []

  return {
    title: item.title || 'Sem título',
    description: item.description || '',
    thumbnail: item.image || item.thumbnail || assets.find(x => /\.(jpg|jpeg|png|webp)/i.test(x)) || '',
    streams: assets
      .filter(x => /\.mp4/i.test(x))
      .map(x => ({
        quality: x.match(/_(\d+p)\.mp4/i)?.[1] || 'auto',
        url: x
      })),
    tags: item.tags || [],
    views: item.views || 'N/A',
    duration: item.duration || 'N/A',
    rating: item.rating || 'N/A'
  }
}

const ID_EXTRACTORS = {
  xvideos: input => {
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

  pornhub2: input => {
  const str = String(input)

  // pega viewkey ou número direto
  const param = str.match(/[?&]viewkey=([^&]+)/)
  if (param) return param[1]

  const num = str.match(/(\d+)/)
  return num?.[1] || null
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
  if (!Array.isArray(streams) || !streams.length) return null

  return streams
    .filter(s => s.url)
    .sort((a, b) => {
      const qa = parseInt(String(a.quality).replace(/\D/g, '')) || 0
      const qb = parseInt(String(b.quality).replace(/\D/g, '')) || 0
      return qb - qa
    })[0]
}
