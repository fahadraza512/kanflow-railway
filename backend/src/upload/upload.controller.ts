import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(extname(file.originalname).toLowerCase());
        if (mimetype && extName) {
          return cb(null, true);
        }
        cb(new BadRequestException('Invalid file type'), false);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return {
      url: `/uploads/${file.filename}`,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
