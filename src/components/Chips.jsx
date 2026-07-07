export function PriorityChip({ value }) {
  return <span className={`chip priority-${value?.toLowerCase()}`}>{label(value)}</span>;
}

export function StatusChip({ value }) {
  return <span className={`chip status-${value?.toLowerCase()}`}>{label(value)}</span>;
}

export function BugTypeChip({ value }) {
  return <span className={`chip type-${value?.toLowerCase()}`}>{label(value)}</span>;
}

export function label(value) {
  return value ? value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unassigned';
}
