from __future__ import annotations

from backend.models import ListingInput


def flag_missing_fields(listing: ListingInput, photo_count: int) -> list[str]:
    """Return soft warnings for fields the user probably wants to fill in."""

    warnings: list[str] = []

    if not listing.amenities:
        warnings.append("amenities")

    if not listing.persona:
        warnings.append("persona")

    if photo_count == 0:
        warnings.append("photos")

    if listing.beds == 0 and listing.baths == 0:
        warnings.append("beds_baths")

    return warnings
