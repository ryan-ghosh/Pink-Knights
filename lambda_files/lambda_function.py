import json
import boto3
import os

# Initialize the Bedrock Runtime client
bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1') 

def lambda_handler(event, context):
    try:
        # 1. Extract the single profile from the frontend payload
        body = json.loads(event.get('body', '{}'))
        user_partner_profile = body.get('user_partner_profile', '')
        
        if not user_partner_profile:
            return {
                "statusCode": 400, 
                "body": json.dumps({"error": "Missing user_partner_profile in the request body."})
            }

        # Use the cross-region Inference Profile ID for Claude 4.5 Haiku
        model_id = "us.anthropic.claude-haiku-4-5-20251001-v1:0"

        # ==========================================
        # MODEL 1: GENERATE THE CANDIDATE PROFILE
        # ==========================================
        m1_system_prompt = """You are a creative AI matchmaking engine. 
Based on the provided user profile, generate a realistic, 3-sentence dating profile for a potential candidate. 
Give the candidate a distinct personality, career, and hobbies. 
Do not include any introductory or conversational text; return strictly the profile text."""
        
        m1_user_prompt = f"User's Profile:\n{user_partner_profile}\n\nGenerate the candidate profile."

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

You must respond strictly in JSON format with exactly two keys:
- "score": an integer from 1 to 100 representing their overall compatibility.
- "summary": a 2-3 paragraph summary of how the date went, detailing their interaction, what they talked about, and why it worked or failed."""

        m2_user_prompt = f"""
Here are the profiles for the date simulation:

User's Profile:
{user_partner_profile}

Candidate Profile (Generated):
{candidate_model_profile}

Simulate the date and return the JSON response."""

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
        
        # Parse the JSON so we can inject the generated profile into the final return payload
        final_simulation_data = json.loads(response_text)
        final_simulation_data['candidate_profile'] = candidate_model_profile

        # Return the combined data back to the frontend
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(final_simulation_data)
        }

    except Exception as e:
        print(f"Error occurred during execution: {str(e)}") 
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"Internal server error: {str(e)}"})
        }
