#!/usr/bin/env python3
"""Build the master suppression list from known HireHospo relationships.

Anyone already in a contract, in arrears, bought out, or finished with us must
never receive a cold sequence. Suppression is matched on three independent keys
because no single key is reliable across sources: normalised email, E.164 phone,
and normalised business name. A prospect hitting ANY key is dropped.

Usage:
    python3 scripts/build_suppression.py            # writes the default paths
    python3 scripts/build_suppression.py --check EMAIL_OR_NAME
"""

import argparse
import csv
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hh_norm import norm_business_name, norm_email, norm_phone_nz  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CUSTOMERS = os.path.join(REPO, "data", "customers.csv")
OUT = os.path.join(REPO, "data", "prospecting", "suppression.csv")

FIELDS = ["key_type", "key_value", "reason", "source", "source_id", "label"]


def from_customers(path):
    """Existing/past customers: suppress on every key we can derive."""
    rows = []
    with open(path, newline="", encoding="utf-8") as fh:
        for rec in csv.DictReader(fh):
            cid, name, status = rec["ID"], rec["Name"], rec["Status"]
            # Mis-imported artifact record, not a real customer (data/README.md #3).
            if name.upper().startswith("EAT SHOP DO RENTAL"):
                continue
            reason = {
                "active": "current_customer",
                "month_to_month": "current_customer",
                "arrears": "arrears_do_not_market",
                "bought_out": "past_customer",
                "ended": "past_customer",
            }.get(status, f"customer_status_{status}")

            for key_type, value in (
                ("email", norm_email(rec["Email"])),
                ("phone", norm_phone_nz(rec["Phone"])),
                ("business_name", norm_business_name(name)),
            ):
                if value:
                    rows.append({
                        "key_type": key_type,
                        "key_value": value,
                        "reason": reason,
                        "source": "customers.csv",
                        "source_id": cid,
                        "label": name,
                    })
    return rows


def dedupe(rows):
    seen, out = set(), []
    for row in rows:
        key = (row["key_type"], row["key_value"])
        if key not in seen:
            seen.add(key)
            out.append(row)
    return out


def load(path):
    if not os.path.exists(path):
        return []
    with open(path, newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def is_suppressed(rows, email=None, phone=None, name=None):
    """Return matching suppression rows for a candidate prospect."""
    probes = {
        ("email", norm_email(email)),
        ("phone", norm_phone_nz(phone)),
        ("business_name", norm_business_name(name)),
    }
    probes.discard(("email", None))
    return [r for r in rows if (r["key_type"], r["key_value"]) in probes]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", help="test one email / phone / business name")
    args = ap.parse_args()

    rows = dedupe(from_customers(CUSTOMERS))

    if args.check:
        hits = is_suppressed(load(OUT) or rows, email=args.check,
                             phone=args.check, name=args.check)
        if hits:
            for h in hits:
                print(f"SUPPRESSED  {h['key_type']}={h['key_value']}  "
                      f"{h['reason']}  ({h['label']})")
        else:
            print("clear — no suppression match")
        return

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)

    by_reason = {}
    for row in rows:
        by_reason[row["reason"]] = by_reason.get(row["reason"], 0) + 1
    print(f"wrote {len(rows)} suppression keys -> {os.path.relpath(OUT, REPO)}")
    for reason, count in sorted(by_reason.items(), key=lambda kv: -kv[1]):
        print(f"  {reason:28} {count}")


if __name__ == "__main__":
    main()
