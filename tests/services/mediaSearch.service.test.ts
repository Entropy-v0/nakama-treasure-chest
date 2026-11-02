import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mediaSearchService } from '@/services/api/mediaSearch.service'

describe('mediaSearchService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('debe retornar lista vacía si el query es menor a 2 caracteres', async () => {
    const res1 = await mediaSearchService.search('', 'Libro')
    const res2 = await mediaSearchService.search('a', 'Libro')
    const res3 = await mediaSearchService.search('   ', 'Libro')

    expect(res1).toEqual([])
    expect(res2).toEqual([])
    expect(res3).toEqual([])
  })

  it('debe buscar y mapear correctamente libros desde Google Books', async () => {
    const mockGoogleBooksResponse = {
      items: [
        {
          id: 'test-123',
          volumeInfo: {
            title: 'Cien años de soledad',
            authors: ['Gabriel García Márquez'],
            publisher: 'Editorial Sudamericana',
            publishedDate: '1967-05-30',
            description: '<p>Una de las obras cumbre de la literatura hispanoamericana.</p>',
            pageCount: 471,
            categories: ['Ficción / Realismo Mágico'],
            imageLinks: {
              thumbnail: 'http://books.google.com/books/content?id=test-123&edge=curl',
            },
          },
        },
      ],
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockGoogleBooksResponse,
    } as Response)

    const results = await mediaSearchService.search('Cien años', 'Libro')

    expect(results).toHaveLength(1)
    const book = results[0]
    expect(book.titulo).toBe('Cien años de soledad')
    expect(book.autor).toBe('Gabriel García Márquez')
    expect(book.estudio).toBe('Editorial Sudamericana')
    expect(book.anio).toBe(1967)
    expect(book.totalEpisodios).toBe(471)
    expect(book.sinopsis).toBe('Una de las obras cumbre de la literatura hispanoamericana.')
    // La portada debe forzar HTTPS y remover &edge=curl
    expect(book.portada).toBe('https://books.google.com/books/content?id=test-123')
    expect(book.tipo).toBe('Libro')
  })

  it('debe hacer fallback a Open Library si Google Books no devuelve resultados', async () => {
    const mockEmptyGoogle = { items: [] }
    const mockOpenLib = {
      docs: [
        {
          key: '/works/OL123W',
          title: 'El Principito',
          author_name: ['Antoine de Saint-Exupéry'],
          first_publish_year: 1943,
          cover_i: 98765,
          publisher: ['Reynal & Hitchcock'],
          subject: ['Fantasía', 'Literatura infantil'],
          number_of_pages_median: 96,
        },
      ],
    }

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyGoogle,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenLib,
      } as Response)

    const results = await mediaSearchService.search('El Principito', 'Libro')

    expect(results).toHaveLength(1)
    const book = results[0]
    expect(book.titulo).toBe('El Principito')
    expect(book.autor).toBe('Antoine de Saint-Exupéry')
    expect(book.anio).toBe(1943)
    expect(book.totalEpisodios).toBe(96)
    expect(book.portada).toBe('https://covers.openlibrary.org/b/id/98765-M.jpg')
    expect(book.tipo).toBe('Libro')
  })

  it('debe buscar y mapear correctamente películas desde iTunes Media API', async () => {
    const mockITunesResponse = {
      resultCount: 1,
      results: [
        {
          trackId: 395977931,
          trackName: 'Inception',
          artworkUrl100: 'http://is1-ssl.mzstatic.com/image/thumb/Video/100x100bb.jpg',
          releaseDate: '2010-07-16T07:00:00Z',
          longDescription: 'Dom Cobb es un ladrón hábil que roba secretos corporativos.',
          primaryGenreName: 'Acción y aventura',
          artistName: 'Christopher Nolan',
        },
      ],
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockITunesResponse,
    } as Response)

    const results = await mediaSearchService.search('Inception', 'Película')

    expect(results).toHaveLength(1)
    const movie = results[0]
    expect(movie.titulo).toBe('Inception')
    expect(movie.anio).toBe(2010)
    expect(movie.estudio).toBe('Christopher Nolan')
    expect(movie.generos).toEqual(['Acción y aventura'])
    expect(movie.sinopsis).toBe('Dom Cobb es un ladrón hábil que roba secretos corporativos.')
    // Debe convertir la portada a 600x600 y HTTPS
    expect(movie.portada).toBe('https://is1-ssl.mzstatic.com/image/thumb/Video/600x600bb.jpg')
    expect(movie.tipo).toBe('Película')
  })
})

