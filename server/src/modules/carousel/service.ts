import { Injectable } from '@nestjs/common'
import { shuffle } from 'src/helpers/table'
import { FilmHateoas, Language, SerieHateoas } from 'src/interface'
import { FilmService, SerieService } from '..'

@Injectable()
export class CarouselService {
  private readonly filmService = new FilmService()
  private readonly serieService = new SerieService()

  constructor() {}

  getCarousels(userId: string, language: Language): Array<FilmHateoas | SerieHateoas> {
    const films = this.filmService.getAllFilmsDetails(userId, language)
    const series = this.serieService.getAllSeriesDetails(userId, language)

    return shuffle([...films, ...series])
  }
}
