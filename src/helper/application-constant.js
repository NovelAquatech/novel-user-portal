export const APP_CONST = {
  BASE_URL: `${import.meta.env.VITE_LOGIN_API_URL}/workflows`,
  API_VERSION: '2016-10-01',
  SP: '/triggers/When_a_HTTP_request_is_received/run',
  SV: '1.0',
  default_parameter: { label: 'Temperature', value: 'temperature' },
  default_parameter_Seely: { label: 'Current', value: 'current' },
  farmer_companies: ['JoeFarm', 'FieldSolutions'],
  disable_occupant_survey: ['JoeFarm', 'FieldSolutions', 'SeelyEnergyMonitor'],
  enable_valve_setting_companies: ['JoeFarm', 'FieldSolutions', 'UNSW'],
  weatherStations: ['FieldSolutions'],
  testingUsers: ['DeepTesting'],
  kolSensors1: ['$kolSensors1'],
  rainfallKey: 'rainfall_total',
  overAllPeoplePresentDevEUIKey: 'overall_people_present',
  overAllPeoplePresentDevNameKey: 'Over All People Present',
  googleDocLinkSeely:
    'https://docs.google.com/spreadsheets/d/1AorkoDXY2A3Zmwb_c5MYGlUrCyeKKZ8mig_Fm8nA6Xw/edit?resourcekey=&gid=763428259#gid=763428259',
  googleDocLinkKolSensors1:
    'https://docs.google.com/spreadsheets/d/1bFJOyjcmwysD6fxxCa438xQ0eeAIur6VfvDLcT9-slA/edit?gid=1676304693#gid=1676304693',
  googleDocLinkUNSW:
    'https://docs.google.com/spreadsheets/d/1iDQS6LsF_0cuHlBQLRr66XqHttF_cOSblZaF-eoLsXU/edit?gid=1544567255#gid=1544567255',
  googleDocLinkUNSW2:
    'https://docs.google.com/spreadsheets/d/1sivvPKDmVESEJv35AO0IQnwGhzbBLeFm3E5jFerOyBE/edit?gid=655139925#gid=655139925',
  googleFormLinkSeely:
    'https://docs.google.com/forms/d/e/1FAIpQLScUCbXTtP3vsc2gbzsGophv3fS3GdFOCzJXpoZGXc1IEIvHww/viewform',
  googleFormLinkUNSW:
    'https://docs.google.com/forms/d/e/1FAIpQLSciDyVG73mhx7poQv12nMx4FFpg7EhOu48a5-iYPyMpr5jXlA/viewform',
  googleFormLinkUNSW2:
    'https://docs.google.com/forms/d/e/1FAIpQLSdfSGjVVE2Exd02dp-_fC5TY4iTBNnWOfW3L8aHf8QPjCkXdg/viewform?usp=header',
  googleFormLinkKolSensors1:
    'https://docs.google.com/forms/d/e/1FAIpQLSf_UNM9b5l934SLzuOf_PJaq_CvlIm-TG6Nkhz__7Bim506YQ/viewform',

  alert_advisories_responsive_parameter: {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 6,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1500 },
      items: 8,
    },
    tablet: {
      breakpoint: { max: 1500, min: 750 },
      items: 4,
    },
    mobile: {
      breakpoint: { max: 750, min: 0 },
      items: 2,
    },
  },
  avg_device_data_responsive_parameter: {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  },
  default_parameter: { label: 'Temperature', value: 'temperature' },
  default_layout: {
    height: 600,
    font: {
      family: '"Open Sans", verdana, arial, sans-serif',
      size: 10,
      color: '#444',
    },
    margin: {
      l: 0,
      r: 0,
      b: 10,
      t: 50,
    },
    xaxis: {
      automargin: true,
      title: {
        text: 'Datetime',
      },
    },
    yaxis: {
      title: {
        text: '',
        font: { size: 10 },
      },
    },
    title: '', // Remove the default title here
    legend: {
      y: 0,
      orientation: 'h',
      yanchor: 'bottom',
      xanchor: 'center',
      yref: 'container',
      x: 0.5,
      font: { size: 12 },
      bgcolor: '#E2E2E2',
      bordercolor: '#FFFFFF',
      borderwidth: 2,
      itemwidth: 30,
    },
  },
  CREATE_MACHINE_NAME_MIN: 5,
  CREATE_MACHINE_NAME_MAX: 25,

  machine_powerFactor_data_responsive: {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  },
};
