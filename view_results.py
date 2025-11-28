import json
import requests

# Fetch results from API
response = requests.get('http://127.0.0.1:8000/results')
data = response.json()

print("=" * 80)
print("          AI ANSWER SHEET VALIDATOR - RESULTS REPORT")
print("=" * 80)
print(f"\nTotal Students: {data['total_students']}")
print(f"Total Marks: {data['total_marks']}")
print("\n" + "=" * 80)

for student in data['results']:
    print(f"\n🏆 RANK {student['rank']}: {student['student_id']}")
    print("-" * 80)
    print(f"Total Score: {student['total_score']}/{student['total_possible']} ({student['percentage']}%)")
    print("\nQuestion-wise Breakdown:")
    print("-" * 80)
    
    for q in student['per_question']:
        print(f"\n  {q['question']}")
        print(f"    Marks Obtained: {q['marks_obtained']}/{q['max_marks']} ({q['percentage']}%)")
        print(f"    AI Similarity:  {q['similarity']*100:.1f}%")
        
        # Visual bar
        filled = int(q['percentage'] / 10)
        bar = "█" * filled + "░" * (10 - filled)
        print(f"    Progress:       [{bar}]")
    
    print("\n" + "=" * 80)

print("\n✅ Grading Complete!")
print("=" * 80)