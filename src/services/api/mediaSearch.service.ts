/**
 * mediaSearch.service.ts — Servicio de autocompletado y búsqueda multimedia pública
 * Utiliza AniList GraphQL (para Anime/Manga), iTunes Search API (para Películas)
 * y TVMaze API (para Series).
 * 100% gratuitas, sin necesidad de tokens de API y con soporte CORS nativo para navegador.
 */

import type { ItemTipo } from '../../types/items';

export interface MediaSearchResult {
  id: string | number;
  titulo: string;
  portada: string;
  sinopsis?: string;
  anio?: number;
  totalEpisodios?: number;
  generos?: string[];
  estudio?: string;
  autor?: string;
  tipo: ItemTipo;
}

export const mediaSearchService = {
  /**
   * Busca contenido según el tipo y término de búsqueda.
   */
  async search(
    query: string,
    tipo: ItemTipo,
    signal?: AbortSignal
  ): Promise<MediaSearchResult[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) return [];

    try {
      if (tipo === 'Anime' || tipo === 'Manga') {
        return await this.searchAniList(cleanQuery, tipo, signal);
      } else if (tipo === 'Película') {
        const movieResults = await this.searchITunesMovies(cleanQuery, signal);
        if (movieResults.length > 0) return movieResults;
        // Si no encuentra en iTunes (ej. película de anime), probar en AniList
        const animeResults = await this.searchAniList(cleanQuery, 'Anime', signal);
        if (animeResults.length > 0) return animeResults;
        // Fallback final por si es una película de TV documentada en TVMaze
        return await this.searchTVMaze(cleanQuery, 'Película', signal);
      } else if (tipo === 'Serie') {
        const westernResults = await this.searchTVMaze(cleanQuery, tipo, signal);
        if (westernResults.length > 0) return westernResults;
        // Si no encuentra en TVMaze, probar en AniList por si es una serie anime
        return await this.searchAniList(cleanQuery, 'Anime', signal);
      } else if (tipo === 'Libro') {
        const books = await this.searchGoogleBooks(cleanQuery, signal);
        if (books.length > 0) return books;
        return await this.searchOpenLibrary(cleanQuery, signal);
      } else {
        return [];
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
   * Búsqueda en iTunes Search API (Películas comerciales de cine y streaming).
   * 100% gratuita, pública, sin necesidad de tokens de API y con soporte CORS nativo.
   */
  async searchITunesMovies(
    query: string,
    signal?: AbortSignal
  ): Promise<MediaSearchResult[]> {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=es&media=movie&entity=movie&limit=6`;
      const response = await fetch(url, { signal });
      if (!response.ok) return [];

      const json = await response.json();
      const results = json?.results;
      if (!Array.isArray(results)) return [];

      return results.map((item: any) => {
        // Portada: reescalar de 100x100 a 600x600 para alta definición en carteles
        let cover = item.artworkUrl100 || '';
        if (cover) {
          cover = cover.replace(/\/100x100bb\./, '/600x600bb.');
          cover = cover.replace(/^http:\/\//i, 'https://');
        }

        // Año de lanzamiento
        let year: number | undefined = undefined;
        if (item.releaseDate) {
          const rawYear = parseInt(item.releaseDate.slice(0, 4), 10);
          if (!isNaN(rawYear) && rawYear >= 1900 && rawYear <= 2100) {
            year = rawYear;
          }
        }

        // Sinopsis limpia sin etiquetas HTML
        const cleanDesc = (item.longDescription || item.shortDescription || '')
          .replace(/<[^>]*>?/gm, '')
          .replace(/\n\n/g, ' ')
          .trim();

        // Género principal
        const genres = item.primaryGenreName ? [item.primaryGenreName] : [];

        return {
          id: `itunes-${item.trackId || Math.random()}`,
          titulo: item.trackName || 'Sin título',
          portada: cover,
          sinopsis: cleanDesc.slice(0, 300) + (cleanDesc.length > 300 ? '...' : ''),
          anio: year,
          generos: genres,
          estudio: item.artistName || '',
          tipo: 'Película' as ItemTipo,
        };
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
      console.warn('[mediaSearchService] Error buscando en iTunes Movies:', err);
      return [];
    }
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

  /**
   * Búsqueda en Google Books API (Libros).
   * 100% gratuita, sin tokens y con soporte CORS nativo en navegadores.
   */
  async searchGoogleBooks(
    query: string,
    signal?: AbortSignal
  ): Promise<MediaSearchResult[]> {
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&printType=books`;
      const response = await fetch(url, { signal });
      if (!response.ok) return [];

      const json = await response.json();
      const items = json?.items;
      if (!Array.isArray(items)) return [];

      return items.map((item: any) => {
        const info = item.volumeInfo || {};

        // Portada limpia en HTTPS (removiendo parámetro que añade curva artificial a la portada)
        let cover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
        if (cover) {
          cover = cover.replace(/^http:\/\//i, 'https://');
          cover = cover.replace('&edge=curl', '');
        }

        // Año de publicación
        let year: number | undefined = undefined;
        if (info.publishedDate) {
          const rawYear = parseInt(info.publishedDate.slice(0, 4), 10);
          if (!isNaN(rawYear) && rawYear >= 1000 && rawYear <= 2100) {
            year = rawYear;
          }
        }

        // Autor(es)
        const author = Array.isArray(info.authors) ? info.authors.join(', ') : '';

        // Descripción / Sinopsis limpia sin HTML
        const cleanDesc = (info.description || '')
          .replace(/<[^>]*>?/gm, '')
          .replace(/\n\n/g, ' ')
          .trim();

        // Géneros / Categorías
        const genres: string[] = Array.isArray(info.categories)
          ? info.categories
              .flatMap((cat: string) => cat.split('/').map(c => c.trim()))
              .filter(Boolean)
          : [];

        return {
          id: `gbooks-${item.id}`,
          titulo: info.title || 'Sin título',
          portada: cover,
          sinopsis: cleanDesc.slice(0, 300) + (cleanDesc.length > 300 ? '...' : ''),
          anio: year,
          totalEpisodios: typeof info.pageCount === 'number' && info.pageCount > 0 ? info.pageCount : undefined,
          generos: genres.slice(0, 4),
          estudio: info.publisher || '',
          autor: author,
          tipo: 'Libro' as ItemTipo,
        };
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
      console.warn('[mediaSearchService] Error buscando en Google Books:', err);
      return [];
    }
  },

  /**
   * Búsqueda en Open Library API (Fallback abierto para Libros).
   */
  async searchOpenLibrary(
    query: string,
    signal?: AbortSignal
  ): Promise<MediaSearchResult[]> {
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6`;
      const response = await fetch(url, { signal });
      if (!response.ok) return [];

      const json = await response.json();
      const docs = json?.docs;
      if (!Array.isArray(docs)) return [];

      return docs.map((doc: any) => {
        const author = Array.isArray(doc.author_name) ? doc.author_name.join(', ') : '';
        const year = typeof doc.first_publish_year === 'number' ? doc.first_publish_year : undefined;
        const cover = doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : '';
        const publisher = Array.isArray(doc.publisher) ? doc.publisher[0] : '';
        const genres = Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : [];

        return {
          id: `openlib-${doc.key || Math.random()}`,
          titulo: doc.title || 'Sin título',
          portada: cover,
          anio: year,
          totalEpisodios: typeof doc.number_of_pages_median === 'number' ? doc.number_of_pages_median : undefined,
          generos: genres,
          estudio: publisher,
          autor: author,
          tipo: 'Libro' as ItemTipo,
        };
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
      console.warn('[mediaSearchService] Error buscando en Open Library:', err);
      return [];
    }
  },
};
