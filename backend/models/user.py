from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from dataclasses import dataclass, asdict, field

@dataclass
class Address:
    """Represents a saved or recent address"""
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    label: Optional[str] = None  # Optional label like "Home", "Work", etc.
    timestamp: Optional[str] = None  # ISO format timestamp
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Firestore"""
        return {k: v for k, v in asdict(self).items() if v is not None}
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Address':
        """Create Address from Firestore document"""
        return cls(**data)


@dataclass
class User:
    """
    User model that corresponds to Firebase Auth users
    Stored in Firestore collection: 'users'
    Document ID: Firebase Auth UID
    """
    uid: str  # Firebase Auth UID - used as document ID
    email: str
    created_at: str  # ISO format timestamp
    updated_at: str  # ISO format timestamp
    favorite_addresses: List[Address] = field(default_factory=list)
    recent_addresses: List[Address] = field(default_factory=list)
    
    # Future fields can be added here:
    # display_name: Optional[str] = None
    # phone_number: Optional[str] = None
    # profile_picture_url: Optional[str] = None
    # preferences: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Firestore storage"""
        data = {
            'uid': self.uid,
            'email': self.email,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'favorite_addresses': [addr.to_dict() for addr in (self.favorite_addresses or [])],
            'recent_addresses': [addr.to_dict() for addr in (self.recent_addresses or [])]
        }
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """Create User from Firestore document"""
        # Convert address dicts to Address objects
        favorite_addresses = [
            Address.from_dict(addr) for addr in data.get('favorite_addresses', [])
        ]
        recent_addresses = [
            Address.from_dict(addr) for addr in data.get('recent_addresses', [])
        ]
        
        return cls(
            uid=data['uid'],
            email=data['email'],
            created_at=data['created_at'],
            updated_at=data['updated_at'],
            favorite_addresses=favorite_addresses,
            recent_addresses=recent_addresses
        )
    
    def add_favorite_address(self, address: Address) -> None:
        """
        Add an address to favorites (avoids duplicates based on coordinates or label)
        If a placeholder with the same label exists (no coordinates), it will be replaced
        """
        # If the new address has coordinates, check for duplicates or placeholders to replace
        if address.latitude is not None and address.longitude is not None:
            for i, fav in enumerate(self.favorite_addresses):
                # Replace placeholder with same label
                if fav.label == address.label and fav.latitude is None and fav.longitude is None:
                    self.favorite_addresses[i] = address
                    self.updated_at = datetime.utcnow().isoformat()
                    return
                # Check if coordinates already exist
                if (fav.latitude == address.latitude and 
                    fav.longitude == address.longitude):
                    return  # Already exists, don't add duplicate
        else:
            # For placeholders (no coordinates), check if label already exists
            for fav in self.favorite_addresses:
                if fav.label == address.label and fav.latitude is None and fav.longitude is None:
                    return  # Placeholder with this label already exists
        
        self.favorite_addresses.append(address)
        self.updated_at = datetime.utcnow().isoformat()
    
    def remove_favorite_address(self, label: str, latitude: Optional[float], longitude: Optional[float]) -> bool:
        """Remove an address from favorites by label and coordinates"""
        original_length = len(self.favorite_addresses)
        self.favorite_addresses = [
            addr for addr in self.favorite_addresses 
            if not (addr.label == label and 
                   addr.latitude == latitude and 
                   addr.longitude == longitude)
        ]
        
        if len(self.favorite_addresses) < original_length:
            self.updated_at = datetime.utcnow().isoformat()
            return True
        return False
    
    def clear_favorite_addresses(self) -> None:
        """Clear all favorite addresses"""
        self.favorite_addresses = []
        self.updated_at = datetime.utcnow().isoformat()
    
    def add_recent_address(self, address: Address, max_recent: int = 10) -> None:
        """
        Add an address to recent addresses
        Maintains a maximum number of recent addresses (default 10)
        Most recent first
        """
        address.timestamp = datetime.utcnow().isoformat()
        
        # Remove if already exists to avoid duplicates (check coordinates if they exist)
        if address.latitude is not None and address.longitude is not None:
            self.recent_addresses = [
                addr for addr in self.recent_addresses
                if not (addr.latitude == address.latitude and 
                       addr.longitude == address.longitude)
            ]
        
        # Add to beginning of list (most recent first)
        self.recent_addresses.insert(0, address)
        
        # Keep only max_recent items
        if len(self.recent_addresses) > max_recent:
            self.recent_addresses = self.recent_addresses[:max_recent]
        
        self.updated_at = datetime.utcnow().isoformat()
    
    def clear_recent_addresses(self) -> None:
        """Clear all recent addresses"""
        self.recent_addresses = []
        self.updated_at = datetime.utcnow().isoformat()

@dataclass
class RecentDestination:
    label: str
    address: str
    lat: float
    lng: float
    place_id: Optional[str] = None
    last_used: float = field(default_factory=lambda: datetime.now(timezone.utc).timestamp())

def upsert_recent_destination(existing: List[Dict[str, Any]],
                              new_item: "RecentDestination",
                              max_items: int = 10) -> List[Dict[str, Any]]:
    """Insert/refresh a recent destination, dedupe by place_id or lat/lng, cap length."""
    def same(a: Dict[str, Any]) -> bool:
        if new_item.place_id and a.get("place_id"):
            return a["place_id"] == new_item.place_id
        return abs(a.get("lat", 0) - new_item.lat) < 1e-6 and abs(a.get("lng", 0) - new_item.lng) < 1e-6

    filtered = [a for a in (existing or []) if not same(a)]
    filtered.insert(0, asdict(new_item))
    return filtered[:max_items]