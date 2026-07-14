import { memo } from 'react'

type FilterChipProps = { label: string; count: number; active: boolean; onClick: () => void }

const FilterChip = memo(function FilterChip({ label, count, active, onClick }: FilterChipProps) {
  return <button type="button" className={`filter-chip${active ? ' filter-chip--active' : ''}`} onClick={onClick} aria-pressed={active}>{label} <span className="filter-chip__count">{count}</span></button>
})

export default FilterChip
