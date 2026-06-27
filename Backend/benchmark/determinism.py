from app.services.generation_service import generate_learning_objects
from benchmark.benchmark_data import MOCK_TEXT, generate_outline

def run():
    print("Running Determinism Benchmark...")
    outline = generate_outline(2)
    
    res1 = generate_learning_objects(MOCK_TEXT, outline, "test-doc", "hash")
    res2 = generate_learning_objects(MOCK_TEXT, outline, "test-doc", "hash")
    res3 = generate_learning_objects(MOCK_TEXT, outline, "test-doc", "hash")
    
    if res1.success and res2.success and res3.success:
        struct1 = [o.title for o in res1.learning_objects]
        struct2 = [o.title for o in res2.learning_objects]
        struct3 = [o.title for o in res3.learning_objects]
        is_consistent = struct1 == struct2 == struct3
        print(f"  Consistent Structure: {is_consistent}")
        return "Passed" if is_consistent else "Failed Structural Drift"
    return "Failed Generation"

if __name__ == "__main__":
    run()
