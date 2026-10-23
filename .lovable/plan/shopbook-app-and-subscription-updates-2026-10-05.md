# SHOPBOOK app and subscription updates

## What will change
- Use the supplied dark green chatbot artwork in light mode, while keeping the existing dark-mode chatbot artwork unchanged.
- Center uploaded shop photos inside the circular crop so the middle of each photo remains visible on signup and in the Apps header.
- Increase the vertical spacing between each row of app icons while preserving four icons per row and centered Settings.
- Rebuild the subscription screen to closely match the supplied light and dark references:
  - Monthly and yearly segmented switch.
  - Three full-height Basic, Plus, and Business plan columns with their individual colors and feature lists.
  - Monthly pricing of KSh 1,050 / 2,100 / 4,200 and yearly pricing of KSh 1,000 / 2,000 / 4,000 per month.
  - Yearly billing details, savings badges, Business “Best option” badge, plan selection glow, paid-plan continuation, and 30-day trial action.
- Keep all selection, back, trial, and payment actions working with the current device-only account flow; validate the M-Pesa phone entry before showing the existing payment-unavailable notice.

## Verification
- Check light and dark modes at the current mobile size.
- Test photo cropping, plan switching, plan selection, paid-plan continuation, back actions, and starting the free trial.
- Confirm every page has complete sharing metadata and the preview finishes without errors.

## Technical details
- Store the supplied chatbot artwork through the project asset system and reference its generated URL.
- Keep pricing and access rules centralized in the existing SHOPBOOK data module.
- Preserve the current screens-only storage model; no online billing or account backend will be added.
