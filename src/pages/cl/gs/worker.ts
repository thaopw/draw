import memoizeOne from 'memoize-one'
import { allPossibleGroups } from '@draws/engine'

import getPredicate from 'engine/predicates/uefa/gs'
import Team from 'model/team/GsTeam'
import type { WorkerData } from 'model/types'

const getPredicateMemoized = memoizeOne(getPredicate)

// eslint-disable-next-line no-restricted-globals
addEventListener('message', e => {
  const {
    messageId,
    data: {
      season,
      pots,
      groups,
      selectedTeam,
    },
  } = e.data as WorkerData<Team>

  const predicate = getPredicateMemoized(season)
  const possibleGroups = allPossibleGroups(pots, groups, selectedTeam, predicate)

  postMessage({
    messageId,
    data: {
      possibleGroups,
    },
  })
})