#!/usr/bin/env python3
"""
CHAOS Task Manager Backend API Test Suite
Tests all CRUD operations and validates API functionality
"""

import requests
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    print("❌ ERROR: REACT_APP_BACKEND_URL not found in environment")
    exit(1)

API_BASE = f"{BACKEND_URL}/api"

print(f"🔗 Testing API at: {API_BASE}")

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
    
    def success(self, test_name):
        print(f"✅ {test_name}")
        self.passed += 1
    
    def failure(self, test_name, error):
        print(f"❌ {test_name}: {error}")
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
    
    def summary(self):
        total = self.passed + self.failed
        print(f"\n📊 TEST SUMMARY:")
        print(f"   Total: {total}")
        print(f"   Passed: {self.passed}")
        print(f"   Failed: {self.failed}")
        if self.errors:
            print(f"\n❌ FAILURES:")
            for error in self.errors:
                print(f"   - {error}")
        return self.failed == 0

results = TestResults()

def test_api_root():
    """Test GET /api/ endpoint"""
    try:
        response = requests.get(f"{API_BASE}/")
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "CHAOS - The Anti-Task Manager API":
                results.success("GET /api/ - Root endpoint returns correct message")
            else:
                results.failure("GET /api/ - Root endpoint", f"Wrong message: {data}")
        else:
            results.failure("GET /api/ - Root endpoint", f"Status {response.status_code}")
    except Exception as e:
        results.failure("GET /api/ - Root endpoint", f"Exception: {str(e)}")

def test_create_task():
    """Test POST /api/tasks endpoint"""
    test_tasks = [
        {
            "text": "Complete project documentation",
            "x": 150.0,
            "y": 200.0,
            "priority": "HIGH",
            "color": "red",
            "date": "2025-01-15"
        },
        {
            "text": "Review code changes",
            "x": 300.0,
            "y": 100.0,
            "priority": "LOW",
            "color": "teal"
        },
        {
            "text": "Schedule team meeting",
            "x": 450.0,
            "y": 250.0,
            "priority": "HIGH",
            "color": "blue",
            "date": "2025-01-20"
        }
    ]
    
    created_tasks = []
    
    for i, task_data in enumerate(test_tasks):
        try:
            response = requests.post(f"{API_BASE}/tasks", json=task_data)
            if response.status_code == 200:
                task = response.json()
                
                # Validate task structure
                required_fields = ["id", "text", "x", "y", "width", "height", "priority", "color", "completed", "created_at"]
                missing_fields = [field for field in required_fields if field not in task]
                
                if missing_fields:
                    results.failure(f"POST /api/tasks - Task {i+1}", f"Missing fields: {missing_fields}")
                    continue
                
                # Validate UUID format
                try:
                    uuid.UUID(task["id"])
                    results.success(f"POST /api/tasks - Task {i+1} created with valid UUID")
                except ValueError:
                    results.failure(f"POST /api/tasks - Task {i+1}", "Invalid UUID format")
                    continue
                
                # Validate data integrity
                if (task["text"] == task_data["text"] and 
                    task["x"] == task_data["x"] and 
                    task["y"] == task_data["y"] and
                    task["priority"] == task_data["priority"] and
                    task["color"] == task_data["color"] and
                    task["completed"] == False):
                    results.success(f"POST /api/tasks - Task {i+1} data integrity")
                    created_tasks.append(task)
                else:
                    results.failure(f"POST /api/tasks - Task {i+1}", "Data integrity check failed")
            else:
                results.failure(f"POST /api/tasks - Task {i+1}", f"Status {response.status_code}")
        except Exception as e:
            results.failure(f"POST /api/tasks - Task {i+1}", f"Exception: {str(e)}")
    
    return created_tasks

def test_get_tasks(expected_count=0):
    """Test GET /api/tasks endpoint"""
    try:
        response = requests.get(f"{API_BASE}/tasks")
        if response.status_code == 200:
            tasks = response.json()
            
            if isinstance(tasks, list):
                results.success(f"GET /api/tasks - Returns list with {len(tasks)} tasks")
                
                # Validate sorting (created_at desc)
                if len(tasks) > 1:
                    sorted_correctly = True
                    for i in range(len(tasks) - 1):
                        current_time = datetime.fromisoformat(tasks[i]["created_at"].replace('Z', '+00:00'))
                        next_time = datetime.fromisoformat(tasks[i+1]["created_at"].replace('Z', '+00:00'))
                        if current_time < next_time:
                            sorted_correctly = False
                            break
                    
                    if sorted_correctly:
                        results.success("GET /api/tasks - Tasks sorted by created_at desc")
                    else:
                        results.failure("GET /api/tasks - Sorting", "Tasks not sorted by created_at desc")
                
                # Validate no completed tasks
                completed_tasks = [task for task in tasks if task.get("completed", False)]
                if not completed_tasks:
                    results.success("GET /api/tasks - No completed tasks returned")
                else:
                    results.failure("GET /api/tasks - Completed tasks", f"Found {len(completed_tasks)} completed tasks")
                
                return tasks
            else:
                results.failure("GET /api/tasks", "Response is not a list")
                return []
        else:
            results.failure("GET /api/tasks", f"Status {response.status_code}")
            return []
    except Exception as e:
        results.failure("GET /api/tasks", f"Exception: {str(e)}")
        return []

