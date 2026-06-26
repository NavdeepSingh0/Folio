import time
import sys
import asyncio
from app.services.generation_engine import LegacyGenerationEngine, TwoPassGenerationEngine

MOCK_TEXT = """
Operating Systems: Deadlocks
A deadlock is a situation in computing where two or more competing actions are each waiting for the other to finish, and thus neither ever does. 
For a deadlock to arise, four conditions must hold simultaneously:
1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.
2. Hold and Wait: A process is currently holding at least one resource and requesting additional resources which are being held by other processes.
3. No Preemption: A resource can be released only voluntarily by the process holding it.
4. Circular Wait: Each process must be waiting for a resource which is being held by another process, which in turn is waiting for the first process to release the resource.
The Banker's Algorithm is a resource allocation and deadlock avoidance algorithm that tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources.
"""

def run_engine(name, engine):
    print(f"\n{'='*50}\nRunning {name} Engine...\n{'='*50}")
    start = time.time()
    
    # We iterate over the generator
    full_output = ""
    try:
        generator = engine.generate(MOCK_TEXT, "university_notes", None, "qwen3")
        for chunk in generator:
            sys.stdout.write(chunk)
            sys.stdout.flush()
            full_output += chunk
    except Exception as e:
        print(f"\nError running engine: {e}")
        
    end = time.time()
    elapsed = end - start
    print(f"\n\n[{name} Engine Completed in {elapsed:.2f} seconds]")
    return full_output, elapsed

if __name__ == "__main__":
    # Test Legacy
    legacy_engine = LegacyGenerationEngine()
    legacy_out, legacy_time = run_engine("Legacy", legacy_engine)
    
    # Test Two-Pass
    twopass_engine = TwoPassGenerationEngine()
    twopass_out, twopass_time = run_engine("Two-Pass", twopass_engine)
    
    print("\n\n" + "="*50)
    print("SUMMARY BENCHMARK")
    print("="*50)
    print(f"Legacy Time:   {legacy_time:.2f}s | Output Length: {len(legacy_out)} chars")
    print(f"Two-Pass Time: {twopass_time:.2f}s | Output Length: {len(twopass_out)} chars")
