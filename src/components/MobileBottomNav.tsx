import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface MobileBottomNavItem {
  path: string
  label: string
  icon: LucideIcon
}

interface MobileBottomNavProps {
  items: MobileBottomNavItem[]
}

export function MobileBottomNav({ items }: MobileBottomNavProps) {
  return (
    <nav className="crm-mobile-dock xl:hidden" aria-label="Mobile navigation">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `crm-mobile-dock__item ${isActive ? 'crm-mobile-dock__item--active' : ''}`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
