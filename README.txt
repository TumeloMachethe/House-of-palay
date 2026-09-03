HOUSE OF PALAY - CHECKOUT VALIDATION FIX

Replace ONLY your current order.js with the order.js in this folder.
No checkout HTML, cart, totals, Make.com or PayFast logic was changed.

New behaviour:
- Continue to secure payment stops on the first missing/invalid required field.
- The page scrolls to that exact field.
- The field is focused and highlighted.
- A clear message appears beside the field.
- Once corrected, the highlight disappears.
- Pressing the payment button again guides to the next missing required field.
- Delivery area and the confirmation checkbox are included.
