import { Injectable } from '@nestjs/common'
import { Repositories } from 'src/helpers/repository'
import { FilmHateoas, Language } from 'src/interface'

@Injectable()
export class FilmService {
  getAllFilmsDetails(userId: string, language: Language): FilmHateoas[] {
    return Repositories.getFilmRepository()
      .getAll()
      .map(({ id }) => this.getFilmDetails(id, userId, language))
  }

  getFilmDetails(id: string, userId: string, language: Language): FilmHateoas {
    const { tmdb_id, release_date, average_vote, vote_count, genres, file_id, ...film } =
      Repositories.getFilmRepository().getById(id)

    const { title, overview } = film[language]
    const { registry, languages } = Repositories.getUserRepository().getById(userId)
    const registered = registry.films.find(film => id === film.id && !film.delete)
    const { text, audio } = languages

    return {
      tmdb_id,
      release_date,
      average_vote,
      vote_count,
      genres,
      title,
      overview,
      time: registered?.time ?? 0,
      collection: film['eng-US'].trailer
        .split('/')
        .slice(2)
        .reverse()
        .slice(1)
        .reverse()
        .concat(film['eng-US'].title)
        .concat(film['fre-FR'].title)
        .reduce(
          (result, current) => (result.includes(current) ? result : [...result, current]),
          []
        ),
      _links: {
        getPoster: { href: `/film/${id}/poster?language=${text}` },
        getBackdrop: { href: `/film/${id}/backdrop` },
        getTrailer: { href: `/film/${id}/trailer?language=${audio}` },
        getFile: { href: `/file/${file_id}?language=${audio}` }
      },
      _actions: {
        registerProgress: {
          href: `/film/${id}/progress`,
          method: 'POST',
          body: undefined
        }
      }
    }
  }

  registerFilmProgress(
    id: string,
    userId: string,
    body: { time: number; delete: boolean | undefined }
  ) {
    const { registry } = Repositories.getUserRepository().getById(userId)

    const film = registry.films.find(film => film.id === id)
    if (film) {
      film.time = body.time
      film.delete = body.delete ?? false
    } else {
      registry.films.push({
        id,
        time: body.time,
        date: Date.now(),
        // Default true so we don't register it unless client wants it
        delete: body.delete ?? true
      })
    }
    Repositories.getUserRepository().save()
  }
}
