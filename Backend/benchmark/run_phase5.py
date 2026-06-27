import sys
import os
import time
import asyncio
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.generation_engine import TwoPassBatchEngine
from app.services.renderer import MarkdownRenderer

JAVA_TEXT = """
Java Exception Handling (try-catch)
An exception is a problem that arises during the execution of a program. When an exception occurs, the normal flow of the program is disrupted. Therefore, exceptions must be handled.
We use the try-catch block. The try block contains the set of statements where an exception can occur. The catch block handles the exception.
Common mistake: Forgetting to catch specific exceptions like ArithmeticException before catching a generic Exception.
Exam Focus: Always remember that the finally block executes regardless of whether an exception was caught or not.
Example:
try { int result = 10 / 0; } catch (ArithmeticException e) { System.out.println("Cannot divide by zero"); }
"""

SE_TEXT = """
Software Development Life Cycle (SDLC)
SDLC is a process used by the software industry to design, develop and test high-quality software. It aims to produce high-quality software that meets customer expectations within time and cost estimates.
Phases include:
- Planning: Analyze requirements
- Designing: Create architecture
- Building: Write code
- Testing: Find and fix bugs
SDLC reduces complexity, improves software quality, and helps in project management.
"""

OS_TEXT = """
Banker's Algorithm
The Banker's Algorithm is a resource allocation and deadlock avoidance algorithm.
It tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources.
Formula: Need[i, j] = Max[i, j] - Allocation[i, j]
Algorithm Steps:
1. Let Work and Finish be vectors of length m and n.
2. Find an index i such that both Finish[i] == false and Need_i <= Work.
3. If no such i exists, go to step 4.
4. Work = Work + Allocation_i; Finish[i] = true; Go to step 2.
5. If Finish[i] == true for all i, then the system is in a safe state.
Memory Trick: Think of a real bank never loaning out more money than it has.
"""

def run_benchmark():
    engine = TwoPassBatchEngine()
    
    docs = {
        "Java_Programming": JAVA_TEXT,
        "Software_Engineering": SE_TEXT,
        "Operating_Systems": OS_TEXT
    }
    
    print("="*50)
    print("Running End-to-End Educational Benchmark (Phase 5)")
    print("="*50)
    
    for name, text in docs.items():
        print(f"\nProcessing {name}...")
        start = time.time()
        
        generator = engine.generate(text, "benchmark", f"hash_v2_{name}", "qwen3")
        
        full_output = ""
        for chunk in generator:
            full_output += chunk
            
        elapsed = time.time() - start
        print(f"Completed {name} in {elapsed:.2f} seconds.")
        
        with open(f"benchmark/phase5_{name}.md", "w", encoding="utf-8") as f:
            f.write(full_output)
            
    print("\nBenchmark outputs saved to benchmark/phase5_*.md")

if __name__ == "__main__":
    run_benchmark()
