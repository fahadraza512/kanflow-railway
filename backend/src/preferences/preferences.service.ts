import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Preference } from './entities/preference.entity';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(Preference)
    private preferenceRepository: Repository<Preference>,
  ) {}

  async getOrCreate(userId: string) {
    let preference = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preference) {
      preference = this.preferenceRepository.create({ userId });
      await this.preferenceRepository.save(preference);
    }

    return preference;
  }

  async update(userId: string, updatePreferenceDto: UpdatePreferenceDto) {
    const preference = await this.getOrCreate(userId);

    Object.assign(preference, updatePreferenceDto);
    return this.preferenceRepository.save(preference);
  }

  async reset(userId: string) {
    const preference = await this.getOrCreate(userId);

    // Reset to defaults
    preference.theme = 'light';
    preference.language = 'en';
    preference.emailNotifications = true;
    preference.pushNotifications = true;
    preference.emailAssignments = true;
    preference.emailMentions = true;
    preference.emailComments = true;
    preference.emailDeadlines = true;
    preference.emailPaymentAlerts = true;
    preference.timezone = 'UTC';
    preference.dateFormat = 'MM/DD/YYYY';
    preference.timeFormat = '12h';
    preference.weekStart = 'monday';
    preference.customSettings = null;

    await this.preferenceRepository.save(preference);
    return { message: 'Preferences reset to defaults' };
  }
}
