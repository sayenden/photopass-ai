import { Country } from './types';

export const COUNTRIES: Country[] = [
  {
    code: 'US',
    name: 'United States',
    photoTypes: [
      {
        name: 'Passport & Visa Photo (2x2 inch)',
        requirements: {
          width_mm: 51,
          height_mm: 51,
          head_height_percent: { min: 50, max: 69 },
          background_color: 'white or off-white',
          notes: [
            'Neutral facial expression with both eyes open.',
            'Face camera directly with full face in view.',
            'No shadows on face or in background.',
            'No glasses.',
            'No head coverings, except for religious reasons.'
          ]
        }
      }
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    photoTypes: [
      {
        name: 'Passport Photo (35x45 mm)',
        requirements: {
          width_mm: 35,
          height_mm: 45,
          head_height_percent: { min: 63, max: 75 },
          background_color: 'light grey or cream',
          notes: [
            'Neutral expression and mouth closed.',
            'Nothing covering the face.',
            'No shadows on the face or behind you.',
            'No red-eye.'
          ]
        }
      }
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    photoTypes: [
      {
        name: 'Passport Photo (50x70 mm)',
        requirements: {
          width_mm: 50,
          height_mm: 70,
          head_height_percent: { min: 44, max: 51 },
          background_color: 'plain white or light-coloured',
          notes: [
            'Neutral facial expression (eyes open and clearly visible, mouth closed).',
            'No smiling or frowning.',
            'Uniform lighting and no shadows, glare or flash reflections.',
            'Face and shoulders centered and squared to the camera.'
          ]
        },
      },
      {
        name: 'Visa Photo (35x45 mm)',
        requirements: {
          width_mm: 35,
          height_mm: 45,
          head_height_percent: { min: 68, max: 78 },
          background_color: 'plain white',
          notes: [
            'Neutral facial expression, mouth closed.',
            'The face must be square to the camera with a neutral expression, neither frowning nor smiling, with the mouth closed.',
            'No shadows on the face or in the background.'
          ]
        },
      }
    ]
  },
  {
    code: 'AU',
    name: 'Australia',
    photoTypes: [
        {
            name: 'Passport Photo (35x45 mm)',
            requirements: {
              width_mm: 35,
              height_mm: 45,
              head_height_percent: { min: 71, max: 80 },
              background_color: 'plain, light coloured background (e.g. white, cream or pale grey)',
              notes: [
                'Good quality, colour, glossy prints, less than six months old.',
                'No shadows on the face or background.',
                'Neutral expression with the mouth closed.',
                'Eyes open, no hair across the eyes.'
              ]
            }
        }
    ]
  },
  {
    code: 'CN',
    name: 'China',
    photoTypes: [
      {
        name: 'Passport Photo (33x48 mm)',
        requirements: {
          width_mm: 33,
          height_mm: 48,
          head_height_percent: { min: 58, max: 75 },
          background_color: 'white',
          notes: [
            'Recent photo taken within 6 months.',
            'Neutral expression, eyes open, mouth closed.',
            'Ears must be visible.',
            'No eyeglasses.'
          ]
        }
      },
      {
        name: 'Visa Photo (33x48 mm)',
        requirements: {
          width_mm: 33,
          height_mm: 48,
          head_height_percent: { min: 58, max: 75 },
          background_color: 'white',
          notes: [
            'The photo must be in color.',
            'Head should be centered.',
            'No jewelry that obstructs the face.',
          ]
        }
      }
    ]
  },
  {
    code: 'IN',
    name: 'India',
    photoTypes: [
      {
        name: 'Passport & Visa Photo (2x2 inch)',
        requirements: {
          width_mm: 51,
          height_mm: 51,
          head_height_percent: { min: 60, max: 70 },
          background_color: 'plain white',
          notes: [
            'Photo should be in color.',
            'Front view, full face, eyes open.',
            'Head should be in the center of the frame.',
            'No shadows on the face or in the background.'
          ]
        }
      }
    ]
  },
  {
    code: 'DE',
    name: 'Germany',
    photoTypes: [
        {
            name: 'Passport & Visa Photo (35x45 mm)',
            requirements: {
                width_mm: 35,
                height_mm: 45,
                head_height_percent: { min: 71, max: 80 },
                background_color: 'light grey',
                notes: [
                    'The face must be evenly illuminated.',
                    'The head must be centered in the photo.',
                    'A neutral facial expression is required.',
                    'The mouth must be closed.'
                ]
            }
        }
    ]
  },
  {
    code: 'JP',
    name: 'Japan',
    photoTypes: [
        {
            name: 'Passport & Visa Photo (35x45 mm)',
            requirements: {
                width_mm: 35,
                height_mm: 45,
                head_height_percent: { min: 71, max: 80 },
                background_color: 'white or light blue',
                notes: [
                    'No shadows on face or background.',
                    'The applicant should be facing forward.',
                    'The photo must have been taken within the last 6 months.',
                    'Plain background with no patterns.'
                ]
            }
        }
    ]
  }
];
