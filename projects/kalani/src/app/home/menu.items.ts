export interface MenuItem {
    name: string;
    href?: boolean;
    link?: string;
    icon?: string;
    top?: boolean;
  
    children?: MenuItem[];
  }
  export const MenuItems: MenuItem[] = [
    // {
    //   name: 'Members',
    //   href: false,
    //   link: 'members',
    //   icon: 'group',
    //   top: true,
    // },
    {
      name: 'Kalani',
      children: [
        {
          name: 'Members',
          href: false,
          link: 'members',
          icon: 'group',
          top: true,
        },
        {
          name: 'Members Checkin Dash',
          href: false,
          link: 'memCheckinHS/K',
          icon: 'check',
          top: true,
        },
        // {
        //   name: 'Members Checkin Dash',
        //   href: false,
        //   link: 'memDash',
        //   icon: 'dashboard',
        //   top: true,
        // },

        {
          name: 'Acupuncture/Massage Appt',
          href: false,
          link: 'accumassage',
          icon: 'spa',
          top: true,
        },
        {
          name: 'Lunch Reservations',
          href: false,
          link: 'lunch',
          icon: 'restaurant',
          top: true,
        },
      ],
    },
    {
      name: 'Rides',
      children: [
        {
          name: 'Trips',
          href: false,
          link: 'trips',
          icon: 'directions_bus_filled',
          top: true,
        },
        {
          name: 'Schedule Ride',
          href: false,
          link: 'scheduleRide',
          icon: 'edit_calendar',
          top: true,
        },
        {
          name: 'Dasboard',
          href: false,
          link: 'tripdash',
          icon: 'dashboard',
          top: true,
        },
        {
          name: 'Vehicle Odometer Tracker',
          href: false,
          link: 'VMTrackDash',
          icon: 'network_check',
          top: true,
        },
      ],
    },
    {
      name: 'Health Spring',
      children: [
        {
          name: 'Members Checkin Dash',
          href: false,
          link: 'memCheckin/H',
          icon: 'check',
          top: true,
        },
        {
          name: 'Schedule Appt',
          href: false,
          link: 'ptappt',
          icon: 'edit_calendar',
          top: true,
        },
        {
          name: 'Appt Dasboard',
          href: false,
          link: 'ptapptdash',
          icon: 'dashboard',
          top: true,
        },
      ],
    },
    // {
    //   name: 'Games',
    //   children: [
    //     {
    //       name: 'Poker',
    //       href: false,
    //       link: 'Games/Poker',
    //       icon: 'casino',
    //       top: true,
    //     },
    //   ],
    // },
    {
      name: 'SMS',
      children: [
        {
          name: 'Quick Send',
          href: false,
          link: 'smsQsend',
          icon: 'sms',
          top: true,
        },
      ],
    },
  ];

  export const menuBar = [
    {
      name: 'My Trips',
      href: false,
      link: 'trips',
      icon: 'directions_bus_filled',
      top: true,
    },
    {
      name: 'Dasboard',
      href: false,
      link: 'dashboard',
      icon: 'dashboard',
      top: true,
    },
    {
      name: 'Members',
      href: false,
      link: 'members',
      icon: 'group',
      top: true,
    },
    {
      name: 'Assign',
      href: false,
      link: 'assign',
      icon: 'dashboard',
      top: true,
    },
  ];