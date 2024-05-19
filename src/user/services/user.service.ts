import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { plainToInstance } from "class-transformer";
import { PrismaService } from "../../common/prisma.service";
import { GetUsersDto, PaginatedUsersDto } from "../dtos";
import { CreateUserDto } from "../dtos/create-user.dto";

import { UpdateUserDto } from "../dtos/update-user.dto";
import { UserDto } from "../dtos/user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto): Promise<UserDto> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userData: Prisma.UserCreateInput = {
      ...data,
      password: hashedPassword,
    };
    try {
      const user = await this.prisma.user.create({
        data: userData,
      });
      return plainToInstance(UserDto, user);
    } catch (error) {
      throw new BadRequestException("Something went wrong with the request");
    }
  }

  async getUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<UserDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: userWhereUniqueInput,
    });
    return plainToInstance(UserDto, user);
  }

  async getUsers(params: GetUsersDto): Promise<PaginatedUsersDto> {
    const { skip = 0, take = 10, name, email, role } = params;

    const where: Prisma.UserWhereInput = {
      ...(name && { name: { contains: name } }),
      ...(email && { email: { contains: email } }),
      ...(role && { role }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
      }),
      this.prisma.user.count({ where }),
    ]);

    const userDtos = plainToInstance(UserDto, users);

    return {
      users: userDtos,
      total,
      skip,
      take,
    };
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: UpdateUserDto;
  }): Promise<UserDto> {
    const { where, data } = params;
    await this.prisma.user.findUniqueOrThrow({
      where,
    });
    const user = await this.prisma.user.update({
      data,
      where,
    });
    return plainToInstance(UserDto, user);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
