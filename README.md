# CuravetPvt. Ltd.

Classic, professional static website for Curavet Pet Clinic in Butwal.

## Architecture (MVC for Static Site)

```
/models/          # Data layer
/views/components/ # Reusable HTML components
/controllers/     # Logic & rendering
/css/             # Design system
/js/              # Utilities (icons)
```

## Quick Start

**Serve the static site:**

```bash
npm run serve:static
```

Then open [http://localhost:3000](http://localhost:3000)

## Structure

- **Models**: `clinic.model.js`, `services.model.js`, `testimonials.model.js`, `navigation.model.js`, `why-choose-us.model.js`
- **Views**: Component HTML in `views/components/`
- **Controllers**: `home.controller.js` (data → DOM), `ui.controller.js` (menu, scroll, animations)

## Design System

- **Colors**: Primary Blue `#0D47A1`, Secondary `#1976D2`, White, Light Gray `#F4F6F8`
- **Fonts**: Montserrat (headings), Open Sans (body)
- **Style**: Clean, medical-grade, trustworthy

## Future Ready

Designed to easily add:

- Appointment booking
- Admin dashboard
- WhatsApp integration
- Blog / pet care tips
- Backend API

## Assets

Add `assets/images/hero-pet.jpg` for the hero section image. A placeholder displays when the image is missing.
