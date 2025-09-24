
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Montserrat', 'Inter', 'sans-serif'],
				mont: ['Montserrat', 'sans-serif'],
				heading: ['Montserrat', 'Poppins', 'sans-serif'],
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
				fem: {
					navy: '#1A1F2C',
					terracotta: '#C84B31',
					gold: '#FFBD59',
					lightgold: '#FFD68A',
					gray: '#F5F5F7',
					darkgray: '#6B7280',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'fade-in': {
					'0%': {
					  opacity: '0',
					  transform: 'translateY(10px)'
					},
					'100%': {
					  opacity: '1',
					  transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
					  opacity: '0',
					  transform: 'translateY(30px)'
					},
					'100%': {
					  opacity: '1',
					  transform: 'translateY(0)'
					}
				},
				'slide-in-left': {
					'0%': {
					  transform: 'translateX(-100%)',
					  opacity: '0'
					},
					'100%': {
					  transform: 'translateX(0)',
					  opacity: '1'
					}
				},
				'slide-in-right': {
					'0%': {
					  transform: 'translateX(100%)',
					  opacity: '0'
					},
					'100%': {
					  transform: 'translateX(0)',
					  opacity: '1'
					}
				},
				'pulse-light': {
					'0%, 100%': {
					  opacity: '1',
					},
					'50%': {
					  opacity: '0.8',
					}
				},
				'slide-in': {
					'0%': {
					  transform: 'translateX(-100%)',
					},
					'100%': {
					  transform: 'translateX(0)',
					}
				},
				'parallax': {
					'0%': {
					  transform: 'translateY(0px)',
					},
					'100%': {
					  transform: 'translateY(-50px)',
					}
				},
				'float': {
					'0%, 100%': {
					  transform: 'translateY(0px)',
					},
					'50%': {
					  transform: 'translateY(-20px)',
					}
				},
				'float-slow': {
					'0%, 100%': {
					  transform: 'translateY(0px) rotate(0deg)',
					},
					'50%': {
					  transform: 'translateY(-15px) rotate(5deg)',
					}
				},
				'float-fast': {
					'0%, 100%': {
					  transform: 'translateY(0px)',
					},
					'50%': {
					  transform: 'translateY(-25px)',
					}
				},
				'gradient-shift': {
					'0%': {
					  'background-position': '0% 50%',
					},
					'50%': {
					  'background-position': '100% 50%',
					},
					'100%': {
					  'background-position': '0% 50%',
					}
				},
				'scale-in': {
					'0%': {
					  opacity: '0',
					  transform: 'scale(0.8)',
					},
					'100%': {
					  opacity: '1',
					  transform: 'scale(1)',
					}
				},
				'scroll-left': {
					'0%': {
						transform: 'translateX(0)',
					},
					'100%': {
						transform: 'translateX(-50%)',
					}
				},
				'scroll-stats': {
					'0%': {
						transform: 'translateX(0)',
					},
					'100%': {
						transform: 'translateX(-33.333%)',
					}
				},
				'shimmer': {
					'0%': {
						'background-position': '-200% 0',
					},
					'100%': {
						'background-position': '200% 0',
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out forwards',
				'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
				'slide-in-left': 'slide-in-left 0.6s ease-out forwards',
				'slide-in-right': 'slide-in-right 0.6s ease-out forwards',
				'pulse-light': 'pulse-light 2s ease-in-out infinite',
				'slide-in': 'slide-in 0.3s ease-out forwards',
				'parallax': 'parallax 20s ease-in-out infinite alternate',
				'float': 'float 6s ease-in-out infinite',
				'float-slow': 'float-slow 8s ease-in-out infinite',
				'float-fast': 'float-fast 4s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 4s ease infinite',
				'scale-in': 'scale-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
				'scroll-left': 'scroll-left 30s linear infinite',
				'scroll-stats': 'scroll-stats 20s linear infinite',
				'shimmer': 'shimmer 2s ease-in-out infinite'
			},
			animationPlayState: {
				'paused': 'paused',
				'running': 'running'
			}
		},
		utilities: {
			'.scrollbar-hide': {
				/* Hide scrollbar for IE, Edge and Firefox */
				'-ms-overflow-style': 'none',
				'scrollbar-width': 'none',
				/* Hide scrollbar for Chrome, Safari and Opera */
				'&::-webkit-scrollbar': {
					display: 'none'
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
