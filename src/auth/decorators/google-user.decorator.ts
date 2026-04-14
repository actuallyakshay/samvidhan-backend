import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GoogleUser = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
   return ctx.switchToHttp().getRequest().googleUser;
});
