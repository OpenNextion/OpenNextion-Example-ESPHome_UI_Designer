# Project Rules For Future AI

This repository is a pure browser-based ESPHome YAML editor.

The product is the standalone web app:

- visual spec editing
- LVGL-style preview
- final ESPHome YAML generation in the browser

The old Python build pipeline is not part of the normal workflow.

## Project Intent

- Generate complete ESPHome YAML from the browser app.
- Add UI features through the editor/spec layer in `src/app/`.
- Keep the HTML preview and generated YAML behavior aligned.
- Keep the HTML preview visually close enough to LVGL that users are not misled.
- Do not turn this repo back into a mixed Python build tool unless explicitly requested.

## Project Structure

- `index.html`
  Main app shell, toolbar, entity panel, inspector, and build output UI.
- `src/app.js`
  Browser entry module. It loads the editor app.
- `src/app/main.js`
  Main UI wiring, event handling, drag/resize interactions, and editor coordination.
- `src/app/persistence.js`
  Browser-local snapshot/save/restore helpers and timestamp helpers for downloads.
- `src/app/screens.js`
  Current-screen lookup, screen/entity synchronization, and screen control helpers.
- `src/app/spec.js`
  State initialization, spec parsing/export, normalization, and shared data-model helpers.
- `src/app/preview.js`
  Preview rendering, entity list rendering, inspector rendering, and preview orchestration.
- `src/app/esphome.js`
  Board templates, shared ESPHome helpers, and final ESPHome YAML orchestration.
- `src/app/constants.js`
  Board metadata, layout constants, and shared widget constants.
- `src/app/components/registry.js`
  Central component registry. Component lookup should live here instead of new type-switch chains in main modules.
- `src/app/components/*.js`
  One file per widget/component type. These modules own component metadata, style normalization, defaults, preview rendering, spec-property extensions, and Inspector-specific behavior.
- `src/app/components/esphome/registry.js`
  ESPHome widget renderer registry.
- `src/app/components/esphome/*.js`
  One file per widget/component type for final LVGL/ESPHome widget rendering.
- `src/app/components/common.js`
  Small shared helpers for component modules.
- `src/app/components/preview-helpers.js`
  Shared preview-side icon/color helpers used by component modules.
- `assets/css/styles.css`
  App styling and preview styling.
- `assets/images/*.png`
  Static image assets used by the preview and documentation.
- `_check.mjs`
  Lightweight local smoke check entry used by the repository tooling.
- `README_cn.md`
  User-facing Chinese project documentation.

## Current Data Model

- Top-level page settings may include:
  `base_config`, `rotation`, `device`, `wifi`, and `screen`.
- `device.name`
  Maps to generated ESPHome `substitutions.device_name`.
- `device.friendly_name`
  Optional. If missing, generated output should use `device.name.toUpperCase()`.
- `wifi.ssid` and `wifi.password`
  Map to generated ESPHome Wi-Fi substitutions.
- `screen.bg_color`
  Maps to generated `lvgl.bg_color`.
- `type: switch`
  Uses one `entityid`.
- `type: multi_switch`
  Uses one `entityid` and renders multiple switches from one source entity where supported by the component.
- `type: thermo_hygrometer`
  Uses exactly two `entityids`, ordered as temperature sensor then humidity sensor.
- `type: cover`
  Uses one `entityid`.
- `type: hmi_screen_brightness`
  Uses the board brightness entity and the component-specific `props`.
- `type: light`
  Uses one `entityid`.
- Common widget metadata lives in `props`.

Current style support:

- `switch.props.style: switch`
- `switch.props.style: toggle`
- `multi_switch.props.style: tile`
- `multi_switch.props.style: list`
- `thermo_hygrometer.props.style: compact`
- `cover.props.style: compact`
- `light.props.style: icon`
- `light.props.style: tile`
- `light.props.style: slider`
- `hmi_screen_brightness.props.style: tile`

When adding more built-in styles, prefer extending `props.style` instead of creating a new widget type unless the interaction model is genuinely different.

## Layering Rules

Work from top to bottom.

1. Spec contract
   The compact YAML shape exposed by the editor.
2. Editor logic
   `src/app/` parsing, normalization, preview rendering, board templates, and final YAML generation.
3. Editor UI
   `index.html` and `assets/css/styles.css`.

Do not add a separate generator implementation unless the user explicitly asks for one.

## Component Architecture Rule

The project is component-first.

- Do not re-introduce large `if (entity.type === ...)` trees in `spec.js`, `preview.js`, or `esphome.js` for behavior that belongs to an individual widget.
- Prefer adding or updating behavior in:
  - `src/app/components/<component>.js`
  - `src/app/components/esphome/<component>.js`
- Use `src/app/components/registry.js` for:
  - type lookup
  - style normalization
  - default size/title helpers
  - Inspector behavior hooks
  - preview renderer dispatch
- Use `src/app/components/esphome/registry.js` for final LVGL/ESPHome widget renderer dispatch.
- `spec.js`, `preview.js`, and `esphome.js` should act as orchestration layers and shared-helper homes, not as the primary place for per-widget behavior.
- `main.js` should stay focused on editor orchestration. Browser cache persistence belongs in `src/app/persistence.js`.
- Current-screen selection and screen-control syncing belong in `src/app/screens.js`, not as another large inline state section inside `main.js`.

