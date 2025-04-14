export interface MenuItem {
  name: string;
  href?: boolean;
  link?: string;
  icon?: string;
  top?: boolean;

  children?: MenuItem[];
}
export const MenuItems: MenuItem[] = [
  {
    name: 'Users',
    children: [
      {
        name: 'Users List',
        href: false,
        link: 'users',
        icon: 'group',
        top: true,
      },
      {
        name: 'User Permissions',
        href: false,
        link: 'memCheckinHS/K',
        icon: 'apps',
        top: true,
      },

      {
        name: 'User Sessions',
        href: false,
        link: './',
        icon: 'login',
        top: true,
      },
    ],
  },
];
