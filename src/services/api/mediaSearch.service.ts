/**
 * mediaSearch.service.ts — Servicio de autocompletado y búsqueda multimedia pública
 * Utiliza AniList GraphQL (para Anime/Manga) y TVMaze API (para Series/Películas).
 * 100% gratuitas, sin necesidad de tokens de API y con soporte CORS nativo para navegador.
 */

export interface MediaSearchResult {
  id: string | number;
  titulo: string;
  portada: string;
  sinopsis?: string;
  anio?: number;
  totalEpisodios?: number;
  generos?: string[];
  estudio?: string;
  tipo: 'Anime' | 'Manga' | 'Serie' | 'Película';
}

export const mediaSearchService = {
  /**
   * Busca contenido según el tipo y término de búsqueda.
   */
  async search(
    query: string,
    tipo: 'Anime' | 'Manga' | 'Serie' | 'Película',
    signal?: AbortSignal
  ): Promise<MediaSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) return [];

    try {
      if (tipo === 'Anime' || tipo === 'Manga') {
        return await this.searchAniList(cleanQuery, tipo, signal);
      } else {
        const westernResults = await this.searchTVMaze(cleanQuery, tipo, signal);
        if (westernResults.length > 0) return westernResults;
        // Si no encuentra en TVMaze, probar en AniList por si es una película de anime
        return await this.searchAniList(cleanQuery, tipo === 'Película' ? 'Anime' : 'Anime', signal);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        throw err;
      }
      console.warn('[mediaSearchService] Error buscando multimedia:', err);
      return [];
    }
  },

  /**
   * Búsqueda en AniList GraphQL API (Anime / Manga).
   */
  async searchAniList(
    query: string,
    tipo: 'Anime' | 'Manga',
    signal?: AbortSignal
  ): Promise<MediaSearchResult[]> {
    const anilistType = tipo === 'Manga' ? 'MANGA' : 'ANIME';

    const gqlQuery = `
      query ($search: String, $type: MediaType) {
        Page(page: 1, perPage: 6) {
          media(search: $search, type: $type, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
            }
            description(asHtml: false)
            startDate {
              year
            }
            episodes
            chapters
            genres
            studios(isMain: true) {
              nodes {
                name
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: gqlQuery,
        variables: {
          search: query,
          type: anilistType,
        },
      }),
      signal,
    });

    if (!response.ok) return [];

    const json = await response.json();
    const mediaList = json?.data?.Page?.media || [];

    return mediaList.map((m: any) => {
      const title = m.title.english || m.title.romaji || m.title.native || 'Sin título';
      const cleanDesc = (m.description || '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\n\n/g, ' ')
        .trim();

      return {
        id: `anilist-${m.id}`,
        titulo: title,
        portada: m.coverImage?.extraLarge || m.coverImage?.large || '',
        sinopsis: cleanDesc.slice(0, 300) + (cleanDesc.length > 300 ? '...' : ''),
        anio: m.startDate?.year || undefined,
        totalEpisodios: tipo === 'Manga' ? m.chapters : m.episodes,
        generos: m.genres || [],
        estudio: m.studios?.nodes?.[0]?.name || '',
        tipo,
      };
    });
  },

  /**
   * Búsqueda en TVMaze API (Series y Películas para TV).
   */
  async searchTVMaze(
    query: string,
    tipo: 'Serie' | 'Película',
    signal?: AbortSignal
  ): Promise<MediaSearchResult[]> {
    const response = await fetch(
      `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`,
      { signal }
    );
    if (!response.ok) return [];

    const results = await response.json();
    if (!Array.isArray(results)) return [];

    return results.slice(0, 6).map((item: any) => {
      const show = item.show || {};
      const cleanDesc = (show.summary || '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\n\n/g, ' ')
        .trim();

      const year = show.premiered ? parseInt(show.premiered.split('-')[0]) : undefined;

      return {
        id: `tvmaze-${show.id}`,
        titulo: show.name || 'Sin título',
        portada: show.image?.original || show.image?.medium || '',
        sinopsis: cleanDesc.slice(0, 300) + (cleanDesc.length > 300 ? '...' : ''),
        anio: year,
        generos: show.genres || [],
        estudio: show.network?.name || show.webChannel?.name || '',
        tipo,
      };
    });
  },
};
