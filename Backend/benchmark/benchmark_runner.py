import sys
import os

# Add parent dir to path to allow absolute imports like 'app.services...'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from benchmark import incremental_output, thinking_mode, schema_complexity, reliability_suite, determinism, report_generator

def run_all():
    print("="*50)
    print("Starting Slice 9.5(c) Validation Suite...")
    print("="*50)
    
    results = {}
    
    results["incremental"] = incremental_output.run()
    results["thinking"] = thinking_mode.run()
    results["schema"] = schema_complexity.run()
    results["reliability"] = reliability_suite.run()
    results["determinism"] = determinism.run()
    
    print("\nGenerating Reports...")
    report_generator.generate_report(results)
    print("Reports saved to backend/benchmark/output/")
    print("="*50)

if __name__ == "__main__":
    run_all()
