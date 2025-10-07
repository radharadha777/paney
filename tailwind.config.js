const colors = require('tailwindcss/colors');

function reviactyl(variable) {
  return ({ opacityValue }) =>
    opacityValue !== undefined
      ? `rgb(var(${variable}) / ${opacityValue})`
      : `rgb(var(${variable}))`;
}

const gray = {
    50: reviactyl('--color-50'),
    100: reviactyl('--color-100'),
    200: reviactyl('--color-200'),
    300: reviactyl('--color-300'),
    400: reviactyl('--color-400'),
    500: reviactyl('--color-500'),
    600: reviactyl('--color-600'),
    700: reviactyl('--color-700'),
    800: reviactyl('--color-800'),
    900: reviactyl('--color-900'),
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
                sans: ["var(--font-family)"], 
            },
            colors: {
                black: '#131a20',
                // "primary" and "neutral" are deprecated, prefer the use of "blue" and "gray"
                // in new code.
                primary: colors.blue,
                gray: gray,
                neutral: gray,
                cyan: colors.cyan,
                reviactyl: reviactyl('--color-primary'),
                success: reviactyl('--color-success'),
                danger: reviactyl('--color-danger'),
                secondary: reviactyl('--color-secondary'),
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
            borderRadius: {
                ui: 'var(--radius)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};