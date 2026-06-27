import time
import sys
import asyncio
from langchain_ollama import OllamaLLM
from app.services.generation_engine import LegacyEngine, TwoPassBatchEngine
from benchmark.benchmark_data import MOCK_TEXT

def warmup_gpu(model_name="qwen3"):
    print(f"\n{'='*50}\nWarming up GPU for {model_name}...\n{'='*50}")
    llm = OllamaLLM(model=model_name)
    start = time.time()
    response = llm.invoke("Hi, are you loaded in memory?")
    end = time.time()
    print(f"Warmup response: {response.strip()}")
    print(f"Warmup completed in {end - start:.2f} seconds.\n")

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
    warmup_gpu("qwen3")
    
    # Test Legacy
    legacy_engine = LegacyEngine()
    legacy_out, legacy_time = run_engine("Legacy", legacy_engine)
    
    # Test Two-Pass Batch (Variant C)
    twopass_engine = TwoPassBatchEngine()
    twopass_out, twopass_time = run_engine("Two-Pass Batch (Variant C)", twopass_engine)
    
    # Save the detailed outputs for the log
    with open("benchmark_out.txt", "w", encoding="utf-8") as f:
        f.write(f"LEGACY TIME: {legacy_time:.2f}s\n\nLEGACY OUTPUT:\n{legacy_out}\n\n")
        f.write(f"{'='*50}\n\n")
        f.write(f"TWO-PASS BATCH (VARIANT C) TIME: {twopass_time:.2f}s\n\nTWO-PASS OUTPUT:\n{twopass_out}\n")
    
    print("\n\n" + "="*50)
    print("SUMMARY BENCHMARK")
    print("="*50)
    print(f"Legacy Time:   {legacy_time:.2f}s | Output Length: {len(legacy_out)} chars")
    print(f"Two-Pass Time: {twopass_time:.2f}s | Output Length: {len(twopass_out)} chars")

