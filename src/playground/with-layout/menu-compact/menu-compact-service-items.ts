export const MENU_COMPACT_ITEMS = [
  {
    title: 'Home',
    link: '/example/menu-compact/menu-compact-service.component',
    icon: 'home-outline',
    home: true,
    level: 0,
  },
  {
    title: 'User account',
    link: '/example/menu-compact/menu-compact-service.component/2',
    icon: 'person-outline',
    level: 0,
  },
  {
    title: 'Shop',
    icon: 'shopping-cart-outline',
    level: 0,
    expanded: true,
    children: [
      {
        title: 'Services',
        link: '/example/menu-compact/menu-compact-service.component/3/1',
        icon: 'settings-outline',
        level: 1,
      },
      {
        title: 'Hardware',
        link: '/example/menu-compact/menu-compact-service.component/3/2',
        icon: 'bulb-outline',
        level: 1,
      },
      {
        title: 'Software',
        icon: 'grid-outline',
        expanded: true,
        level: 1,
        children: [
          {
            title: 'Open Source',
            link: '/example/menu-compact/menu-compact-service.component/3/3/1',
            icon: 'grid-outline',
            level: 2,
          },
          {
            title: 'Commercial',
            link: '/example/menu-compact/menu-compact-service.component/3/3/2',
            icon: 'grid-outline',
            queryParams: { param: 2 },
            level: 2,
            fragment: 'fragment',
          },
        ],
      },
    ],
  },
];
