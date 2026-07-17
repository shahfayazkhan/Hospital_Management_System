import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userModel.findByPk(id, {
      attributes: { exclude: ['passwordHash'] },
    });
  }

  async create(createUserDto: any): Promise<User> {
    const existing = await this.findByUsername(createUserDto.username);
    if (existing) {
      throw new BadRequestException('Username already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = new this.userModel({
      username: createUserDto.username,
      passwordHash,
      fullName: createUserDto.fullName,
      role: createUserDto.role,
      isActive: createUserDto.isActive ?? true,
    } as any);

    return user.save();
  }

  async findAll(role?: string): Promise<User[]> {
    const where: any = {};
    if (role) {
      where.role = role;
    }
    return this.userModel.findAll({
      where,
      attributes: { exclude: ['passwordHash'] },
    });
  }

  async update(id: number, updateUserDto: any): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
    }

    if (updateUserDto.fullName) user.fullName = updateUserDto.fullName;
    if (updateUserDto.role) user.role = updateUserDto.role;
    if (updateUserDto.isActive !== undefined) user.isActive = updateUserDto.isActive;

    await user.save();
    return (await this.findById(id))!;
  }

  async delete(id: number): Promise<void> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    await user.destroy();
  }
}
