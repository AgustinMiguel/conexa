import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard, RolesGuard } from "../../auth/guards";
import {
  CreateUserDto,
  GetUsersDto,
  PaginatedUsersDto,
  UpdateUserDto,
  UserDto,
} from "../dtos";
import { UserService } from "../services";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.userService.createUser(createUserDto);
  }

  @Get(":id")
  async getUser(@Param("id") id: string): Promise<UserDto | null> {
    return this.userService.getUser({ id: Number(id) });
  }

  @Get()
  async getUsers(
    @Query() getUsersDto: GetUsersDto
  ): Promise<PaginatedUsersDto> {
    return this.userService.getUsers(getUsersDto);
  }

  @Put(":id")
  async updateUser(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserDto> {
    return this.userService.updateUser({
      where: { id: Number(id) },
      data: updateUserDto,
    });
  }
}
