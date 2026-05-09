import {
  ChartBarIcon,
  CogIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid,
  ChartBarIcon as ChartSolid,
  FolderIcon as FolderSolid,
  UsersIcon as UsersSolid,
  CogIcon as CogSolid,
  DocumentChartBarIcon as DocumentChartBarSolid
} from '@heroicons/react/24/solid'

export const navItems = [
  { name: 'Dashboard', path: '/', icon: HomeIcon, activeIcon: HomeSolid, badge: null },
  {
    name: 'Product',
    path: '/product',
    icon: ChartBarIcon,
    activeIcon: ChartSolid,
    badge: null
  },
  {
    name: 'Transaction',
    path: '/transaction',
    icon: FolderIcon,
    activeIcon: FolderSolid,
    badge: null
  },
  {
    name: 'Report',
    path: '/report',
    icon: DocumentChartBarIcon,
    activeIcon: DocumentChartBarSolid,
    badge: null
  },
  { name: 'Settings', path: '/settings', icon: CogIcon, activeIcon: CogSolid, badge: null }
]
