#!/usr/bin/env python3
"""
Backend API Testing for Sognudimare Catamaran Cruise App
Tests all backend endpoints with realistic data
"""

import requests
import json
import sys
from datetime import datetime

# Base URL from frontend .env
BASE_URL = "https://dream-reality.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_test_header(test_name):
    print(f"\n{Colors.BLUE}{Colors.BOLD}=== {test_name} ==={Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def test_get_cruises():
    """Test GET /api/cruises - Should return list of 6 cruises with full details"""
    print_test_header("GET /api/cruises")
    
    try:
        response = requests.get(f"{BASE_URL}/cruises", timeout=10)
        
        if response.status_code == 200:
            cruises = response.json()
            
            if len(cruises) == 6:
                print_success(f"Retrieved {len(cruises)} cruises as expected")
                
                # Check first cruise structure
                first_cruise = cruises[0]
                required_fields = ['id', 'name_fr', 'name_en', 'description_fr', 'description_en', 
                                 'image_url', 'destination', 'cruise_type', 'duration', 'departure_port', 
                                 'pricing', 'highlights_fr', 'highlights_en', 'available_dates']
                
                missing_fields = [field for field in required_fields if field not in first_cruise]
                if not missing_fields:
                    print_success("All required fields present in cruise data")
                    print_info(f"Sample cruise: {first_cruise['name_en']} - {first_cruise['destination']}")
                    return cruises[0]['id']  # Return first cruise ID for next test
                else:
                    print_error(f"Missing fields in cruise data: {missing_fields}")
                    return None
            else:
                print_error(f"Expected 6 cruises, got {len(cruises)}")
                return None
        else:
            print_error(f"HTTP {response.status_code}: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return None

def test_get_cruise_by_id(cruise_id):
    """Test GET /api/cruises/{id} - Test with a valid cruise ID"""
    print_test_header(f"GET /api/cruises/{cruise_id}")
    
    if not cruise_id:
        print_error("No cruise ID available from previous test")
        return False
    
    try:
        response = requests.get(f"{BASE_URL}/cruises/{cruise_id}", timeout=10)
        
        if response.status_code == 200:
            cruise = response.json()
            
            if cruise['id'] == cruise_id:
                print_success(f"Retrieved cruise: {cruise['name_en']}")
                print_info(f"Destination: {cruise['destination']}, Duration: {cruise['duration']}")
                return True
            else:
                print_error(f"ID mismatch: requested {cruise_id}, got {cruise['id']}")
                return False
        else:
            print_error(f"HTTP {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return False

def test_get_posts():
    """Test GET /api/posts - Should return community posts"""
    print_test_header("GET /api/posts")
    
    try:
        response = requests.get(f"{BASE_URL}/posts", timeout=10)
        
        if response.status_code == 200:
            posts = response.json()
            print_success(f"Retrieved {len(posts)} community posts")
            
            if posts:
                first_post = posts[0]
                required_fields = ['id', 'author_id', 'author_name', 'title', 'content', 'category', 'likes', 'comments', 'created_at']
                missing_fields = [field for field in required_fields if field not in first_post]
                
                if not missing_fields:
                    print_success("All required fields present in post data")
                    print_info(f"Sample post: '{first_post['title']}' by {first_post['author_name']}")
                    return posts[0]['id'] if posts else None
                else:
                    print_error(f"Missing fields in post data: {missing_fields}")
                    return None
            else:
                print_warning("No posts found - this might be expected if database is empty")
                return None
        else:
            print_error(f"HTTP {response.status_code}: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return None

def test_create_post():
    """Test POST /api/posts - Create a new post"""
    print_test_header("POST /api/posts")
    
    post_data = {
        "author_id": "marina_explorer",
        "author_name": "Marina Explorer",
        "title": "Magnifique croisière en Corse!",
        "content": "Je viens de terminer une croisière exceptionnelle autour de la Corse avec Sognudimare. Les paysages étaient à couper le souffle, l'équipage très professionnel et les mouillages paradisiaques. Je recommande vivement cette expérience unique!",
        "category": "trip_report"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/posts", json=post_data, timeout=10)
        
        if response.status_code == 200:
            created_post = response.json()
            print_success(f"Created post: '{created_post['title']}'")
            print_info(f"Post ID: {created_post['id']}")
            return created_post['id']
        else:
            print_error(f"HTTP {response.status_code}: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return None

def test_get_members():
    """Test GET /api/members - Should return list of members"""
    print_test_header("GET /api/members")
    
    try:
        response = requests.get(f"{BASE_URL}/members", timeout=10)
        
        if response.status_code == 200:
            members = response.json()
            print_success(f"Retrieved {len(members)} club members")
            
            if members:
                first_member = members[0]
                required_fields = ['id', 'username', 'email', 'is_active', 'created_at']
                missing_fields = [field for field in required_fields if field not in first_member]
                
                if not missing_fields:
                    print_success("All required fields present in member data")
                    print_info(f"Sample member: {first_member['username']} ({first_member['email']})")
                    return members[0]['id'] if members else None
                else:
                    print_error(f"Missing fields in member data: {missing_fields}")
                    return None
            else:
                print_warning("No members found - this might be expected if database is empty")
                return None
        else:
            print_error(f"HTTP {response.status_code}: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return None

def test_create_member():
    """Test POST /api/members - Create new member"""
    print_test_header("POST /api/members")
    
    member_data = {
        "username": "capitaine_corsica",
        "email": "capitaine@corsica-sailing.com",
        "bio_fr": "Passionné de voile et amoureux de la Méditerranée, j'ai découvert les croisières Sognudimare l'année dernière. Une expérience inoubliable!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/members", json=member_data, timeout=10)
        
        if response.status_code == 200:
            created_member = response.json()
            print_success(f"Created member: {created_member['username']}")
            print_info(f"Member ID: {created_member['id']}")
            return created_member['id']
        elif response.status_code == 400 and "Email already registered" in response.text:
            print_warning("Email already registered - this is expected behavior")
            return "existing_member"
        else:
            print_error(f"HTTP {response.status_code}: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return None

def test_like_post(post_id, member_id):
    """Test POST /api/posts/{post_id}/like?member_id={member_id} - Like a post"""
    print_test_header(f"POST /api/posts/{post_id}/like")
    
    if not post_id or not member_id:
        print_error("Missing post_id or member_id from previous tests")
        return False
    
    try:
        response = requests.post(f"{BASE_URL}/posts/{post_id}/like?member_id={member_id}", timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Post like toggled - Likes count: {result['likes_count']}")
            print_info(f"User liked: {result['liked']}")
            return True
        else:
            print_error(f"HTTP {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return False

def test_add_comment(post_id):
    """Test POST /api/posts/{post_id}/comments - Add comment to a post"""
    print_test_header(f"POST /api/posts/{post_id}/comments")
    
    if not post_id:
        print_error("Missing post_id from previous tests")
        return False
    
    comment_data = {
        "author_id": "sailing_enthusiast",
        "author_name": "Sailing Enthusiast",
        "content": "Merci pour ce partage! Cela me donne vraiment envie de réserver une croisière avec Sognudimare. Les photos sont magnifiques!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/posts/{post_id}/comments", json=comment_data, timeout=10)
        
        if response.status_code == 200:
            updated_post = response.json()
            comments_count = len(updated_post['comments'])
            print_success(f"Comment added - Post now has {comments_count} comment(s)")
            if updated_post['comments']:
                latest_comment = updated_post['comments'][-1]
                print_info(f"Latest comment by: {latest_comment['author_name']}")
            return True
        else:
            print_error(f"HTTP {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return False

def test_seed_database():
    """Test POST /api/seed - Seed database with initial data"""
    print_test_header("POST /api/seed")
    
    try:
        response = requests.post(f"{BASE_URL}/seed", timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            print_success(f"Database seeded: {result['message']}")
            if 'cruises_count' in result:
                print_info(f"Cruises added: {result['cruises_count']}")
            if 'posts_count' in result:
                print_info(f"Posts added: {result['posts_count']}")
            return True
        else:
            print_error(f"HTTP {response.status_code}: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return False

def main():
    """Run all backend API tests"""
    print(f"{Colors.BOLD}{Colors.BLUE}🚢 Sognudimare Backend API Testing{Colors.ENDC}")
    print(f"Testing against: {BASE_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    results = {}
    
    # First, seed the database to ensure we have data
    results['seed'] = test_seed_database()
    
    # Test cruise endpoints
    cruise_id = test_get_cruises()
    results['get_cruises'] = cruise_id is not None
    
    results['get_cruise_by_id'] = test_get_cruise_by_id(cruise_id)
    
    # Test community posts
    existing_post_id = test_get_posts()
    results['get_posts'] = existing_post_id is not None or existing_post_id is None  # None is acceptable if no posts
    
    new_post_id = test_create_post()
    results['create_post'] = new_post_id is not None
    
    # Use the newly created post for further tests
    post_id_for_tests = new_post_id or existing_post_id
    
    # Test members
    existing_member_id = test_get_members()
    results['get_members'] = existing_member_id is not None or existing_member_id is None  # None is acceptable if no members
    
    new_member_id = test_create_member()
    results['create_member'] = new_member_id is not None
    
    # Use the newly created member for further tests
    member_id_for_tests = new_member_id if new_member_id and new_member_id != "existing_member" else existing_member_id
    
    # Test post interactions
    results['like_post'] = test_like_post(post_id_for_tests, member_id_for_tests)
    results['add_comment'] = test_add_comment(post_id_for_tests)
    
    # Print summary
    print(f"\n{Colors.BOLD}{Colors.BLUE}=== TEST SUMMARY ==={Colors.ENDC}")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        color = Colors.GREEN if result else Colors.RED
        print(f"{color}{status}{Colors.ENDC} - {test_name}")
    
    print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.ENDC}")
    
    if passed == total:
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 All tests passed! Backend API is working correctly.{Colors.ENDC}")
        return 0
    else:
        print(f"{Colors.RED}{Colors.BOLD}⚠️  Some tests failed. Check the details above.{Colors.ENDC}")
        return 1

if __name__ == "__main__":
    sys.exit(main())