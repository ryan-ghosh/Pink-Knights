import json
import boto3
import os
import re

# Initialize the Bedrock Runtime client
bedrock_client = boto3.client('bedrock-runtime', region_name='us-east-1')

# ==========================================
# HARDCODED CANDIDATE PROFILES FOR DEMO
# ==========================================
DEMO_CANDIDATE_PROFILES = [
    # FEMALE PROFILES
    {
        "name": "Alex - The Creative Nomad (Female)",
        "profile": "I'm a freelance graphic designer who spends weekends exploring trail systems and discovering new coffee shops in converted barns—hiking boots and a well-worn vinyl collection are non-negotiable. My sense of humor tends toward the absurdist, and I appreciate someone who can laugh at the ridiculousness of everyday life without needing an explanation. Fair warning: I'm deeply suspicious of anyone who describes themselves as 'brutally honest' and I'd rather discuss literally anything other than UI frameworks over dinner."
    },
    {
        "name": "Riley - The Culinary Artist (Female)",
        "profile": "I'm a pastry chef at a Michelin-starred restaurant who moonlights as a food blogger, documenting my quest to find the perfect croissant in every neighborhood. I'm passionate about sustainable cooking, farmer's markets, and teaching people that good food doesn't have to be complicated. When I'm not in the kitchen, I'm probably at a jazz club, learning a new language, or planning my next food tour abroad. I believe the way to someone's heart is through their stomach, but I'm also looking for someone who can make me laugh until I cry."
    },
    {
        "name": "Casey - The Musician (Female)",
        "profile": "I'm a jazz pianist who plays at local venues three nights a week and teaches music theory during the day. Music is my language, and I express emotions through melodies better than words sometimes. I collect vintage records, write songs about everyday moments, and believe the best conversations happen at 2am over a shared plate of diner fries. I'm looking for someone who appreciates the arts, understands the creative process, and doesn't mind that my schedule is a bit unconventional."
    },
    {
        "name": "Taylor - The Wellness Advocate (Female)",
        "profile": "I'm a yoga instructor and wellness coach who's passionate about holistic health, meditation, and helping people find balance in their lives. I start every morning with a sunrise run and end most days with a home-cooked meal and a good documentary. I'm deeply spiritual but not preachy about it, and I believe in living intentionally and mindfully. I'm looking for someone who values self-care, personal growth, and authentic connections—someone who understands that taking care of yourself isn't selfish, it's necessary."
    },
    {
        "name": "Quinn - The World Traveler (Female)",
        "profile": "I'm a travel photographer who's been to 47 countries and counting, documenting cultures, landscapes, and human stories along the way. I work remotely as a freelance writer and photographer, which means I'm often planning my next adventure while finishing my current one. I love trying new foods, learning local customs, and meeting people from different backgrounds. I'm looking for someone who shares my wanderlust but also appreciates the beauty of coming home—someone who understands that the best trips are the ones you take with someone special."
    },
    {
        "name": "Avery - The Bookworm (Female)",
        "profile": "I'm a librarian who runs a book club and hosts monthly author readings at independent bookstores around the city. I read about 50 books a year across all genres, but I have a soft spot for magical realism and historical fiction. When I'm not reading, I'm probably writing short stories, exploring used bookstores, or having deep conversations about character development over coffee. I believe the best relationships are built on shared stories, both the ones we read and the ones we create together."
    },
    # MALE PROFILES
    {
        "name": "Jordan - The Tech Entrepreneur (Male)",
        "profile": "I'm a startup founder who's passionate about building products that make people's lives easier, but I leave work at the office and recharge by cooking elaborate meals for friends and exploring hidden speakeasies. I love deep conversations about philosophy and psychology, and I'm always up for trying new experiences—whether that's a cooking class in Little Italy or a midnight bike ride through the city. I value authenticity over perfection and believe the best relationships are built on mutual respect and a shared sense of adventure."
    },
    {
        "name": "Sam - The Outdoor Enthusiast (Male)",
        "profile": "I'm a park ranger who spends most of my time hiking, rock climbing, and planning my next backpacking trip—I've summited peaks in three countries this year alone. When I'm not in the mountains, I'm probably at a local brewery trying new IPAs or volunteering at the animal shelter. I'm looking for someone who shares my love for nature but also appreciates a cozy night in with a good book and homemade soup. I believe life's too short to stay indoors when there's a trail waiting."
    },
    {
        "name": "Morgan - The Intellectual Explorer (Male)",
        "profile": "I'm a history professor who specializes in ancient civilizations, but my real passion is connecting the past to the present through travel and storytelling. I spend my summers leading educational tours through Europe and my winters writing about forgotten historical figures. I love museum dates, intellectual debates over wine, and people who can teach me something new. I'm looking for someone who's curious about the world, values learning, and doesn't mind that I'll probably drag you to every historical site in every city we visit."
    },
    {
        "name": "Blake - The Fitness Enthusiast (Male)",
        "profile": "I'm a personal trainer and nutrition coach who's passionate about helping people achieve their health goals, but I'm also a huge foodie who believes in balance—you'll find me at the gym at 6am and at the best taco spot in town at 8pm. I love trying new workout classes, cooking healthy meals, and exploring the city's food scene. I'm looking for someone who values health and wellness but doesn't take life too seriously, someone who can push me to try new things and laugh with me when I fail spectacularly."
    }
]

