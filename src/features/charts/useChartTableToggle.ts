'use client';

import { useCallback, useState } from 'react';

export function useChartTableToggle(initial = false) {
  const [tableView, setTableView] = useState(initial);
  const onToggleTable = useCallback(() => setTableView((v) => !v), []);
  return { tableView, onToggleTable, setTableView };
}
