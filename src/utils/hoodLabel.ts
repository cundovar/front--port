/**
 * Where the travelling « Ma facture » label sits inside the diagram.
 *
 * Returned relative to the bridge, which is the label's containing block, so
 * the caller can assign it straight to `top`.
 *
 * `null` means the row could not be measured. That case is the whole reason
 * this is a function: an element with `display: none` reports a rect of all
 * zeros, and taking it at face value placed the label at minus the bridge's
 * own distance from the top of the viewport — several hundred pixels above the
 * section, and further the lower the diagram sat on screen.
 */
export const travellingLabelTop = (
  bridgeTop: number,
  row: { top: number; height: number } | null | undefined,
  labelHeight: number,
): number | null => {
  if (!row || row.height <= 0) return null;

  return row.top - bridgeTop + (row.height - labelHeight) / 2;
};
