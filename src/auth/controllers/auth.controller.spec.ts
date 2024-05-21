import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { LoginDto } from "../dtos";
import { AuthService } from "../services/auth.service";
import { AuthController } from "./auth.controller";

const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
};

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should return access token if credentials are valid", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };
      const user = {
        id: 1,
        email: "test@example.com",
        role: "user",
      };
      const accessToken = { access_token: "access_token" };

      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(accessToken);

      const result = await controller.login(loginDto);

      expect(result).toEqual(accessToken);
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
      expect(authService.login).toHaveBeenCalledWith(user);
    });

    it("should throw UnauthorizedException if credentials are invalid", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
    });
  });
});
