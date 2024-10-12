import { Module } from '@nestjs/common';
import { PeopleServerController } from './people-server.controller';
import { PeopleServerService } from './people-server.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [PeopleServerController],
  providers: [PeopleServerService],
  imports: [HttpModule]
})
export class PeopleServerModule {}
