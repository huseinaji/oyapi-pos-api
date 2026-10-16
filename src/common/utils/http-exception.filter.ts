import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private logger: Logger
  ) { }

  catch(exception: unknown, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const response =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
          statusCode: status,
          message: 'Internal server error',
        };

    const error =
      exception instanceof Error
        ? exception
        : new Error(String(exception));

    this.logger.error({
      message: 'HTTP request failed',
      method: request.method,
      url: request.url,
      statusCode: status,
      response:
        typeof response === 'string'
          ? response
          : JSON.stringify(response),
      errorMessage: error.message,
      stack: error.stack,
    });

    if (!reply.sent) {
      reply.status(status).send(response);
    }
  }
}
