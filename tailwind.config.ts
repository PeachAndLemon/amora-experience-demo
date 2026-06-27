import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '1rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'DM Sans',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif',
  				'Apple Color Emoji',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'Noto Color Emoji'
  			],
  			serif: [
  				'Playfair Display',
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			],
  			mono: [
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			wine: {
  				DEFAULT: 'hsl(var(--wine))',
  				light: 'hsl(var(--wine-light))',
  				dark: 'hsl(var(--wine-dark))'
  			},
  			blush: {
  				DEFAULT: 'hsl(var(--blush))',
  				light: 'hsl(var(--blush-light))',
  				dark: 'hsl(var(--blush-dark))'
  			},
  			cream: {
  				DEFAULT: 'hsl(var(--cream))',
  				dark: 'hsl(var(--cream-dark))'
  			},
  			gold: {
  				DEFAULT: 'hsl(var(--gold))',
  				light: 'hsl(var(--gold-light))',
  				dark: 'hsl(var(--gold-dark))'
  			},
  			coral: {
  				DEFAULT: 'hsl(var(--coral))',
  				light: 'hsl(var(--coral-light))',
  				dark: 'hsl(var(--coral-dark))'
  			},
  			rose: {
  				DEFAULT: 'hsl(var(--rose))',
  				light: 'hsl(var(--rose-light))',
  				dark: 'hsl(var(--rose-dark))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'2xl': '1.5rem',
  			'3xl': '2rem'
  		},
  		boxShadow: {
  			soft: 'var(--shadow-soft)',
  			card: 'var(--shadow-card)',
  			elevated: 'var(--shadow-elevated)',
  			glow: 'var(--shadow-glow)',
  			'glow-gold': 'var(--shadow-glow-gold)',
  			stamp: 'var(--shadow-stamp)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'stamp-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(2) rotate(-10deg)'
  				},
  				'60%': {
  					transform: 'scale(0.9) rotate(2deg)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1) rotate(0deg)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			'pulse-soft': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '0.7'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(30px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			glow: {
  				'0%, 100%': {
  					boxShadow: '0 0 20px hsl(var(--wine) / 0.2)'
  				},
  				'50%': {
  					boxShadow: '0 0 40px hsl(var(--wine) / 0.35)'
  				}
  			},
  			'glow-gold': {
  				'0%, 100%': {
  					boxShadow: '0 0 20px hsl(var(--gold) / 0.25)'
  				},
  				'50%': {
  					boxShadow: '0 0 40px hsl(var(--gold) / 0.4)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'stamp-in': 'stamp-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
  			float: 'float 6s ease-in-out infinite',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  			'slide-up': 'slide-up 0.6s ease-out forwards',
  			'fade-in': 'fade-in 0.4s ease-out forwards',
  			glow: 'glow 2s ease-in-out infinite',
  			'glow-gold': 'glow-gold 2s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
