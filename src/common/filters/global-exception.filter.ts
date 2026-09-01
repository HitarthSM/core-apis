import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { extractErrorMessage } from './extract-error-message';

type ErrorBody = {
  statusCode: number;
  message: string;
  errors?: unknown;
  approvalRequestId?: string;
  [key: string]: unknown;
};

const RESERVED_ERROR_KEYS = new Set(['statusCode', 'message', 'errors', 'error']);

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const body = this.toErrorBody(exception);

    if (body.statusCode >= 500) {
      this.logger.error(exception);
    }

    response.status(body.statusCode).json(body);
  }

  private toErrorBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const raw = exception.getResponse();
      const message = extractErrorMessage(raw);
      const errors =
        typeof raw === 'object' && raw !== null && 'errors' in raw
          ? (raw as { errors?: unknown }).errors
          : undefined;

      return {
        statusCode,
        message,
        ...(errors !== undefined ? { errors } : {}),
        ...this.extractExtraFields(raw),
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message.trim() || 'Something went wrong',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong',
    };
  }

  /** Preserve structured fields (e.g. approvalRequestId) alongside the flattened message. */
  private extractExtraFields(raw: string | object): Record<string, unknown> {
    if (typeof raw !== 'object' || raw === null) return {};
    const extras: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (RESERVED_ERROR_KEYS.has(key) || value === undefined) continue;
      extras[key] = value;
    }
    return extras;
  }
}
