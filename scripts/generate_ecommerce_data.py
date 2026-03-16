#!/usr/bin/env python3
"""
Generate realistic E-Commerce Customer Analytics dataset for Glimpse.
3,000 rows with realistic correlations and quality issues.
"""

import csv
import random
from datetime import datetime, timedelta
from typing import List, Dict, Optional

# Seed for reproducibility
random.seed(42)

# Configuration
TOTAL_ROWS = 3000
MISSING_RATE_PHONE = 0.10
MISSING_RATE_MIDDLE_INITIAL = 0.12
MISSING_RATE_ACQUISITION = 0.08

# Reference data
FIRST_NAMES_M = ["James", "Michael", "Robert", "David", "William", "Joseph", "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Andrew", "Paul", "Joshua", "Kenneth", "Kevin", "Brian", "George", "Timothy", "Ronald", "Edward", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary"]
FIRST_NAMES_F = ["Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth", "Susan", "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle", "Carol", "Amanda", "Dorothy", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"]
MIDDLE_INITIALS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "W"]

TIERS = ["Bronze", "Silver", "Gold", "Platinum"]
REGIONS = ["Northeast", "Southeast", "Midwest", "Southwest", "West"]
CHANNELS = ["Organic", "Paid Search", "Social", "Email", "Referral", "Direct"]
GENDERS = ["M", "F", "Other", "Prefer not to say"]
AGE_BRACKETS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
CATEGORIES = ["Electronics", "Clothing", "Home", "Beauty", "Sports", "Books"]

# Duplicate emails to inject
DUPLICATE_EMAILS = [
    "sarah.johnson@email.com",
    "michael.chen@email.com",
    "jennifer.williams@email.com"
]

def random_date(start_date: datetime, end_date: datetime) -> str:
    """Generate random date between start and end."""
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    result = start_date + timedelta(days=random_days)
    return result.strftime("%Y-%m-%d")

def generate_customer(customer_id: int, inject_duplicate: bool = False) -> Dict:
    """Generate a single customer record with realistic correlations."""

    # Gender and name
    gender = random.choice(GENDERS)
    if gender == "M":
        first_name = random.choice(FIRST_NAMES_M)
    elif gender == "F":
        first_name = random.choice(FIRST_NAMES_F)
    else:
        first_name = random.choice(FIRST_NAMES_M + FIRST_NAMES_F)

    last_name = random.choice(LAST_NAMES)
    middle_initial = "" if random.random() < MISSING_RATE_MIDDLE_INITIAL else random.choice(MIDDLE_INITIALS)

    # Email (with duplicates)
    if inject_duplicate and random.random() < 0.001:
        email = random.choice(DUPLICATE_EMAILS)
    else:
        email = f"{first_name.lower()}.{last_name.lower()}{customer_id}@email.com"

    # Phone (sometimes missing)
    phone = "" if random.random() < MISSING_RATE_PHONE else f"555-{random.randint(1000, 9999)}"

    # Signup date (2020-2024)
    signup_date = datetime.strptime(
        random_date(datetime(2020, 1, 1), datetime(2024, 3, 1)),
        "%Y-%m-%d"
    )

    # Customer lifetime
    customer_lifetime_days = (datetime(2024, 3, 16) - signup_date).days

    # Tier (influences revenue and behavior)
    # Weight toward Bronze/Silver for newer customers
    tier_weights = [0.50, 0.30, 0.15, 0.05] if customer_lifetime_days < 365 else [0.35, 0.30, 0.25, 0.10]
    tier = random.choices(TIERS, weights=tier_weights)[0]

    # Premium member (highly correlated with Gold/Platinum)
    premium_member = tier in ["Gold", "Platinum"] and random.random() < 0.70

    # Total orders (correlated with tier and lifetime)
    base_orders = {
        "Bronze": random.randint(5, 20),
        "Silver": random.randint(18, 35),
        "Gold": random.randint(30, 50),
        "Platinum": random.randint(50, 70)
    }[tier]

    # Adjust for lifetime (newer customers have fewer orders)
    lifetime_factor = min(1.0, customer_lifetime_days / 730)
    total_orders = max(1, int(base_orders * lifetime_factor))

    # Average order value (correlated with tier, with some whales)
    base_aov = {
        "Bronze": random.uniform(70, 120),
        "Silver": random.uniform(140, 200),
        "Gold": random.uniform(180, 250),
        "Platinum": random.uniform(280, 400)
    }[tier]

    # Inject outliers (whale customers)
    if random.random() < 0.01:
        base_aov *= random.uniform(2, 5)

    avg_order_value = round(base_aov, 2)
    total_revenue = round(avg_order_value * total_orders, 2)

    # Engagement metrics (correlated with tier and premium)
    engagement_multiplier = 1.0
    if premium_member:
        engagement_multiplier *= 1.5
    if tier == "Platinum":
        engagement_multiplier *= 1.3

    site_visits_30d = max(1, int(random.randint(15, 45) * engagement_multiplier))
    emails_opened_30d = max(0, int(random.randint(8, 25) * engagement_multiplier))

    # Cart abandons (inverse correlation with engagement)
    cart_abandons = max(0, int(random.randint(0, 6) * (1 / max(0.5, engagement_multiplier))))

    # Wishlist (correlated with engagement)
    items_in_wishlist = max(0, int(random.randint(2, 15) * engagement_multiplier))

    # Recency (days since last purchase)
    # At-risk customers have high recency
    at_risk_threshold = 60
    if random.random() < 0.15:  # 15% at risk
        recency_days = random.randint(at_risk_threshold, 180)
        at_risk_churn = True
    else:
        recency_days = random.randint(1, at_risk_threshold - 1)
        at_risk_churn = False

    # Last purchase date
    last_purchase_date = (datetime(2024, 3, 16) - timedelta(days=recency_days)).strftime("%Y-%m-%d")

    # Last login (1-30 days ago for active, 30-90 for at-risk)
    if at_risk_churn:
        last_login_days_ago = random.randint(30, 120)
    else:
        last_login_days_ago = random.randint(1, 30)
    last_login_date = (datetime(2024, 3, 16) - timedelta(days=last_login_days_ago)).strftime("%Y-%m-%d")

    # Email/SMS subscribed (correlated with engagement)
    email_subscribed = random.random() < (0.85 if engagement_multiplier > 1.0 else 0.60)
    sms_subscribed = random.random() < (0.50 if premium_member else 0.25)

    # Demographics
    region = random.choice(REGIONS)
    acquisition_channel = "" if random.random() < MISSING_RATE_ACQUISITION else random.choice(CHANNELS)
    age_bracket = random.choice(AGE_BRACKETS)

    # Top category (slight correlation with demographics)
    if age_bracket in ["18-24", "25-34"]:
        top_category = random.choice(["Electronics", "Clothing", "Beauty", "Sports"])
    elif age_bracket in ["55-64", "65+"]:
        top_category = random.choice(["Home", "Books", "Beauty"])
    else:
        top_category = random.choice(CATEGORIES)

    return {
        "customer_id": f"C{customer_id:04d}",
        "email": email,
        "first_name": first_name,
        "middle_initial": middle_initial,
        "last_name": last_name,
        "phone": phone,
        "signup_date": signup_date.strftime("%Y-%m-%d"),
        "last_purchase_date": last_purchase_date,
        "last_login_date": last_login_date,
        "customer_tier": tier,
        "region": region,
        "acquisition_channel": acquisition_channel,
        "gender": gender,
        "age_bracket": age_bracket,
        "top_category": top_category,
        "total_revenue": total_revenue,
        "avg_order_value": avg_order_value,
        "total_orders": total_orders,
        "site_visits_30d": site_visits_30d,
        "emails_opened_30d": emails_opened_30d,
        "cart_abandons": cart_abandons,
        "items_in_wishlist": items_in_wishlist,
        "customer_lifetime_days": customer_lifetime_days,
        "recency_days": recency_days,
        "email_subscribed": "TRUE" if email_subscribed else "FALSE",
        "sms_subscribed": "TRUE" if sms_subscribed else "FALSE",
        "premium_member": "TRUE" if premium_member else "FALSE",
        "at_risk_churn": "TRUE" if at_risk_churn else "FALSE"
    }

def main():
    """Generate the complete dataset."""

    # Field names
    fieldnames = [
        "customer_id", "email", "first_name", "middle_initial", "last_name", "phone",
        "signup_date", "last_purchase_date", "last_login_date",
        "customer_tier", "region", "acquisition_channel", "gender", "age_bracket", "top_category",
        "total_revenue", "avg_order_value", "total_orders",
        "site_visits_30d", "emails_opened_30d", "cart_abandons", "items_in_wishlist",
        "customer_lifetime_days", "recency_days",
        "email_subscribed", "sms_subscribed", "premium_member", "at_risk_churn"
    ]

    # Generate all customers
    customers = []
    for i in range(1, TOTAL_ROWS + 1):
        # Inject duplicates occasionally
        inject_dup = i > 1000 and i < 2000
        customer = generate_customer(i, inject_duplicate=inject_dup)
        customers.append(customer)

    # Write to CSV
    output_path = "/Users/mattbayne/Documents/SoftwareProjects/glimpse/public/ecommerce_customers.csv"
    with open(output_path, 'w', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(customers)

    print(f"✓ Generated {TOTAL_ROWS} customer records")
    print(f"✓ Saved to: {output_path}")
    print(f"\nDataset summary:")
    print(f"  - Rows: {TOTAL_ROWS}")
    print(f"  - Columns: {len(fieldnames)}")
    print(f"  - Missing data: ~10% in phone, middle_initial, acquisition_channel")
    print(f"  - Duplicate emails: {len(DUPLICATE_EMAILS)} email addresses used multiple times")
    print(f"  - Date range: 2020-01-01 to 2024-03-16")
    print(f"  - Correlations: tier↔revenue, engagement↔orders, recency↔churn")

if __name__ == "__main__":
    main()
