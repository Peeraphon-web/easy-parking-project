---
name: Easy Parking
description: One parking system for many sites, painted like the parking deck.
colors:
  asphalt: "#26282c"
  asphalt-deep: "#1a1b1e"
  asphalt-2: "#34373c"
  asphalt-3: "#4a4e55"
  paint: "#f2c230"
  paint-hi: "#f7d457"
  paint-ink: "#7a5a00"
  paint-soft: "#fbefc4"
  ink: "#1e2024"
  muted: "#595d65"
  line: "#e1e2dd"
  surface: "#f3f3f0"
  panel: "#ffffff"
  ok: "#1f7a45"
  warn: "#9a5b00"
  bad: "#b83227"
  ok-lt: "#86d9a6"
  bad-lt: "#ff9e92"
  lvl-a: "#2f6db5"
  lvl-b: "#c2521c"
  lvl-c: "#2c7a4b"
  lvl-d: "#6b4bb8"
typography:
  display:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 700
    lineHeight: 1
  headline:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
  figure:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
    fontFeature: "tnum"
  body:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.65
  bay-code:
    fontFamily: "Chakra Petch, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
rounded:
  bay: "3px"
  control: "10px"
  panel: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  panel: "20px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.paint}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.paint-hi}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-danger:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.bad}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  button-ghost-dark:
    backgroundColor: "{colors.asphalt}"
    textColor: "{colors.panel}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  input-field:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "48px"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel}"
  deck-band:
    backgroundColor: "{colors.asphalt}"
    textColor: "{colors.panel}"
    rounded: "{rounded.panel}"
    padding: "32px"
  nav-item:
    backgroundColor: "{colors.asphalt}"
    textColor: "{colors.panel}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.paint}"
    textColor: "{colors.ink}"
  floor-badge-md:
    textColor: "{colors.panel}"
    typography: "{typography.title}"
    rounded: "{rounded.control}"
    size: "44px"
  floor-map:
    backgroundColor: "{colors.asphalt}"
    rounded: "{rounded.panel}"
    padding: "16px"
  bay-selected:
    backgroundColor: "{colors.paint}"
    textColor: "{colors.ink}"
    typography: "{typography.bay-code}"
  bay-busy:
    backgroundColor: "{colors.asphalt-3}"
    textColor: "{colors.panel}"
    typography: "{typography.bay-code}"
  plate-md:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "4px"
    padding: "2px 12px"
  stat:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.figure}"
    padding: "16px 20px"
---

# Design System: Easy Parking

## Overview

**Creative North Star: "Car-Park Floor Paint"**

The interface is painted the way a parking deck is painted. An asphalt-charcoal shell carries a line of yellow road paint. Floors are identified by a level colour, like painted pillars, and shown as a squared, stencilled floor code. The floor map is drawn as white bay lines on asphalt, and the only solid yellow on it is the driver's own slot. Content sits on a pale concrete ground in white cards with soft corners, lifted by a hairline ring and one wide, faint shadow. There are no gradients and no glass.

Driver pages are loose and large: the floor code, the free count and the amount owed are set at stencil size inside a dark deck band. Admin pages use the same objects (floor badge, plate, painted map, hairline-split readout) in a denser grid. The exit kiosk turns the whole screen into asphalt-deep, under a yellow exit sign.

The system rejects the white-card SaaS look, with its blue buttons and green/amber/red progress bars. It replaces the earlier navy and pastel-green look completely; none of those values remain.

**Key Characteristics:**
- An asphalt shell with a 4px yellow paint rule along the edge that meets the content.
- Flat colour throughout. Depth comes from asphalt against concrete against white, plus one soft card shadow (`shadow-card`) on white panels.
- Floors are carried by level colour and the square floor badge, repeated at every size.
- Yellow is scarce and always means "your action, your place, your slot".
- Status is always a word with a fill or line treatment, never colour alone.
- Thai first: comfortable 1.65 body leading, no tracking on Thai text, and tabular figures for money, counts and times.

## Colors

