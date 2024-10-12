import { peopleDto } from './../../../../../shared/src/lib/peopleDto';
import { Controller, Get } from '@nestjs/common';
import { PeopleServerService } from './people-server.service';
import { z } from 'zod';

@Controller('people-server')
export class PeopleServerController {

    constructor(private peopleServerService: PeopleServerService) {}

    @Get()
    getPeopleServer(): Promise<z.infer<typeof peopleDto>[]> {
        return this.peopleServerService.getPeopleServer();
    }
}