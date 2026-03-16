import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract message from exception
    let message = 'Internal server error';
    let details = null;
    
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        details = (exceptionResponse as any).details || (exceptionResponse as any).error;
      } else {
        message = exception.message;
      }
    } else {
      // For non-HTTP exceptions, include more details
      message = exception.message || 'Internal server error';
      details = exception.detail || exception.stack?.split('\n')[0];
      
      // Special handling for PayloadTooLargeError
      if (exception.name === 'PayloadTooLargeError') {
        message = 'File or data is too large. Please use a smaller image (max 10MB).';
      }
      
      // Log the full error for debugging
      console.error('Unhandled exception:', {
        message: exception.message,
        name: exception.name,
        stack: exception.stack,
        detail: exception.detail,
      });
    }

    response.status(status).json({
      message,
      code: exception.code || status,
      status,
      details: details || exception.response?.message || exception.details,
      success: false,
    });
  }
}
