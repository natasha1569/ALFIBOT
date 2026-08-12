export default function AdminResourceTable({
  columns,
  rows,
  rowKey = 'id',
  emptyMessage = 'No existen registros para mostrar.',
}) {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                className="text-center text-secondary py-4"
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[rowKey]}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