The palette is an asphalt-and-concrete neutral ramp, one road-paint yellow, four pillar colours for levels, and three status colours, each of which has a light variant for use on asphalt.

### Primary
- **Line Yellow** (paint): The primary action button, the active nav or switch item, the driver's selected or own slot on the floor map, and the structural paint (the 4px shell rule, the wordmark's P tile, the focus ring and the text selection).
- **Line Yellow Bright** (paint-hi): Hover state of yellow buttons only.
- **Paint Ink** (paint-ink): Yellow's legible partner on light grounds: caret colour, form accent colour, and the booking-code text on Paint Wash.
- **Paint Wash** (paint-soft): Row hover on white action lists, and the background of the booking-code chip.

### Secondary: Level Colours
- **Level Blue** (lvl-a), **Level Orange** (lvl-b), **Level Green** (lvl-c), **Level Violet** (lvl-d): one per floor, assigned by the floor's position in the lot's floor list (cycling after four). They fill the floor badge and the per-floor availability bars on the admin dashboard. White text sits on all four.

### Tertiary: Status
- **Status Green** (ok), **Status Amber** (warn), **Status Red** (bad): status text, success panel borders (`ok` at 50%), error notes (`bad` text on `bad` at 10%) and destructive buttons on light grounds. The exit tile on the floor map is `ok` with white text.
- **Status Green Light** (ok-lt) and **Status Red Light** (bad-lt): the same meanings on asphalt grounds (the deck band's ว่างมาก / เต็ม, and the kiosk's closed-gate light). There is no amber light variant; on asphalt the middle state ใกล้เต็ม is set in plain white.

### Neutral
- **Asphalt** (asphalt): Navbar, sidebar, deck bands, the floor-map ground, kiosk panels and dark link-buttons.
- **Asphalt Deep** (asphalt-deep): Walls on the map, the kiosk background, the lift tile.
- **Asphalt 2 / Asphalt 3** (asphalt-2, asphalt-3): Raised items on asphalt (inactive floor-switch buttons, kiosk keys) and their hover. Asphalt 3 is also the grey "car block" fill in an occupied bay.
- **Concrete** (surface): The page ground.
- **Panel White** (panel): Panels, inputs, plates.
- **Hairline** (line): 1px panel borders, row dividers and the gaps in the StatBar.
- **Ink** (ink) and **Muted** (muted): Body text, and secondary text or labels.

### Named Rules
**The Reserved Paint Rule.** Yellow as a fill means one of three things: the primary action, the active item, or the driver's own slot. Apart from those, it appears only as structural paint (the shell rule, the wordmark tile, focus, selection, the kiosk exit sign) or as a mark on asphalt (an arrow, an icon in an asphalt tile, the kiosk's read-out plate). Never use it to decorate a light panel.

**The Pillar Rule.** Level colours belong to floors. A level colour on anything that is not a floor (a chart series, a category, a button) breaks the wayfinding.

**The Word-Plus-Fill Rule.** Every status is spoken. Map bays have a fill or line state (open lines = ว่าง, grey block = มีรถ, dashed lines = ถูกจอง, yellow = ช่องของคุณ) plus a word in the title and the legend. Floor fullness is always a word (ว่างมาก / ใกล้เต็ม / เต็ม) next to its colour.

**The Dark-Ground Variant Rule.** On asphalt, use `ok-lt` and `bad-lt`, never `ok` and `bad`.

## Typography

**Display Font:** Chakra Petch 500/600/700 (Thai and Latin, through next/font), with a sans-serif fallback
**Body Font:** Anuphan 400/500/600 (Thai and Latin), with a sans-serif fallback

**Character:** Chakra Petch's squared, chamfered letters read as stencilled deck numbers. It carries headings, floor codes, figures, plates, buttons and bay codes. Anuphan is a calm, modern Thai text face for everything you read at length.

