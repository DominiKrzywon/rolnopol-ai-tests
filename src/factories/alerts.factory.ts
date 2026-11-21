type TodayAlertResponse = {
  success: boolean;
  data: {
    today: {
      alerts: [
        {
          date: string;
          severity: string;
          title: string;
          category: string;
          message: string;
        },
      ];
    };
    upcoming: { alerts: [] };
    history: [];
  };
};

export function todayAlertResponse(message: string): TodayAlertResponse {
  return {
    success: true,
    data: {
      today: {
        alerts: [
          {
            date: '2026-11-15',
            severity: 'low',
            title: 'Controlled test alert',
            category: 'weather',
            message: message,
          },
        ],
      },
      upcoming: { alerts: [] },
      history: [],
    },
  };
}
