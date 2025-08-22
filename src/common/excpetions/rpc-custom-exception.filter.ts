import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';

import { RpcException } from '@nestjs/microservices';

type RpcErrorShape = {
  status: number | string;
  message: string;
};

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const rpcError = exception.getError();

    if (
      typeof rpcError === 'object' &&
      rpcError !== null &&
      'status' in rpcError &&
      'message' in rpcError
    ) {
      const typedError = rpcError as RpcErrorShape;
      const status = isNaN(+typedError.status) ? 400 : +typedError.status;
      return response.status(status).json(typedError);
    }

    response.status(400).json({
      status: 400,
      message: rpcError,
    });
  }
}
