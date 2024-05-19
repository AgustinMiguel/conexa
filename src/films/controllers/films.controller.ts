import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '../../auth/guards';
import { PaginationDto } from '../../common/dtos';
import { CreateFilmDto, FilmDto } from '../dtos';
import { PaginatedFilmsDto } from '../dtos/paginated-film.dto';
import { FilmsService } from '../services/films.service';

@Controller('films')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createFilmDto: CreateFilmDto): Promise<FilmDto> {
    return this.filmsService.create(createFilmDto);
  }

  @Get()
  async getFilms(
    @Query() getFilmsDto: PaginationDto,
  ): Promise<PaginatedFilmsDto> {
    return this.filmsService.getFilms(getFilmsDto);
  }

  @Get(':id')
  @Roles(Role.USER)
  async getFilmById(@Param('id') id: number): Promise<FilmDto> {
    return this.filmsService.getFilmById(id);
  }
}
