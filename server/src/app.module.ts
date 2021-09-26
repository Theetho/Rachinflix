import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common'
import { AppController } from 'src/app.controller'
import { AppService } from 'src/app.service'
import { PreRequestMiddleware } from './middlewares/prerequest'
import {
  ActorModule,
  BackdropModule,
  CarouselModule,
  EpisodeModule,
  FileModule,
  FilmModule,
  ManagementModule,
  PosterModule,
  SeasonModule,
  SerieModule,
  StoryboardModule,
  SubtitleModule,
  ThumbnailModule,
  TrailerModule,
  UserModule
} from './modules'

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ActorModule,
    CarouselModule,
    EpisodeModule,
    FileModule,
    FilmModule,
    ManagementModule,
    PosterModule,
    SeasonModule,
    SerieModule,
    StoryboardModule,
    SubtitleModule,
    ThumbnailModule,
    TrailerModule,
    UserModule,
    BackdropModule
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PreRequestMiddleware).forRoutes({ path: '/*', method: RequestMethod.ALL })
  }
}
