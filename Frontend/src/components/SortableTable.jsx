// columns: [{ key, label, sortable?, render?(row) }]
export default function SortableTable({
  columns,
  rows,
  sortBy,
  order,
  onSort,
  onRowClick,
  emptyText = 'No records found',
}) {
  const arrow = (key) => (sortBy === key ? (order === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={c.sortable ? 'sortable' : ''}
                onClick={() => c.sortable && onSort(c.key)}
              >
                {c.label}
                {c.sortable && arrow(c.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="empty">
                {emptyText}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? 'clickable' : ''}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key] ?? '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
