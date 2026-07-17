import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  getHello(): string {
    return 'Hospital Management System API is running!';
  }

  async onModuleInit() {
    try {
      const admins = await this.usersService.findAll('ADMIN');
      if (admins.length === 0) {
        console.log('Database empty. Seeding roles...');

        // Admin
        await this.usersService.create({
          username: 'admin',
          password: 'admin123',
          fullName: 'HMS Admin Manager',
          role: 'ADMIN',
        });

        // Receptionist
        await this.usersService.create({
          username: 'reception',
          password: 'reception123',
          fullName: 'Sarah Receptionist',
          role: 'RECEPTIONIST',
        });

        // MO
        await this.usersService.create({
          username: 'mo',
          password: 'mo123',
          fullName: 'Dr. David MO',
          role: 'MEDICAL_OFFICER',
        });

        // Doctor
        await this.usersService.create({
          username: 'doctor',
          password: 'doctor123',
          fullName: 'Dr. Elizabeth MD',
          role: 'DOCTOR',
        });

        // Lab Technician
        await this.usersService.create({
          username: 'lab',
          password: 'lab123',
          fullName: 'Michael Lab Analyst',
          role: 'LAB_TECHNICIAN',
        });

        // Ultrasound Specialist
        await this.usersService.create({
          username: 'ultrasound',
          password: 'ultrasound123',
          fullName: 'Jessica Sonographer',
          role: 'ULTRASOUND_TECHNICIAN',
        });

        console.log('Database seeding complete. Default credentials loaded.');
      }
    } catch (err) {
      console.error('Failed to run database seed checking:', err);
    }
  }
}
