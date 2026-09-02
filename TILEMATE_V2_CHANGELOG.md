# TileMate v2 changes

## Added
- Customer-facing Profile Studio with three visual templates.
- Custom trade type, tagline, bio, services, service area and social links.
- Share profile through Android/Web Share, email, SMS, WhatsApp, Facebook and copied link.
- QR code for the public profile link.
- Print/save-as-PDF profile flyer flow.
- Public profile route that contains only explicitly selected profile fields.
- 28-day online update-feed framework with a manual "Check now" action.
- Versioned update feed JSON and source register.
- Official UK source register for VAT, construction price indices, minimum wage, HSE/CDM and BS 5385.
- Safe persistence merge for older TileMate business settings.
- Delete confirmation for jobs.
- Expanded mobile navigation.

## Deliberate design decisions
- The updater does not blindly overwrite all working merchant prices.
- Statutory data is separated from commercial charge-out rates.
- Material prices can be delivered by a versioned feed once the production feed URL is hosted.
- Public profile links do not expose jobs, customer records or internal notes.

## Current verification
- TypeScript transpile/syntax smoke test passed for all modified TypeScript/TSX files.
- Update-feed JSON and profile encode/decode logic passed a standalone smoke test.
- Full npm build and Android APK compilation could not be completed in this sandbox because the environment could not reach external package/SDK download hosts, and the supplied workspace does not include installed dependencies.
