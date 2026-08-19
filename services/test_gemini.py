from gemini_service import analyze_resume

sample_resume = """
Name: Aarav Sharma

Skills:
Python
FastAPI
Machine Learning
SQLite

Projects:
HireLens
AI Water Demand Prediction

Internship:
Python Backend Developer
"""

result = analyze_resume(sample_resume)

print(result)