def test_update_task(task_id):
    """Test PUT /api/tasks/{task_id} endpoint"""
    update_data = {
        "text": "Updated task description",
        "x": 500.0,
        "y": 300.0,
        "width": 400.0,
        "height": 250.0,
        "priority": "LOW",
        "color": "green"
    }
    
    try:
        response = requests.put(f"{API_BASE}/tasks/{task_id}", json=update_data)
        if response.status_code == 200:
            updated_task = response.json()
            
            # Validate updates
            updates_correct = True
            for key, value in update_data.items():
                if updated_task.get(key) != value:
                    updates_correct = False
                    break
            
            if updates_correct:
                results.success(f"PUT /api/tasks/{task_id} - Task updated successfully")
                return updated_task
            else:
                results.failure(f"PUT /api/tasks/{task_id}", "Update data not applied correctly")
        else:
            results.failure(f"PUT /api/tasks/{task_id}", f"Status {response.status_code}")
    except Exception as e:
        results.failure(f"PUT /api/tasks/{task_id}", f"Exception: {str(e)}")
    
    return None

def test_complete_task(task_id):
    """Test POST /api/tasks/{task_id}/complete endpoint"""
    try:
        response = requests.post(f"{API_BASE}/tasks/{task_id}/complete")
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "completed" in data["message"].lower():
                results.success(f"POST /api/tasks/{task_id}/complete - Task completed")
                return True
            else:
                results.failure(f"POST /api/tasks/{task_id}/complete", f"Unexpected response: {data}")
        else:
            results.failure(f"POST /api/tasks/{task_id}/complete", f"Status {response.status_code}")
    except Exception as e:
        results.failure(f"POST /api/tasks/{task_id}/complete", f"Exception: {str(e)}")
    
    return False

def test_delete_task(task_id):
    """Test DELETE /api/tasks/{task_id} endpoint"""
    try:
        response = requests.delete(f"{API_BASE}/tasks/{task_id}")
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "deleted" in data["message"].lower():
                results.success(f"DELETE /api/tasks/{task_id} - Task deleted")
                return True
            else:
                results.failure(f"DELETE /api/tasks/{task_id}", f"Unexpected response: {data}")
        else:
            results.failure(f"DELETE /api/tasks/{task_id}", f"Status {response.status_code}")
    except Exception as e:
        results.failure(f"DELETE /api/tasks/{task_id}", f"Exception: {str(e)}")
    
    return False

def test_error_handling():
    """Test error handling for non-existent task IDs"""
    fake_id = str(uuid.uuid4())
    
    # Test update non-existent task
    try:
        response = requests.put(f"{API_BASE}/tasks/{fake_id}", json={"text": "test"})
        if response.status_code == 404:
            results.success("PUT /api/tasks/{fake_id} - 404 for non-existent task")
        else:
            results.failure("PUT /api/tasks/{fake_id}", f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.failure("PUT /api/tasks/{fake_id}", f"Exception: {str(e)}")
    
    # Test delete non-existent task
    try:
        response = requests.delete(f"{API_BASE}/tasks/{fake_id}")
        if response.status_code == 404:
            results.success("DELETE /api/tasks/{fake_id} - 404 for non-existent task")
        else:
            results.failure("DELETE /api/tasks/{fake_id}", f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.failure("DELETE /api/tasks/{fake_id}", f"Exception: {str(e)}")
    
    # Test complete non-existent task
    try:
        response = requests.post(f"{API_BASE}/tasks/{fake_id}/complete")
        if response.status_code == 404:
            results.success("POST /api/tasks/{fake_id}/complete - 404 for non-existent task")
        else:
            results.failure("POST /api/tasks/{fake_id}/complete", f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.failure("POST /api/tasks/{fake_id}/complete", f"Exception: {str(e)}")

def main():
    """Run all tests"""
    print("🚀 Starting CHAOS Task Manager Backend API Tests\n")
    
    # Test 1: API Root
    print("📋 Testing API Root Endpoint...")
    test_api_root()
    
    # Test 2: Create Tasks
    print("\n📋 Testing Task Creation...")
    created_tasks = test_create_task()
    
    # Test 3: Get Tasks
    print("\n📋 Testing Get Tasks...")
    all_tasks = test_get_tasks()
    
    if created_tasks:
        # Test 4: Update Task
        print("\n📋 Testing Task Update...")
        test_update_task(created_tasks[0]["id"])
        
        # Test 5: Complete Task
        print("\n📋 Testing Task Completion...")
        if test_complete_task(created_tasks[1]["id"]):
            # Verify completed task doesn't appear in GET /tasks
            print("\n📋 Verifying completed task filtering...")
            remaining_tasks = test_get_tasks()
            completed_task_found = any(task["id"] == created_tasks[1]["id"] for task in remaining_tasks)
            if not completed_task_found:
                results.success("GET /api/tasks - Completed task filtered out")
            else:
                results.failure("GET /api/tasks - Completed task filtering", "Completed task still appears in results")
        
        # Test 6: Delete Task
        print("\n📋 Testing Task Deletion...")
        if len(created_tasks) > 2:
            test_delete_task(created_tasks[2]["id"])
    
    # Test 7: Error Handling
    print("\n📋 Testing Error Handling...")
    test_error_handling()
    
    # Final Summary
    print("\n" + "="*50)
    success = results.summary()
    
    if success:
        print("\n🎉 ALL TESTS PASSED! Backend API is ready for frontend integration.")
    else:
        print("\n⚠️  Some tests failed. Please review the issues above.")
    
    return success

if __name__ == "__main__":
    main()