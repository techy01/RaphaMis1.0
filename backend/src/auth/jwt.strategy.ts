import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'a-very-strong-and-long-secret-key-for-jwt'),
    });
  }

  async validate(payload: any) {
    // The payload is the decoded JWT token
    // The return value is attached to the request object as req.user
    return { id: payload.sub, name: payload.username, role: payload.role, email: payload.email };
  }
}
