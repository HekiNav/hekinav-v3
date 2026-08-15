# Hekinav v3

The third generation of the HekiNav routing UI. This version has a new look, more configurability and less bugs. This project is built with cloudflare vinext.

View the production version at [routing.hekinav.dev](https://routing.hekinav.dev/)

## Usage

When running, it is recommended to update /public/map_style.json and /public/map_style_hsl.json to use your own API keys for tiles and your own object storage for sprites. My keys will not work on sites other than mine.

### Development

1. Create a .dev.vars file based on .dev.vars.template

2. Install dependencies: npm install

3. Start dev server: npm run dev:vinext

4. Open http://localhost:3001

### Production

1. Update secrets for each secret in .dev.vars: npx wrangler secret put <SECRET_NAME>

2. Build: npm run build:vinext

3. Preview: npm run start:vinext

4. Deploy to Cloudflare Workers: npm run deploy:vinext