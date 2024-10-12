import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map, firstValueFrom } from 'rxjs';
import { peopleDto } from 'shared/src/lib/peopleDto';
import { z } from 'zod';

@Injectable()
export class PeopleServerService {
    private url = 'https://www.swapi.tech/api/people/';
    totalRecords: number = 0;
    people: z.infer<typeof peopleDto>[] = [];

    constructor(private http: HttpService) {}

    getData(url: string) {
        return this.http.get(url).pipe(map(response => response.data));
    }

    // We declare it async to set totalRecords
    async setTotalRecords() {
        const data = await firstValueFrom(this.getData(this.url));
        this.totalRecords = data.total_records;
    }

    async getHomeworldData(url: string) {
        const data = await firstValueFrom(this.getData(url));
        return {
            name: data.result.properties.name,
            terrain: data.result.properties.terrain
        };
    }

    async getPeopleServer(): Promise<z.infer<typeof peopleDto>[]> {
        // Set records to know how many objects we are retrieving
        await this.setTotalRecords();

        const batchSize = 10;

        for (let i = 1; i <= this.totalRecords; i += batchSize) {
            const batch = Array.from({ length: batchSize }, (_, index) => i + index)
                .filter(id => id <= this.totalRecords);

            const promises = batch.map(async id => {
                try {
                    const personData = await firstValueFrom(this.getData(this.url + id));
                    const properties = personData.result.properties;
                    const homeworldData = await this.getHomeworldData(properties.homeworld);

                    const parsedPerson = peopleDto.safeParse({
                        name: properties.name,
                        birthYear: properties.birth_year,
                        homeworldName: homeworldData.name,
                        homeworldTerrain: homeworldData.terrain
                    });

                    if (parsedPerson.success) {
                        return parsedPerson.data;
                    } else {
                        console.error(`Error parsing person ${id}:`, parsedPerson.error);
                        return null;
                    }
                } catch (error) {
                    console.error(`Error fetching person ${id} or their homeworld:`, error);
                    return null;
                }
            });

            const results = await Promise.all(promises);
            this.people.push(...results.filter(
                (result): result is z.infer<typeof peopleDto> => result !== null)); // Filter out null values

            // Delay between batches to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return this.people;
    }
}