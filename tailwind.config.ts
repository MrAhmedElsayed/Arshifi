import type { Config } from 'tailwindcss'


export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        tajawal: ["Tajawal", 'serif'],
        scheherazade: ["Scheherazade New", 'serif'],
        alkalami: ["Alkalami", 'serif'],
      }
    }
  },
}