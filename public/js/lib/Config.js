const Config = {
  filterBy: [
    {
      label: 'Locale type',
      field: 'locale_type',
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
  ],
  colorBy: [
    {
      label: 'Population served',
      field: 'pop_lsa',
      type: 'quant',
      minValue: 0,
      pow: 0.33,
    },
    {
      label: 'Operating Revenue',
      field: 'op_revenue',
      type: 'quant',
      minValue: 0,
      prepend: '$',
      pow: 0.3,
    },
    {
      label: 'Onsite program attendance',
      field: 'onsite_program_attendance',
      type: 'quant',
      minValue: 0,
      pow: 0.33,
    },
    {
      label: 'Wireless sessions',
      field: 'wireless_sessions',
      type: 'quant',
      minValue: 0,
      pow: 0.25,
    },
    {
      label: 'Median Household Income <small><em>(Census Tract)</em></small>',
      field: 'income',
      type: 'quant',
      minValue: 0,
      prepend: '$',
    },
    {
      label: 'Percent POC <small><em>(Census Tract)</em></small>',
      field: 'perc_poc',
      type: 'quant',
      minValue: 0,
      maxValue: 100,
      append: '%',
    },
    {
      label:
        'Percent Hispanic or Latino <small><em>(Census Tract)</em></small>',
      field: 'perc_hispanic',
      type: 'quant',
      minValue: 0,
      maxValue: 100,
      append: '%',
    },
  ],
};

export default Config;
