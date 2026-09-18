import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // FIX: Add explicit type annotations for request and response objects.
    // This can help TypeScript's language server resolve types correctly in complex setups.
    // Using generics on getResponse/getRequest is the recommended NestJS approach.
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';
        
    let message: string | object;
    if (typeof errorResponse === 'string') {
        message = errorResponse;
    } else if (typeof errorResponse === 'object' && errorResponse !== null && 'message' in errorResponse) {
        message = (errorResponse as any).message;
    } else {
        message = 'An unexpected error occurred';
    }


    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}