def get_compatible_candidate_profile(user_profile, bedrock_client, model_id):
    """Use AI to select the most compatible candidate profile based on user's input."""
    
    # Build a list of all candidate profiles for the AI to evaluate
    candidates_list = "\n\n".join([
        f"CANDIDATE {i+1} ({profile['name']}):\n{profile['profile']}"
        for i, profile in enumerate(DEMO_CANDIDATE_PROFILES)
    ])
    
    selection_prompt = f"""You are a matchmaking AI. Your task is to analyze a user's profile and select the MOST COMPATIBLE candidate from the list below.

USER'S PROFILE:
{user_profile}

AVAILABLE CANDIDATES:
{candidates_list}

Based on the user's profile, interests, lifestyle, and preferences, select the candidate number (1-{len(DEMO_CANDIDATE_PROFILES)}) that would be the BEST MATCH for this user. Consider:
- Shared interests and hobbies
- Lifestyle compatibility
- Personality alignment
- Values and priorities
- Complementary traits

Respond with ONLY the candidate number (1-{len(DEMO_CANDIDATE_PROFILES)}) and nothing else."""

    try:
        response = bedrock_client.converse(
            modelId=model_id,
            messages=[{"role": "user", "content": [{"text": selection_prompt}]}],
            system=[{"text": "You are a matchmaking expert. Analyze compatibility and select the best match. Respond with only a number."}],
            inferenceConfig={
                "maxTokens": 50,
                "temperature": 0.3  # Lower temperature for more consistent selection
            }
        )
        
        # Extract the candidate number from the response
        response_text = response['output']['message']['content'][0]['text'].strip()
        
        # Try to extract just the number
        numbers = re.findall(r'\d+', response_text)
        if numbers:
            candidate_index = int(numbers[0]) - 1  # Convert to 0-based index
            # Ensure index is valid
            if 0 <= candidate_index < len(DEMO_CANDIDATE_PROFILES):
                selected = DEMO_CANDIDATE_PROFILES[candidate_index]
                print(f"🎭 AI selected candidate: {selected['name']} (index {candidate_index + 1})")
                return selected['profile']
        
        # Fallback: if parsing fails, log and use first candidate
        print(f"⚠️ Could not parse candidate selection from AI response: {response_text}")
        print(f"⚠️ Falling back to first candidate")
        selected = DEMO_CANDIDATE_PROFILES[0]
        print(f"🎭 Using fallback candidate: {selected['name']}")
        return selected['profile']
        
    except Exception as e:
        print(f"⚠️ Error selecting candidate with AI: {str(e)}")
        print(f"⚠️ Falling back to first candidate")
        selected = DEMO_CANDIDATE_PROFILES[0]
        print(f"🎭 Using fallback candidate: {selected['name']}")
        return selected['profile'] 

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
        # SELECT COMPATIBLE CANDIDATE PROFILE
        # ==========================================
        # Use AI to analyze the user's profile and select the most compatible
        # candidate from our curated list of demo profiles
        print(f"\n🔍 Analyzing user profile for compatibility matching...")
        candidate_model_profile = get_compatible_candidate_profile(
            user_profile=user_partner_profile,
            bedrock_client=bedrock_client,
            model_id=model_id
        )
        
        # Debug: Log the selected candidate profile
        print(f"\n🎭 Selected candidate profile (first 200 chars): {candidate_model_profile[:200]}")
        print(f"🎭 Selected candidate profile (full length): {len(candidate_model_profile)} characters")


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

Candidate Profile:
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
