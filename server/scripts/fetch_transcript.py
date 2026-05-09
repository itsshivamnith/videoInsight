import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing video ID"}), file=sys.stderr)
        sys.exit(1)
        
    video_id = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else "en"
    
    try:
        # Fetch the transcript, trying selected language first, then falling back to English
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[lang])
        except Exception:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[lang, 'en'])
            
        # Format the segments: {text, offset, duration} to align with our Supadata API structure
        formatted = []
        for segment in transcript:
            formatted.append({
                "text": segment.get("text", ""),
                "offset": segment.get("start", 0.0),
                "duration": segment.get("duration", 0.0)
            })
            
        print(json.dumps(formatted))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
