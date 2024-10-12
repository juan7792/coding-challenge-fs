import { z } from 'zod';

export const peopleDto = z.object({
  name: z.string(),
  birthYear: z.string(),
  homeworldName: z.string(),
  homeworldTerrain: z.string()
});

export type PeopleDto = z.infer<typeof peopleDto>;