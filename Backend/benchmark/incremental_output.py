from app.services.generation_service import generate_learning_objects
from benchmark.benchmark_data import MOCK_TEXT, generate_outline
import time

def run():
    print("Running Incremental Output Benchmark...")
    results = {}
    
    # In a real environment, we'd run 10 iterations each. For this quick hackathon check, we'll run 1 to check limits.
    for size in [1, 2, 4, 8, 12]:
        outline = generate_outline(size)
        start = time.time()
        parse_result = generate_learning_objects(MOCK_TEXT, outline, "test-doc", "hash")
        elapsed = time.time() - start
        
        success = parse_result.success
        results[str(size)] = 1.0 if success else 0.0
        print(f"  Size {size}: {'Success' if success else 'Failed'} in {elapsed:.2f}s")
        
    return results

if __name__ == "__main__":
    run()
