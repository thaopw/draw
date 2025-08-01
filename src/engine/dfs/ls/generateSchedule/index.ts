import { keyBy, uniq } from 'lodash';

import { type UefaCountry } from '#model/types';
import type Tournament from '#model/Tournament';

import getFirstSuitableMatchday from './getFirstSuitableMatchday.wrapper';
import splitMatchdaysIntoDays from './splitMatchdaysIntoDays';

interface Team {
  readonly id: string;
  readonly name: string;
  readonly country: UefaCountry;
}

export default async function generateSchedule<T extends Team>({
  season,
  tournament,
  matchdaySize,
  tvPairings,
  allGames: allGamesWithIds,
  getNumWorkers,
  signal,
}: {
  season: number;
  tournament: Tournament;
  matchdaySize: number;
  tvPairings: readonly (readonly [T, T])[];
  allGames: readonly (readonly [T, T])[];
  currentSchedule: readonly (readonly (readonly (readonly [T, T])[])[])[];
  getNumWorkers: () => number;
  signal?: AbortSignal;
}) {
  const allNonUniqueTeams = allGamesWithIds.flat();
  const teamById = keyBy(allNonUniqueTeams, team => team.id);
  const allTeamIds = uniq(allNonUniqueTeams.map(team => team.id));
  const allTeams = allTeamIds.map(
    id => allNonUniqueTeams.find(item => item.id === id)!,
  );
  const indexByTeamId = new Map(allTeamIds.map((id, i) => [id, i] as const));

  const allGamesUnordered: (readonly [number, number])[] = [];
  for (const [h, a] of allGamesWithIds) {
    const homeIndex = indexByTeamId.get(h.id)!;
    const awayIndex = indexByTeamId.get(a.id)!;
    allGamesUnordered.push([homeIndex, awayIndex]);
  }

  // const allGames = orderBy(allGamesUnordered, [
  //   m => Math.min(...m),
  //   m => Math.max(...m),
  // ]);

  const tvPairingsNumbers = tvPairings.map(
    p => [indexByTeamId.get(p[0].id)!, indexByTeamId.get(p[1].id)!] as const,
  );

  const result = await getFirstSuitableMatchday({
    season,
    teams: allTeams,
    matchdaySize,
    allGames: allGamesUnordered,
    getNumWorkers,
    signal,
  });

  const matchdays = splitMatchdaysIntoDays({
    matchdays: result,
    tournament,
    matchdaySize,
    teams: allTeams,
    tvPairings: tvPairingsNumbers,
  });

  const solutionSchedule = matchdays.map(md =>
    md.map(day =>
      day.map(([h, a]) => {
        const ht = teamById[allTeamIds[h]];
        const at = teamById[allTeamIds[a]];
        return allGamesWithIds.find(
          mi => mi[0].id === ht.id && mi[1].id === at.id,
        )!;
      }),
    ),
  );

  return {
    solutionSchedule,
  };
}
