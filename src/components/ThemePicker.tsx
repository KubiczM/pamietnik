import { THEMES, type ThemeId, type Theme } from '../hooks/useTheme'

interface Props {
  current: ThemeId
  onChange: (id: ThemeId) => void
}

export function ThemePicker({ current, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      {THEMES.map(theme => (
        <ThemeButton
          key={theme.id}
          theme={theme}
          active={current === theme.id}
          onClick={() => onChange(theme.id)}
        />
      ))}
    </div>
  )
}

function ThemeButton({ theme, active, onClick }: { theme: Theme; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={theme.name}
      className={`relative w-7 h-7 rounded-full transition-all duration-200 ${
        active ? 'scale-110 ring-2 ring-offset-2 ring-white shadow-md' : 'hover:scale-105 opacity-70 hover:opacity-100'
      }`}
      style={{
        background: `linear-gradient(135deg, ${theme.gradFrom}, ${theme.gradTo})`,
        boxShadow: active ? `0 2px 8px ${theme.gradFrom}88` : undefined,
      }}
    >
      {active && (
        <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
          ✓
        </span>
      )}
    </button>
  )
}
