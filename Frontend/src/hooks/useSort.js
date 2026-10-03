import { useState } from 'react';

export default function useSort(initialKey = 'name', initialOrder = 'asc') {
  const [sortBy, setSortBy] = useState(initialKey);
  const [order, setOrder] = useState(initialOrder);

  const onSort = (key) => {
    if (key === sortBy) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(key);
      setOrder('asc');
    }
  };

  return { sortBy, order, onSort };
}
