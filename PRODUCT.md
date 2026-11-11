# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Drivers** at a participating location: find free slots, look up their car by licence plate and pay, book a slot in advance, and view their history and receipts. They use phones and computers about equally (on site and when booking from home).
- **Exit kiosk**: a touch screen at the car park exit (`/kiosk/[lot]/[exit]`). It scans the plate, shows the fee, takes ThaiQR payment and opens the gate.
- **Admins**: a Super Admin (all locations, plus the layout editor, lots and roles) and per-location admins (dashboard, door control, slots, finance, activity).

## Product Purpose

Easy Parking is one central parking system that many locations share (a mall, a condo, and so on). Drivers pick a location, or scan the QR code on a pillar, to get that location's live availability, payment, booking and history. Success means a driver can see free space, or pay and leave, within seconds.

## Positioning

One web system serves many car parks. Each location gets its own route (`/[lot]`) with its own floors, rates and exits, and the driver, kiosk and admin surfaces share the same data.

## Operating Context

- Coursework: Front End (CSI201). Everything uses mock data from `data/*.json`, and edits are saved in localStorage.
- Thai is the primary language (`lang="th"`). Licence plates are Thai format (e.g. กข 1234 with a province).
- Payment is ThaiQR (mocked). Rates: free minutes, a per-hour rate (a part hour counts as one hour), a daily cap and a booking fee.

## Capabilities and Constraints

- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (`@theme` tokens in `app/globals.css`), Chart.js.
- Routes and features are listed in README.md. All functions, routes and data must keep working.
- Demo credentials: admin/1234, mall/1234, condo/1234.

## Brand Commitments

- The name "Easy Parking" is the only fixed brand element. The palette, fonts and look may all be replaced (confirmed by the user, 2026-11-09).

## Evidence on Hand

- Two sample locations: อีซี่ มอลล์ พระราม 9 and กรีน คอนโด ลาดพร้าว (`data/lots.json`).
- There is no logo, photography, testimonials or usage figures. Do not make any up.

## Product Principles

1. Availability and the amount owed come first. They are the two numbers drivers come for.
2. Plates and money are the most important content and must be legible at a glance.
3. The driver, kiosk and admin surfaces share one visual language, tuned to each surface's mode.
4. Thai text has to read comfortably: generous line height and no cramped tracking.
