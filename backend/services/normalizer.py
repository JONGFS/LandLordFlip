"""
Deterministic listing normalizer.
Converts raw form fields into a clean ListingData object.
"""

from __future__ import annotations

import re
from backend.models.schemas import GenerateRequest, ListingData


def _parse_int(value: str | None, default: int | None = None) -> int | None:
    if not value:
        return default
    digits = re.sub(r"[^\d]", "", str(value))
    return int(digits) if digits else default


def normalize(req: GenerateRequest, photo_count: int = 0) -> ListingData:
    return ListingData(
        title=req.title.strip(),
        price=_parse_int(req.price, 0),
        beds=_parse_int(req.beds),
        baths=_parse_int(req.baths),
        neighborhood=req.neighborhood.strip(),
        square_footage=_parse_int(req.square_footage),
        amenities=[a.strip() for a in req.amenities if a.strip()],
        persona=req.target_renter,
        leasing_special=req.leasing_special.strip() if req.leasing_special else None,
        photo_count=photo_count,
    )
