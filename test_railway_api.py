#!/usr/bin/env python3
"""
Test Railway API Categories Endpoint
"""
import requests
import json

# Railway API base URL
RAILWAY_API_URL = "https://femdjango-production.up.railway.app"

def test_categories_endpoint():
    """Test the categories endpoint on Railway"""
    try:
        print("🔌 Testing Railway API categories endpoint...")
        print(f"URL: {RAILWAY_API_URL}/api/business/categories/")
        print("-" * 60)
        
        # Make the request
        response = requests.get(f"{RAILWAY_API_URL}/api/business/categories/")
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print("-" * 60)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ API Response:")
            
            # Check response format
            if isinstance(data, list):
                print(f"📊 Response Type: Direct Array")
                print(f"📊 Total Categories: {len(data)}")
                print(f"📊 First 3 categories:")
                for i, cat in enumerate(data[:3]):
                    print(f"  {i+1}. ID: {cat.get('id')}, Name: {cat.get('name')}, Slug: {cat.get('slug')}")
                    
            elif isinstance(data, dict) and 'results' in data:
                print(f"📊 Response Type: Paginated Object")
                print(f"📊 Total Count: {data.get('count', 'N/A')}")
                print(f"📊 Results Count: {len(data.get('results', []))}")
                print(f"📊 Has Next Page: {data.get('next') is not None}")
                print(f"📊 Has Previous Page: {data.get('previous') is not None}")
                print(f"📊 First 3 categories:")
                for i, cat in enumerate(data.get('results', [])[:3]):
                    print(f"  {i+1}. ID: {cat.get('id')}, Name: {cat.get('name')}, Slug: {cat.get('slug')}")
            else:
                print(f"📊 Response Type: Unknown format")
                print(f"📊 Response: {json.dumps(data, indent=2)}")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Could not connect to Railway API")
    except requests.exceptions.Timeout:
        print("❌ Timeout Error: Request timed out")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_health_endpoint():
    """Test the health endpoint to verify Railway is running"""
    try:
        print("\n🏥 Testing Railway health endpoint...")
        response = requests.get(f"{RAILWAY_API_URL}/health/")
        print(f"Health Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Railway is healthy!")
        else:
            print(f"⚠️ Railway health check failed: {response.text}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")

if __name__ == "__main__":
    test_health_endpoint()
    test_categories_endpoint()
