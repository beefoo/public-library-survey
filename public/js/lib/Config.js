const Config = {
  filterBy: [
    {
      label: 'Locale type',
      field: 'locale_type',
      type: 'value',
      values: [
        { value: 11, label: 'Large city' },
        { value: 12, label: 'Mid-size city' },
        { value: 13, label: 'Small city' },
        { value: 21, label: 'Large suburb' },
        { value: 22, label: 'Mid-size suburb' },
        { value: 23, label: 'Small suburb' },
        { value: 31, label: 'Town' },
        { value: 32, label: 'Distant town' },
        { value: 33, label: 'Remote town' },
        { value: 41, label: 'Rural' },
        { value: 42, label: 'Distant rural' },
        { value: 43, label: 'Remote rural' },
      ],
    },
    {
      label: 'Region',
      field: 'region',
      type: 'value',
      values: [
        { value: 1, label: 'New England' },
        { value: 2, label: 'Mid East' },
        { value: 3, label: 'Great Lakes' },
        { value: 4, label: 'Plains' },
        { value: 5, label: 'Southeast' },
        { value: 6, label: 'Southwest' },
        { value: 7, label: 'Rocky Mountains' },
        { value: 8, label: 'Far West' },
        { value: 9, label: 'Outlying Areas' },
      ],
    },
    {
      label: 'Operating budget',
      field: 'op_revenue',
      type: 'range',
      values: [
        { minValue: 30000000, label: '$30M+' },
        { minValue: 10000000, maxValue: 30000000, label: '$10M - $30M' },
        { minValue: 5000000, maxValue: 10000000, label: '$5M - $10M' },
        { minValue: 1000000, maxValue: 5000000, label: '$1M - $5M' },
        { minValue: 400000, maxValue: 1000000, label: '$400K - $1M' },
        { minValue: 200000, maxValue: 400000, label: '$200K - $400K' },
        { minValue: 100000, maxValue: 200000, label: '$100K - $200K' },
        { minValue: 50000, maxValue: 100000, label: '$50K - $100K' },
        { minValue: 0, maxValue: 50000, label: 'Below $50K' },
      ],
    },
    {
      label: 'Operating budget per capita',
      field: 'op_revenue_per_capita',
      type: 'range',
      values: [
        { minValue: 500, label: '$500+' },
        { minValue: 250, maxValue: 500, label: '$250 - $500' },
        { minValue: 100, maxValue: 250, label: '$100 - $250' },
        { minValue: 75, maxValue: 100, label: '$75 - $100' },
        { minValue: 50, maxValue: 75, label: '$50 - $75' },
        { minValue: 25, maxValue: 50, label: '$25 - $50' },
        { minValue: 10, maxValue: 25, label: '$10 - $25' },
        { minValue: 0, maxValue: 10, label: 'Under $10' },
      ],
    },
    {
      label: 'Median household income (Census tract)',
      field: 'income',
      type: 'range',
      values: [
        { minValue: 200000, label: '$200K+' },
        { minValue: 150000, maxValue: 200000, label: '$150K - $200K' },
        { minValue: 100000, maxValue: 150000, label: '$100K - $150K' },
        { minValue: 75000, maxValue: 100000, label: '$75K - $100K' },
        { minValue: 50000, maxValue: 75000, label: '$50K - $75K' },
        { minValue: 25000, maxValue: 50000, label: '$25K - $50K' },
        { minValue: 0, maxValue: 25000, label: 'Under $25K' },
      ],
    },
    {
      label: 'Visits per capita',
      field: 'visits_per_capita_norm',
      type: 'perc_range',
      values: [
        { minValue: 80, label: 'Highest 20%' },
        { minValue: 60, maxValue: 80, label: 'Higher 20%' },
        { minValue: 40, maxValue: 60, label: 'Middle 20%' },
        { minValue: 20, maxValue: 40, label: 'Lower 20%' },
        { minValue: 0, maxValue: 20, label: 'Lowest 20%' },
      ],
    },
    {
      label: 'Programs per capita',
      field: 'programs_per_capita_norm',
      type: 'perc_range',
      values: [
        { minValue: 80, label: 'Highest 20%' },
        { minValue: 60, maxValue: 80, label: 'Higher 20%' },
        { minValue: 40, maxValue: 60, label: 'Middle 20%' },
        { minValue: 20, maxValue: 40, label: 'Lower 20%' },
        { minValue: 0, maxValue: 20, label: 'Lowest 20%' },
      ],
    },
    {
      label: 'Attendance per program',
      field: 'attendance_per_program_norm',
      type: 'perc_range',
      values: [
        { minValue: 80, label: 'Highest 20%' },
        { minValue: 60, maxValue: 80, label: 'Higher 20%' },
        { minValue: 40, maxValue: 60, label: 'Middle 20%' },
        { minValue: 20, maxValue: 40, label: 'Lower 20%' },
        { minValue: 0, maxValue: 20, label: 'Lowest 20%' },
      ],
    },
    {
      label: 'Computer sessions per capita',
      field: 'computer_per_capita_norm',
      type: 'perc_range',
      values: [
        { minValue: 80, label: 'Highest 20%' },
        { minValue: 60, maxValue: 80, label: 'Higher 20%' },
        { minValue: 40, maxValue: 60, label: 'Middle 20%' },
        { minValue: 20, maxValue: 40, label: 'Lower 20%' },
        { minValue: 0, maxValue: 20, label: 'Lowest 20%' },
      ],
    },
    {
      label: 'Wifi sessions per capita',
      field: 'wifi_per_capita_norm',
      type: 'perc_range',
      values: [
        { minValue: 80, label: 'Highest 20%' },
        { minValue: 60, maxValue: 80, label: 'Higher 20%' },
        { minValue: 40, maxValue: 60, label: 'Middle 20%' },
        { minValue: 20, maxValue: 40, label: 'Lower 20%' },
        { minValue: 0, maxValue: 20, label: 'Lowest 20%' },
      ],
    },
    {
      label: 'Percent POC or Hispanic',
      field: 'perc_poc_or_hispanic',
      type: 'perc_range',
      values: [
        { minValue: 80, label: 'Highest 20%' },
        { minValue: 60, maxValue: 80, label: 'Higher 20%' },
        { minValue: 40, maxValue: 60, label: 'Middle 20%' },
        { minValue: 20, maxValue: 40, label: 'Lower 20%' },
        { minValue: 0, maxValue: 20, label: 'Lowest 20%' },
      ],
    },
  ],

  sortBy: [
    {
      field: 'name',
      label: 'Name (A-Z)',
      direction: 'asc',
      isalpha: 1,
    },
    {
      field: 'visits_per_capita_norm',
      label: 'Visits per capita (high to low)',
      direction: 'desc',
    },
    {
      field: 'programs_per_capita_norm',
      label: 'Programs per capita (high to low)',
      direction: 'desc',
    },
    {
      field: 'attendance_per_program_norm',
      label: 'Attendance per program (high to low)',
      direction: 'desc',
    },
    {
      field: 'computer_per_capita_norm',
      label: 'Computer sessions per capita (high to low)',
      direction: 'desc',
    },
    {
      field: 'wifi_per_capita_norm',
      label: 'Wifi sessions per capita (high to low)',
      direction: 'desc',
    },
    {
      field: 'op_revenue_per_capita',
      label: 'Op revenue per capita (high to low)',
      direction: 'desc',
    },
    {
      field: 'perc_poc_or_hispanic',
      label: 'Percent POC or Hispanic (high to low)',
      direction: 'desc',
    },
  ],

  colorBy: [
    {
      label: 'Number of people served',
      field: 'pop_lsa',
      type: 'quant',
      minValue: 0,
      pow: 0.33,
    },
    {
      label: 'Visits per capita',
      field: 'visits_per_capita_norm',
      type: 'quant',
      minValue: 0,
    },
    {
      label: 'Operating Revenue',
      field: 'op_revenue',
      type: 'quant',
      minValue: 0,
      pow: 0.3,
    },
    {
      label: 'Operating Revenue per capita',
      field: 'op_revenue_per_capita',
      type: 'quant',
      minValue: 0,
      pow: 0.3,
    },
    {
      label: 'Programs per capita',
      field: 'programs_per_capita_norm',
      type: 'quant',
      minValue: 0,
    },
    {
      label: 'Attendance per program',
      field: 'attendance_per_program',
      type: 'quant',
      minValue: 0,
    },
    {
      label: 'Computer sessions per capita',
      field: 'computer_per_capita_norm',
      type: 'quant',
      minValue: 0,
    },
    {
      label: 'Wifi sessions per capita',
      field: 'wifi_per_capita_norm',
      type: 'quant',
      minValue: 0,
    },
    {
      label: 'Median Household Income <small><em>(Census Tract)</em></small>',
      field: 'income',
      type: 'quant',
      minValue: 0,
    },
    {
      label: 'Percent POC <small><em>(Census Tract)</em></small>',
      field: 'perc_poc',
      type: 'quant',
      minValue: 0,
      maxValue: 100,
    },
    {
      label:
        'Percent Hispanic or Latino <small><em>(Census Tract)</em></small>',
      field: 'perc_hispanic',
      type: 'quant',
      minValue: 0,
      maxValue: 100,
    },
  ],
};

export default Config;