Current component split:

- `switch`
- `multi_switch`
- `thermo_hygrometer`
- `cover`
- `hmi_screen_brightness`
- `light`

For a new widget type, create both:

1. `src/app/components/<new-type>.js`
2. `src/app/components/esphome/<new-type>.js`

Then register them in both registries.

## Safe Change Zones

Normal feature work should stay inside:

- `index.html`
- `src/app.js`
- `src/app/*.js`
- `assets/css/styles.css`
- `README_cn.md`
- `AGENTS.md`

## Preview Fidelity Rule

For UI styling work, treat the generated YAML and intended LVGL result as the source of truth.

- Keep the preview close in card shape, spacing, borders, and control styling.
- Avoid strong gradients, heavy shadows, glass effects, or layered browser-only styling that LVGL cannot represent closely.
- If a visual choice cannot be represented reasonably in LVGL, simplify the preview.
- Use the actual widget geometry from the editor state whenever possible.
  If the user drags or resizes a widget, treat the current `x`, `y`, `width`, and `height` as the source geometry for both preview and generated YAML.
  Do not invent a second independent layout model if the current editor geometry can be reused.
- For interactive controls such as sliders, the minimum size rule should apply to the internal control area first.
  Do not incorrectly convert an internal slider minimum height into an unrelated outer card minimum unless padding/header math requires it.
- For widgets with both preview HTML and generated LVGL layouts, prefer sharing one layout calculation between preview and YAML generation so the same numbers drive both outputs.

The preview must be treated as strict WYSIWYG for normal editor work: what the user sees in HTML should be what appears on the flashed HMI screen, including position, size, spacing, and internal control geometry.

## Style Variant Rule

Style variants are allowed, but they must stay systematic.

- Add variants through `props.style`.
- Do not hardcode behavior based on specific entity IDs.
- A new style is not complete until the editor can:
  parse it,
  edit it,
  preview it,
  export it in spec YAML,
  and generate the correct final ESPHome YAML.
- Update documentation and example spec data in the same task when useful.

## Board Template Rule

Board-specific base YAML lives inside `src/app/esphome.js`.

If a board changes:

- update `BOARD_CONFIGS`
- update the matching `renderNextion...Base()` function
- keep rotation behavior and preview dimensions aligned
- preserve support for page-level device, Wi-Fi, and screen settings in generated output

Do not make silent hardware decisions outside those explicit board template sections.

## Implementation Checklist For Future AI

When implementing a new widget style or layout variant:

1. Update the spec contract first.
2. Update parsing and normalization in `src/app/spec.js` and the relevant `src/app/components/*.js`.
3. Update final YAML generation in the relevant `src/app/components/esphome/*.js` and any required shared helper in `src/app/esphome.js`.
4. Update preview rendering in the relevant `src/app/components/*.js` and any required shared helper in `src/app/preview.js`.
5. Update inspector controls in `index.html` if needed.
6. Update component Inspector behavior in the relevant `src/app/components/*.js` if needed.
7. Update styling in `assets/css/styles.css`.
8. Update documentation and example spec data when helpful.

When implementing a new widget type:

1. Add the component module in `src/app/components/`.
2. Add the ESPHome renderer module in `src/app/components/esphome/`.
3. Register both in the matching registries.
4. Update `index.html` only for truly shared Inspector UI controls.
5. Keep per-component Inspector visibility/field-sync logic in the component module, not in `main.js` or `preview.js`.

## HMI Brightness Widget Notes

When working on `type: hmi_screen_brightness`, follow these rules:

- `header` means the top row containing the HMI title on the left and the current brightness on the right.
- If `show_header` is enabled, the title and brightness must render on the same row.
- The title must be visually left-aligned.
- If `show_header` is disabled, the slider must keep the configured top/bottom padding and must not leave a reserved header gap.
- Size limits should be derived from the slider's minimum drawable size, not from an arbitrary outer card size.
  Example: if the slider minimum height is `25`, compute the widget minimum height from `padding + optional header + optional header gap + slider minimum height + padding`.
- Resizing the widget should primarily change the slider geometry.
  Do not let resizing accidentally change the perceived header-to-slider spacing instead of the slider size itself.
- If Home Assistant changes the backlight state externally, the widget must update its displayed percentage and slider position/fill accordingly.
- Avoid stale-value feedback loops.
  If a slider controls backlight brightness, make sure the displayed percentage reflects the latest state rather than the previous state.

## Expected Workflow

For most work:

1. Read the current editor behavior in `src/app/main.js` and the relevant modules in `src/app/`.
2. Find the relevant component module under `src/app/components/` and `src/app/components/esphome/`.
3. Update the spec contract and preview together.
4. Update final YAML generation in the same task.
5. Keep the preview and generated output aligned.

## Validation Standard

Before concluding work, sanity-check the browser-side generation path.

If a local smoke check is relevant, run it.
If external `esphome config` validation is available and relevant, use it.
If it cannot be run, say so explicitly.

## Decision Rule For Future AI

If the request is "add UI", "bind HA entity", "move widgets", "add page logic", or "change generated output":

- work in the editor files first
- keep the compact spec contract coherent
- keep preview behavior and final YAML generation in sync
