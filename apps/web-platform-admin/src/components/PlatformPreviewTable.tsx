type Column = { key: string; label: string };

type Props = {
  columns: Column[];
  rows: Record<string, string>[];
  emptyLabel: string;
};

export function PlatformPreviewTable({ columns, rows, emptyLabel }: Props) {
  if (rows.length === 0) {
    return (
      <p style={{ color: '#64748b', marginTop: '1.25rem' }} data-testid="platform-table-empty">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div style={{ marginTop: '1.25rem', overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
            {columns.map((c) => (
              <th key={c.key} style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              {columns.map((c) => (
                <td key={c.key} style={{ padding: '0.5rem 0.75rem', color: '#0f172a' }}>
                  {row[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
