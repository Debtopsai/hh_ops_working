"""Normalisation + identity helpers for the HireHospo prospect list.

Everything that decides "are these two rows the same business/person" lives here,
so every source adapter produces keys that are comparable across sources.

Design note: most NZ hospo operators use personal Gmail/Hotmail/Xtra addresses,
not business domains (true of 20 of 29 HireHospo customers and ~55% of the
HubSpot leads). Domain-based matching therefore fails on the majority of rows,
so identity resolution leans on email > phone > name+suburb, in that order.
"""

import re
import unicodedata

ROLE_LOCALPARTS = {
    "info", "admin", "accounts", "office", "hello", "enquiries", "enquiry",
    "contact", "sales", "manager", "bookings", "reception", "kitchen",
    "orders", "team", "mail", "support", "finance", "hi",
}

# Mailbox providers where the domain says nothing about the business.
CONSUMER_DOMAINS = {
    "gmail.com", "hotmail.com", "hotmail.co.nz", "outlook.com", "outlook.co.nz",
    "yahoo.com", "yahoo.co.nz", "xtra.co.nz", "icloud.com", "me.com",
    "live.com", "msn.com", "protonmail.com", "proton.me", "orcon.net.nz",
    "slingshot.co.nz", "vodafone.co.nz", "clear.net.nz", "paradise.net.nz",
}

LEGAL_SUFFIXES = [
    "limited", "ltd", "pty", "inc", "incorporated", "holdings", "group",
    "nz", "new zealand", "co nz", "company", "trust", "partnership", "llc",
]

# Words that are part of the venue's identity but too common to match on alone.
_NAME_NOISE = {"the", "and", "&", "a", "at", "of", "on", "by"}

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s.]+\.[^@\s]+$")


def strip_accents(value):
    return "".join(
        ch for ch in unicodedata.normalize("NFKD", value)
        if not unicodedata.combining(ch)
    )


def norm_email(raw):
    """Lowercase, trim, drop +tags and Gmail dots. Returns None if unusable."""
    if not raw:
        return None
    value = strip_accents(str(raw)).strip().strip("<>\"' ").lower()
    value = re.sub(r"\s+", "", value)
    if not _EMAIL_RE.match(value):
        return None
    local, domain = value.rsplit("@", 1)
    local = local.split("+", 1)[0]
    if domain in ("gmail.com", "googlemail.com"):
        local = local.replace(".", "")
        domain = "gmail.com"
    if not local:
        return None
    return f"{local}@{domain}"


def email_domain(email_norm):
    return email_norm.rsplit("@", 1)[1] if email_norm else None


def is_role_email(email_norm):
    if not email_norm:
        return False
    local = email_norm.split("@", 1)[0]
    return local in ROLE_LOCALPARTS or re.sub(r"[^a-z]", "", local) in ROLE_LOCALPARTS


def is_business_domain(email_norm):
    """True when the email domain identifies the business itself."""
    domain = email_domain(email_norm)
    return bool(domain) and domain not in CONSUMER_DOMAINS


def norm_domain(raw):
    """Website or domain string -> bare apex domain, or None."""
    if not raw:
        return None
    value = str(raw).strip().lower()
    value = re.sub(r"^https?://", "", value)
    value = re.sub(r"^www\.", "", value)
    value = value.split("/", 1)[0].split("?", 1)[0].split(":", 1)[0]
    if "." not in value or " " in value:
        return None
    return value or None


def norm_phone_nz(raw):
    """NZ phone -> E.164 (+64...). Returns None when it can't be trusted."""
    if not raw:
        return None
    digits = re.sub(r"[^\d+]", "", str(raw))
    if not digits:
        return None
    digits = digits.lstrip("+")
    if digits.startswith("0064"):
        digits = digits[4:]
    elif digits.startswith("64") and len(digits) >= 10:
        digits = digits[2:]
    elif digits.startswith("0"):
        digits = digits[1:]
    if not digits.isdigit():
        return None
    # NZ national numbers are 8-9 digits after the trunk 0 (mobiles up to 9).
    if not 7 <= len(digits) <= 10:
        return None
    return f"+64{digits}"


def norm_business_name(raw):
    """Comparable business-name key: accents, punctuation, legal suffixes gone."""
    if not raw:
        return None
    value = strip_accents(str(raw)).lower()
    value = re.sub(r"\bt/?a\b|\btrading as\b", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value).strip()
    for suffix in LEGAL_SUFFIXES:
        value = re.sub(rf"\b{re.escape(suffix)}\b", " ", value)
    tokens = [t for t in value.split() if t and t not in _NAME_NOISE]
    return " ".join(tokens) or None


def name_tokens(raw):
    normed = norm_business_name(raw)
    return set(normed.split()) if normed else set()


def norm_suburb(raw):
    if not raw:
        return None
    value = strip_accents(str(raw)).lower()
    value = re.sub(r"[^a-z ]+", " ", value)
    return re.sub(r"\s+", " ", value).strip() or None


def business_key(name, suburb):
    """Blocking key for name-based matching. Both parts required."""
    n, s = norm_business_name(name), norm_suburb(suburb)
    return f"{n}|{s}" if n and s else None


def name_similarity(a, b):
    """Jaccard overlap of name tokens: 1.0 identical, 0.0 nothing shared."""
    ta, tb = name_tokens(a), name_tokens(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)
