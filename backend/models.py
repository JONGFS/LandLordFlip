from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ListingInput(BaseModel):
    """Raw listing data from the intake form."""

    title: str = Field(..., min_length=1, max_length=200)
    price: float = Field(..., gt=0)
    beds: int = Field(..., ge=0, le=20)
    baths: int = Field(..., ge=0, le=20)
    neighborhood: str = Field(..., min_length=1, max_length=200)
    square_footage: Optional[int] = Field(None, gt=0)
    amenities: list[str] = Field(default_factory=list)
    persona: Optional[str] = None
    leasing_special: Optional[str] = None


class PhotoMeta(BaseModel):
    """Metadata for a single uploaded photo."""

    id: str
    filename: str
    label: str
    url: str


class NormalizedListing(BaseModel):
    """Cleaned, validated listing ready for downstream consumption."""

    id: str
    title: str
    price: float
    beds: int
    baths: int
    neighborhood: str
    amenities: list[str]
    persona: Optional[str] = None
    leasing_special: Optional[str] = None
    photo_count: int = 0
    photos: list[PhotoMeta] = Field(default_factory=list)
    missing_fields: list[str] = Field(default_factory=list)
    created_at: str
