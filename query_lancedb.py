"""
Query LanceDB directly from command line.

Usage:
    python query_lancedb.py --image "path/to/image.jpg" --question "What color is the car?"
"""

import argparse
import os
import lancedb
from PIL import Image
from transformers import ViltProcessor, ViltModel
import torch

# LanceDB Configuration - set these via environment variables, do not hardcode
LANCEDB_URI = os.environ["LANCEDB_URI"]
LANCEDB_API_KEY = os.environ["LANCEDB_API_KEY"]
TABLE_NAME = os.getenv("LANCEDB_TABLE_NAME", "vqa_embeddings")

def main():
    parser = argparse.ArgumentParser(description='Query LanceDB for VQA')
    parser.add_argument('--image', '-i', required=True, help='Path to image file')
    parser.add_argument('--question', '-q', required=True, help='Question about the image')
    parser.add_argument('--top_k', '-k', type=int, default=5, help='Number of results (default: 5)')
    args = parser.parse_args()
    
    print("=" * 60)
    print("LanceDB VQA Query")
    print("=" * 60)
    
    # Load image
    print(f"Loading image: {args.image}")
    img = Image.open(args.image).convert('RGB')
    
    # Load ViLT model
    print("Loading ViLT model...")
    processor = ViltProcessor.from_pretrained("dandelin/vilt-b32-finetuned-vqa")
    model = ViltModel.from_pretrained("dandelin/vilt-b32-finetuned-vqa")
    model.eval()
    
    # Generate embedding
    print(f"Generating embedding for question: '{args.question}'")
    inputs = processor(img, args.question, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        query_embedding = outputs.pooler_output.squeeze().numpy()
    
    # Connect to LanceDB
    print("Connecting to LanceDB Cloud...")
    db = lancedb.connect(LANCEDB_URI, api_key=LANCEDB_API_KEY)
    table = db.open_table(TABLE_NAME)
    print(f"✓ Connected to table '{TABLE_NAME}' ({table.count_rows():,} records)")
    
    # Search
    print(f"\nSearching for top {args.top_k} similar Q&A pairs...")
    results = table.search(query_embedding).limit(args.top_k).to_list()
    
    # Display results
    print("\n" + "=" * 60)
    print("RESULTS")
    print("=" * 60)
    
    for i, r in enumerate(results):
        confidence = round(1.0 / (1.0 + r['_distance']), 4)
        print(f"\n#{i+1} Answer: {r['answer']}")
        print(f"    Question: {r['question']}")
        print(f"    Distance: {r['_distance']:.4f}")
        print(f"    Confidence: {confidence}")
        print(f"    Image: {r.get('image_path', 'N/A')}")
    
    print("\n" + "=" * 60)
    print(f"TOP ANSWER: {results[0]['answer']}")
    print("=" * 60)

if __name__ == "__main__":
    main()
