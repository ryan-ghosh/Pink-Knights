import json
import boto3
import os

# Initialize the Bedrock Runtime client
bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1') 

def lambda_handler(event, context):
    try:
        # 1. Extract the single profile from the frontend payload
        # Handle cases where body might be None, empty, or not a string
        event_body = event.get('body')
        
        # If body is None or not a string, use empty dict
        if event_body is None:
            event_body = '{}'
        elif not isinstance(event_body, str):
            # If body is already a dict (some API Gateway configurations), use it directly
            if isinstance(event_body, dict):
                body = event_body
            else:
                event_body = json.dumps(event_body) if event_body else '{}'
        
        # Parse the body string to a dict
        if isinstance(event_body, str):
            if not event_body.strip():
                event_body = '{}'
            try:
                body = json.loads(event_body)
            except json.JSONDecodeError as e:
                print(f"Failed to parse body as JSON: {e}")
                print(f"Body received: {event_body[:500]}")  # Log first 500 chars
                return {
                    "statusCode": 400,
                    "headers": {"Content-Type": "application/json"},
                    "body": json.dumps({"error": "Invalid JSON in request body."})
                }
        else:
            body = event_body
        
        # Extract user_partner_profile
        user_partner_profile = body.get('user_partner_profile', '') if isinstance(body, dict) else ''
        
        # Log what we received for debugging
        print(f"Event body type: {type(event_body)}")
        print(f"Parsed body type: {type(body)}")
        print(f"Body keys: {list(body.keys()) if isinstance(body, dict) else 'Not a dict'}")
        print(f"user_partner_profile length: {len(user_partner_profile) if user_partner_profile else 0}")
        print(f"user_partner_profile (first 200 chars): {user_partner_profile[:200] if user_partner_profile else 'EMPTY'}")
        print(f"user_partner_profile (full): {user_partner_profile if user_partner_profile else 'EMPTY'}")
        
        # Validate profile is not empty and has meaningful content
        # Lower threshold to 10 characters to be more lenient
        if not user_partner_profile or len(user_partner_profile.strip()) < 10:
            print(f"❌ Profile validation failed: length={len(user_partner_profile) if user_partner_profile else 0}")
            print(f"❌ Profile preview: {user_partner_profile[:200] if user_partner_profile else 'EMPTY'}")
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({
                    "success": False,
                    "error": "Please provide more information. Fill out more form fields or speak longer during the voice conversation."
                })
            }

        # Use the cross-region Inference Profile ID for Claude 4.5 Haiku
        model_id = "us.anthropic.claude-haiku-4-5-20251001-v1:0"

        # ==========================================
        # MODEL 1: GENERATE THE CANDIDATE PROFILE
        # ==========================================
        m1_system_prompt = """You are a creative AI matchmaking engine. 
Based on the provided user profile, generate a realistic, 3-sentence dating profile for a potential candidate. 
Give the candidate a distinct personality, career, and hobbies. 
Do not include any introductory or conversational text; return strictly the profile text.
IMPORTANT: The user profile will be provided below. Use ALL the information provided to create a well-matched candidate."""
        
        m1_user_prompt = f"""User's Profile:
{user_partner_profile}

Based on this user profile, generate a realistic 3-sentence dating profile for a potential candidate who would be compatible with this user. The candidate should have a distinct personality, career, and hobbies that complement the user's profile."""
        
        # Debug: Log what we're sending to Model 1
        print(f"\n📤 Model 1 Prompt (first 300 chars): {m1_user_prompt[:300]}")
        print(f"📤 Model 1 Prompt (full length): {len(m1_user_prompt)} characters")

        m1_response = bedrock_client.converse(
            modelId=model_id,
            messages=[{"role": "user", "content": [{"text": m1_user_prompt}]}],
            system=[{"text": m1_system_prompt}],
            inferenceConfig={
                "maxTokens": 300,
                "temperature": 0.8 # Slightly higher temperature for more diverse personality generation
            }
        )
        
        # Extract the generated candidate profile text
        candidate_model_profile = m1_response['output']['message']['content'][0]['text'].strip()


        # ==========================================
        # MODEL 2: SIMULATE THE DATE
        # ==========================================
        m2_system_prompt = """You are an AI Date Simulator running a matchmaking simulation. 
Your task is to take a user's ideal partner profile and a candidate AI model's profile, and simulate a first date between them. 
Analyze their compatibility, simulate their conversation and chemistry, and output the result.

IMPORTANT: Both profiles will be provided below. Use ALL the information from both profiles to create a realistic date simulation.

You must respond strictly in JSON format with the following structure:
{
  "score": <integer from 1 to 100>,
  "summary": "<2-3 paragraph summary of the date>",
  "meta": {
    "compatibility_factors": {
      "shared_interests": "<comma-separated list of shared interests>",
      "humor_alignment": "<description of how well their humor styles match>",
      "lifestyle_match": "<description of lifestyle compatibility>",
      "conversation_ease": "<description of how easily they conversed>"
    },
    "potential_concerns": "<any concerns or friction points, or empty string if none>"
  }
}

The compatibility_factors should be brief, descriptive strings. The summary should be detailed and engaging. Base your analysis on the actual profile information provided."""

        m2_user_prompt = f"""
Here are the profiles for the date simulation:

User's Profile:
{user_partner_profile}

Candidate Profile (Generated):
{candidate_model_profile}

Simulate the date and return the JSON response."""
        
        # Debug: Log what we're sending to Model 2
        print(f"\n📤 Model 2 Prompt (first 500 chars): {m2_user_prompt[:500]}")
        print(f"📤 Model 2 Prompt (full length): {len(m2_user_prompt)} characters")
        print(f"📤 Candidate profile length: {len(candidate_model_profile)} characters")

        m2_response = bedrock_client.converse(
            modelId=model_id,
            messages=[{"role": "user", "content": [{"text": m2_user_prompt}]}],
            system=[{"text": m2_system_prompt}],
            inferenceConfig={
                "maxTokens": 1000,
                "temperature": 0.7 
            }
        )
        
        # Extract and clean Model 2's JSON response
        response_text = m2_response['output']['message']['content'][0]['text']
        response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        # Try to extract just the JSON part (handle cases where AI adds extra text)
        # Find the first { and last } to extract valid JSON
        first_brace = response_text.find('{')
        last_brace = response_text.rfind('}')
        
        if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
            response_text = response_text[first_brace:last_brace + 1]
        
        # Parse the JSON so we can inject the generated profile into the final return payload
        try:
            final_simulation_data = json.loads(response_text)
        except json.JSONDecodeError as json_error:
            # If JSON parsing fails, log the error and return a helpful error message
            error_msg = f"Failed to parse AI response as JSON: {str(json_error)}. Response text (first 500 chars): {response_text[:500]}"
            print(error_msg)
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"success": False, "error": "Failed to parse AI response. Please try again."})
            }
        
        # Ensure meta structure exists
        if 'meta' not in final_simulation_data:
            final_simulation_data['meta'] = {}
        
        # Add candidate_profile to meta
        final_simulation_data['meta']['candidate_profile'] = candidate_model_profile
        
        # Ensure compatibility_factors exists
        if 'compatibility_factors' not in final_simulation_data['meta']:
            final_simulation_data['meta']['compatibility_factors'] = {}
        
        # Ensure potential_concerns exists
        if 'potential_concerns' not in final_simulation_data['meta']:
            final_simulation_data['meta']['potential_concerns'] = ""

        # Return the combined data back to the frontend
        # Ensure the body is clean JSON with no extra data
        response_body = json.dumps(final_simulation_data, ensure_ascii=False)
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": response_body
        }

    except json.JSONDecodeError as json_error:
        # Handle JSON parsing errors specifically
        error_msg = f"JSON parsing error: {str(json_error)}"
        print(error_msg)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"success": False, "error": "Failed to process response. Please try again."})
        }
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        error_msg = str(e)
        # Truncate very long error messages to avoid issues
        if len(error_msg) > 500:
            error_msg = error_msg[:500] + "..."
        print(f"Error occurred during execution: {error_msg}")
        print(f"Traceback: {error_details}")
        # Ensure the error response is clean JSON
        try:
            error_response = {
                "success": False,
                "error": f"Internal server error: {error_msg}"
            }
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps(error_response)
            }
        except Exception as final_error:
            # Last resort - return minimal error
            return {
                "statusCode": 500,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"success": False, "error": "An unexpected error occurred"})
            }