### Hierarchy
- **Display** (700, 60–72px, leading 1): The free count in the deck band ("12 / 40 ช่องว่าง"), the kiosk fee, and the xl floor badge.
- **Headline** (700, 30px rising to 36px from sm, leading 1.25, balanced wrap): One page H1 per screen, set by the page header.
- **Title** (700, 20–24px): Section H2s ("ผังชั้น B1", "ช่องว่างแยกตามชั้น"). At 18px semibold it labels buttons, list items and the floor state ("ชั้น B1 · ว่างมาก").
- **Figure** (700, 30px, tabular): StatBar values and inline money ("120 ฿"). Every count, amount and time uses tabular numbers.
- **Body** (400, 16px, line height 1.65): Running text. Subtitles are capped at 65ch.
- **Label** (400, 14px): Field labels, notes and legends. Nav items are 15px.
- **Bay code** (600, 10px rising to 11px from sm, leading 1): Slot codes inside the floor map.

### Named Rules
**The Stencil-for-Numbers Rule.** A floor code, a plate, an amount or a count is always set in Chakra Petch with tabular figures. Body text never is.

**The Untracked Thai Rule.** Don't add letter-spacing to Thai text. The only tracking in the system is `tracking-wide` on plate characters and `tracking-tight` on the wordmark.

## Layout

Both driver and admin pages sit to the right of a 256px asphalt sidebar (from md up; a top bar on phones), in a column capped at 96rem with 32–40px side padding. Driver pages stack sections with a 32px gap, admin pages with 24px. Panels use 20px padding. Grids are 16px apart, or 32px between the map and its aside.

The driver lot page uses a two-column pattern from lg up: a flexible main column and a fixed 24rem aside, used both for the deck band (floor and count next to plate search) and for the map with its legend. Below sm, the deck band goes full-bleed (negative margins, no radius) right under the shell rule.

Every floor map uses the same bay size, 2.75rem by 3.5rem, so floors can be compared. Rows or columns that contain only walls collapse to 0.75rem so they read as the deck's edge. On phones, the bay columns become `minmax(0, 2.75rem)` so the whole floor fits the screen without scrolling.

Breakpoints are Tailwind's defaults (sm 640, md 768, lg 1024). Grid children get `min-width: 0` globally, so the map never pushes the page wider.

## Elevation & Depth

Depth is mostly tonal: concrete ground, white card, asphalt band, asphalt-2 raised item, asphalt-deep wall. White cards carry `shadow-card` (a 1px ink/6% ring, a 2px contact shadow and a wide 32px blur at 16%) instead of a border; clickable cards rise 2px to `shadow-lift` on hover. Asphalt surfaces never take a shadow. Rings (`ring-1 ring-inset white/25`) outline ghost buttons on asphalt, and a 4px yellow ring frames the plate the kiosk has read.

### Named Rules
**The Paint-First Rule.** If something needs to stand out, change its paint (asphalt against white, or yellow against asphalt). The card shadow only separates white from concrete; never use a heavier shadow or glass for emphasis.

## Shapes

There are three corner sizes, all small and squared, like stencils and painted lines:
- **Bay furniture (3px):** entry, exit and lift tiles on the map, and the legend chips. The fill inside a bay is inset 3px, with 2px corners.
- **Controls (10px):** buttons, inputs, nav items, floor-switch buttons, the md and lg floor badges, and the lg plate.
- **Panels (16px):** white content panels, the deck band, the floor map, the kiosk panels and the xl floor badge.

Small objects step down proportionally: the xs/sm floor badge is 4px/5px and the sm/md plate is 3px/4px. Pills (`rounded-full`) appear only for the kiosk gate-status lamp, step numbers and the finance share bar. Borders are 1px hairlines on light grounds and `white/15` on asphalt. The plate has a heavier ink frame of 1.5px, 2px or 3px, depending on size.

## Components

