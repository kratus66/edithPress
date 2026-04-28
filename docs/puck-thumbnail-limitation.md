# Puck Thumbnail / Icon API — Limitation Analysis

**Date**: 2026-04-27
**Puck version installed**: `@measured/puck ^0.16.0` (resolved from `apps/builder/package.json`)
**Types file inspected**: `apps/builder/node_modules/@measured/puck/dist/resolve-all-data-BoWgijLi.d.ts`

---

## What was searched

The `ComponentConfig` type (lines 133–163 of the types file) was read in full. The complete list of accepted properties is:

```typescript
type ComponentConfig<...> = {
  render: PuckComponent<RenderProps>
  label?: string
  defaultProps?: FieldProps
  fields?: Fields<FieldProps>
  permissions?: Partial<Permissions>
  resolveFields?: (...)  => ...
  resolveData?: (...)    => ...
  resolvePermissions?: (...) => ...
}
```

The top-level `Config` type (lines 170–178) accepts:

```typescript
type Config<...> = {
  categories?: Record<CategoryName, Category<keyof Props>> & { other?: ... }
  components: { [ComponentName in keyof Props]: Omit<ComponentConfig<...>, 'type'> }
  root?: Partial<ComponentConfig<...>>
}
```

The `Category` type (lines 164–169) accepts only:

```typescript
type Category<ComponentName> = {
  components?: ComponentName[]
  title?: string
  visible?: boolean
  defaultExpanded?: boolean
}
```

## What was NOT found

None of the following properties exist anywhere in Puck 0.16.0's public type surface:

- `icon` on `ComponentConfig`
- `thumbnail` on `ComponentConfig`
- `preview` or `previewComponent` on `ComponentConfig`
- Any image/SVG/ReactNode slot in `Category`
- A `categoryLabel` concept

The `icon` property that appears in `index.d.ts` belongs only to Puck's internal UI components (`FieldLabel` and `Button`), which are presentational helpers — not part of block registration.

## Conclusion

Puck 0.16.0 does **not** expose any API to attach a thumbnail, icon, or visual preview to a registered block component. The component list panel in the Puck UI renders blocks using only their `label` string.

## Recommended future alternative (when Puck supports it or on upgrade)

If a future Puck version adds an `icon?: ReactNode` to `ComponentConfig`, the implementation would be straightforward: add a small SVG wireframe to each block entry in `apps/builder/src/lib/puck-config.tsx`.

Until then, the clean alternative (without patching Puck's DOM) is:

1. **Replace Puck's component panel with a custom one** using Puck's `overrides.componentItem` or `overrides.components` slots — check whether the target Puck version exposes these in its `Overrides` type before implementing.
2. The custom panel would render a `<ComponentList>` grid where each entry shows:
   - A small inline SVG wireframe (28×28 or 48×48) representing the block's visual structure.
   - The block's `label` below it.
   - Drag initiation handled via Puck's `usePuck().dispatch` or the drag API exposed in newer versions.
3. SVG wireframes per block (schematic, not real content):
   - **NavbarBlock**: horizontal bar with three dots on the right.
   - **HeroBlock**: tall rectangle with a centered title line and a small button rectangle below.
   - **TextBlock**: three horizontal lines of varying width.
   - **ImageBlock**: rectangle with an X through it (standard image placeholder convention).
   - **ButtonBlock**: small rounded rectangle centered.
   - **SeparatorBlock**: single horizontal line.
   - **GalleryBlock**: 2×2 grid of small rectangles.
   - **ContactFormBlock**: two stacked input rectangles + a button.
   - **CardGridBlock**: three equal rectangles side by side.
   - **VideoBlock**: rectangle with a centered triangle (play icon).
   - **PricingBlock**: two or three rectangles with a highlighted center card.
   - **ProductGridBlock**: grid of rectangles with a small price label.
   - **StatsBlock**: row of numbers with labels below.
   - **NewsletterBlock**: centered rectangle with an email input + button.
   - **CategoryGridBlock**: 2×2 grid with overlay labels.
   - **SplitContentBlock**: two columns — image left, text lines right.
   - **FooterBlock**: wide bar with a grid of small links.

**No workaround has been implemented.** No Puck DOM patching, no monkey-patching of the component panel.
