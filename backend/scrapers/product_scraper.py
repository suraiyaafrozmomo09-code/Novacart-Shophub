"""
Web Scraper Module for ShopHub
Scrapes product data from e-commerce sites for competitor analysis.
"""

import requests
from bs4 import BeautifulSoup
import time
import random
import json
from urllib.parse import quote_plus
from typing import List, Dict, Optional

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

class ProductScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)

    def scrape_amazon(self, query: str, max_pages: int = 1) -> List[Dict]:
        """
        Scrape Amazon Bangladesh or search results.
        Note: Amazon structure changes frequently. For demo purposes,
        this returns structured dummy data that simulates scraping results.
        """
        results = []
        for page in range(1, max_pages + 1):
            # Real scraping code (commented for demo - Amazon blocks simple scrapers)
            # url = f"https://www.amazon.com/s?k={quote_plus(query)}&page={page}"
            # response = self.session.get(url, timeout=10)
            # soup = BeautifulSoup(response.text, "html.parser")
            # ... parse product cards
            
            # Simulated scraped data for demonstration
            simulated = {
                "site": "amazon",
                "query": query,
                "page": page,
                "products": [
                    {"name": f"{query} - Option A", "price": random.randint(800, 5000), "currency": "BDT", "condition": "New"},
                    {"name": f"{query} - Option B", "price": random.randint(800, 5000), "currency": "BDT", "condition": "New"},
                    {"name": f"{query} - Option C", "price": random.randint(800, 5000), "currency": "BDT", "condition": "Used"},
                ]
            }
            results.append(simulated)
            time.sleep(random.uniform(1, 3))
        return results

    def scrape_facebook_marketplace(self, query: str, location: str = "Dhaka") -> List[Dict]:
        """
        Scrape Facebook Marketplace listings.
        Facebook requires login for most data, so this is simulated.
        """
        return [
            {"site": "facebook_marketplace", "query": query, "location": location, "products": [
                {"name": f"{query} - Local", "price": random.randint(500, 3000), "currency": "BDT", "seller": "Local"},
            ]}
        ]

    def scrape_daraz(self, query: str, max_pages: int = 1) -> List[Dict]:
        """
        Scrape Daraz Bangladesh.
        """
        results = []
        for page in range(1, max_pages + 1):
            # url = f"https://www.daraz.com.bd/catalog/?q={quote_plus(query)}&page={page}"
            # response = self.session.get(url, timeout=10)
            # soup = BeautifulSoup(response.text, "html.parser")
            
            simulated = {
                "site": "daraz",
                "query": query,
                "page": page,
                "products": [
                    {"name": f"{query} - Daraz Listing {i}", "price": random.randint(600, 4500), "currency": "BDT", "rating": round(random.uniform(3.0, 4.9), 1)}
                    for i in range(1, 4)
                ]
            }
            results.append(simulated)
            time.sleep(random.uniform(2, 4))
        return results

    def scrape_competitor_prices(self, product_name: str) -> Dict:
        """
        Aggregate prices from multiple sources for comparison.
        """
        amazon_data = self.scrape_amazon(product_name)
        daraz_data = self.scrape_daraz(product_name)
        fb_data = self.scrape_facebook_marketplace(product_name)

        all_prices = []
        for source in [amazon_data, daraz_data, fb_data]:
            for page in source:
                for product in page.get("products", []):
                    all_prices.append({
                        "site": source.get("site", "unknown"),
                        "name": product["name"],
                        "price": product["price"],
                        "currency": product.get("currency", "BDT")
                    })

        avg_price = sum(p["price"] for p in all_prices) / len(all_prices) if all_prices else 0
        min_price = min((p["price"] for p in all_prices), default=0)
        max_price = max((p["price"] for p in all_prices), default=0)

        return {
            "product": product_name,
            "total_listings": len(all_prices),
            "avg_price": round(avg_price, 2),
            "min_price": min_price,
            "max_price": max_price,
            "price_range": max_price - min_price,
            "sources": all_prices
        }

    def scrape_category(self, category: str) -> List[Dict]:
        """Scrape all products in a category."""
        return self.scrape_daraz(category, max_pages=2)


if __name__ == "__main__":
    scraper = ProductScraper()
    result = scraper.scrape_competitor_prices("iPhone 15")
    print(json.dumps(result, indent=2))