### Buttons
Squared, stencil-voiced and solid.
- **Shape:** control corners (10px).
- **Primary:** Line Yellow fill with Ink text in Chakra Petch bold or semibold. Hero actions are 56px tall at 18px text ("ค้นหา", "ชำระเงิน"). Panel actions use 10px by 20px padding. Hover moves to Line Yellow Bright. Use one per view region.
- **Secondary:** a white fill, a 1px hairline border, and Ink text, semibold. On hover the border darkens to Ink ("เปิดตู้ Kiosk ทางออก A").
- **Danger:** a white fill with a `bad` 40% border and `bad` text. Hover adds a 5% `bad` tint ("ยกเลิกการจอง").
- **On asphalt:** either an asphalt-2 fill, or a ghost (transparent with a `white/25` inset ring and `white/85` text) that hovers to `white/10`. The kiosk scales the same buttons to 64px tall.

### Inputs / Fields
- **Style:** a white fill, a 1px Ink border at 35–40%, 10px corners, 16px text, and 48px tall in forms. The hero plate search is 56px tall with 20px Chakra Petch text and no border, sitting on asphalt.
- **Caret and accent:** paint-ink. The placeholder is #6b6f76 ("กรอกทะเบียน เช่น กข 1234").
- **Error:** a note below or above the field, in `bad` text on a `bad` 10% wash with 10px corners.

### Cards / Containers (Panels)
- **Corner Style:** panel (16px).
- **Background:** Panel White on Concrete. Success panels swap the hairline for an `ok` 50% border.
- **Shadow Strategy:** none (see Elevation).
- **Border:** a 1px hairline. Inner sections are split by `border-t` hairlines, not by nested cards.
- **Internal Padding:** 20px (24px from sm on the pay panel).

### Navigation (the shell)
- **Navbar (driver):** a sticky 256px asphalt sidebar with a **4px Line Yellow right rule** (a top bar with a bottom rule on phones). It holds the wordmark (a yellow 28px P tile with 4px corners, plus "Easy Parking" in Chakra Petch bold), the current lot on an asphalt-2 tile, the menu with line icons, the exit-kiosk links and the staff phone. Items are 15px with 10px corners and `white/85` text that hovers to `white/10`. The **active item is filled Line Yellow with Ink semibold text** and carries `aria-current="page"`. On phones the menu is a horizontal scroller with a fade mask on its right edge.
- **Sidebar (admin):** the same asphalt and the same item states, 256px wide and sticky at full height from md up. The 4px yellow rule moves to its right edge (`border-r-4`); on mobile it sits on the bottom edge. A `white/15` hairline separates the account block.

### FloorBadge (signature)
One object at every size: a level-colour square with the floor code centred in white Chakra Petch bold. It appears inline in the floor switch, beside the H2 "ผังชั้น B1", in dashboard rows, and at 112px in the deck band.
- **Sizes:** xs 24px, sm 32px, md 44px, lg 64px, xl 112px. Text scales from 12px to 72px, and corners from 4px up to 8px.
- **Colour:** the level colour comes from the floor's index (`lvl-a`…`lvl-d`). The badge always carries `aria-label="ชั้น B1"`.
- Don't restyle it per context (no outline variant, no circle, no yellow badge).

### FloorMap (signature)
Bays painted on asphalt, inside an 8px asphalt panel with 8px or 16px padding.
- **Bay lines:** 2px lines in `white/85`. Neighbouring bays share their dividers. Each bay is open on the side that faces the aisle and closed at the back.
- **States:** free bays are empty lines. Busy bays get an Asphalt 3 block inset 3px. Reserved bays use dashed lines. **The selected or own bay is the only solid yellow on the map** (titled "· ช่องของคุณ"). Each bay's title gives its code and status word ("B1-04 · ว่าง").
- **Aisles and walls:** aisles are plain asphalt with a dashed `white/25` centre line. Walls are Asphalt Deep and collapse into one thin band.
- **Tiles:** exit tiles are `ok` with an arrow and "ออก". Entry tiles are white with "เข้า". Lift tiles are Asphalt Deep with a `white/40` inset ring. All three have 3px corners.
- **Kind icons:** EV, accessible and motorcycle bays show a 12px line icon above the code.
- **Heat mode** (admin activity) mixes Line Yellow into Asphalt 2 in proportion to how often a bay was used, with a five-step legend from ใช้น้อย to ใช้บ่อย. It is the one place yellow encodes data, and it never appears together with a selected slot.
- Clickable bays are buttons that hover to `white/15`.

