"""
Test script for the AI Development Studio Orchestrator
"""

import os
from dotenv import load_dotenv
from agent import create_agent

def test_orchestrator():
    """Test the orchestrator with a simple request"""
    # Load environment variables
    load_dotenv()
    
    # Create the agent
    agent = create_agent()
    
    # Test request
    test_request = {
        "goal": "Build a simple todo list app",
        "project_name": "TodoApp"
    }
    
    # Run the agent
    response = agent.run(test_request)
    
    # Print the response
    print("\nTest Results:")
    print("=============")
    print(f"Success: {response.success}")
    if response.success:
        print("\nDesign Specification:")
        print(response.content.get('design', {}))
        print("\nInfrastructure Plan:")
        print(response.content.get('infrastructure', {}))
        print("\nGenerated Application:")
        print(response.content.get('application', {}).get('file', ''))
    else:
        print(f"Error: {response.error}")

if __name__ == "__main__":
    test_orchestrator()