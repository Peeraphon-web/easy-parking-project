---
version: 1
slug: "app"
primary_target: "app"
related_targets: ["components"]
---

Scope: the whole app: driver pages (`/`, `/[lot]/*`), the exit kiosk, and admin. Visitor mode: Operate.
Audience and job: drivers find free space or pay and leave within seconds, on phone and desktop equally. Admins monitor and run each lot.
Constraints: every route, function and piece of mock data stays. Thai first. Only the name "Easy Parking" is fixed.

## Direction contract

THESIS: The interface is painted like the parking deck. Line-yellow on asphalt, stencilled floor codes and a pillar colour for each level do the wayfinding. It refuses the white-card SaaS look with blue buttons and green/amber/red bars.

OWN-WORLD: Asphalt charcoal shell (#26282C) with a 4px line-yellow (#F2C230) rule under it. Concrete ground (#EEEFEC), white panels with 1px hairlines, 6px corners, no gradients and no glass. Chakra Petch (squared stencil voice) for display and figures, Anuphan for body. Yellow is reserved for the primary action, the active item and the driver's own slot. Each floor gets a level colour (blue, orange, green, violet), shown as a square floor badge that is the same object at every size. Status always appears as words plus fill, never colour alone.

STORY: Drivers know at once which floor has space and how much they owe. They search their plate or book, pay and leave. Admins read the same deck language in a denser grid.

FIRST VIEWPORT: The charcoal band holds a huge stencilled floor code with the free count beside it, the floor switch, and plate search with a yellow button on the right. Below it the floor map is drawn as painted bay lines on asphalt, with the driver's slot in yellow. Rates follow.

FORM: Car-Park Floor Paint (IMPECCABLE'S PICK, grounded list position 1). seed:040ec044a366a27a
Kept from declined challengers: flat colour only; every floor map at the same scale; yellow reserved for the driver's own slot; the floor badge repeated at every size.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