### Plate
A Thai licence plate drawn literally: a white fill with an Ink frame, Chakra Petch bold with wide tracking and tabular figures, and the province on a second line at 0.38em. It comes in sm (14px, 1.5px frame, 3px corners), md (18px, 2px frame, 4px corners) and lg (36px, 3px frame, 6px corners). Plates are content, so never recolour them.

### StatBar and Stat
A single readout panel split by hairlines, not a row of cards. It is a grid with a 1px gap over a Hairline background, a 1px hairline border, 6px corners and clipped overflow: two columns, or four from lg up. Each Stat has a white cell, padding of 16px (20px horizontally from sm), a 14px muted label led by a 10px tone square (`paint`, `ok`, `warn`, `bad`, or `asphalt-3` for plain), a 30px figure and an optional muted note. The kiosk's plate readout uses the same split-panel idea on asphalt with `white/15` dividers.

### Page Header
The H1 (30px rising to 36px) with a muted subtitle (max 65ch) on the left and its action buttons on the right. It is closed by a hairline bottom border with 16px padding below the text. There is no label above the title.

### Deck Band
An asphalt panel (8px corners from sm up, full-bleed on phones) that holds the floor-and-count block, the floor switch and the plate search. The floor switch is a row of 6px buttons, each containing an sm FloorBadge, a free / total count and a fullness word. The active one is white with Ink text and the others are asphalt-2. Rates sit below the search under a `white/15` hairline.

### Motion
- **deck-in:** the single transition when switching floors. The map container is re-keyed by floor and fades up 6px over 0.35s with `cubic-bezier(.16, 1, .3, 1)`. Don't add other entrance animations.
- **State transitions:** colour transitions only, at Tailwind's default duration (on nav items, floor switch buttons, list rows and bay hover). The list-row arrow nudges 4px on hover.
- **Kiosk simulation only:** `scan-sweep`, `gate-up` and `blink` animate the mock camera and gate. They are part of the kiosk's simulation, not general UI motion.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, every animation and transition is cut to 0.01ms and runs once.

### Focus, Selection, Scrollbar
- **Focus:** every focusable element gets a 3px solid Line Yellow outline at a 2px offset (`:focus-visible`). It works on both asphalt and white.
- **Selection:** a Line Yellow background with Ink text.
- **Caret and native accent:** paint-ink.
- **Scrollbar:** an Asphalt 3 thumb on a Concrete track (`scrollbar-color`).
- **Links:** underline offset 3px.

## Do's and Don'ts

### Do:
- **Do** take every colour from the `@theme` tokens in `app/globals.css`.
- **Do** put the 4px Line Yellow rule on the edge of the asphalt shell that meets the content.
- **Do** show every floor with a FloorBadge in its level colour, at whichever size fits.
- **Do** pair every status colour with a word: ว่าง / มีรถ / ถูกจอง, ว่างมาก / ใกล้เต็ม / เต็ม.
- **Do** use `ok-lt` and `bad-lt` on asphalt.
- **Do** set plates, amounts, counts and times in Chakra Petch with tabular figures.
- **Do** keep 6px corners on controls, 8px on panels and 3px on bay furniture.
- **Do** draw every floor map at the same bay scale.
- **Do** use a diagonal hazard stripe (Asphalt Deep and Line Yellow, 8px bands) where a real car park would paint one, as on the kiosk exit sign.

### Don't:
- **Don't** use yellow on anything except the primary action, the active item, the driver's own slot and the structural paint.
- **Don't** use a level colour for anything that is not a floor.
- **Don't** show status with colour alone.
- **Don't** add drop shadows, smooth gradients or glass. Depth is tonal.
- **Don't** return to white SaaS cards with blue buttons and green/amber/red progress bars, or to the old navy and pastel-green palette.
- **Don't** letter-space Thai text.
- **Don't** add a second entrance animation; deck-in is the only one.
