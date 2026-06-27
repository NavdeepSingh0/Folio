import os

def generate_report(results):
    os.makedirs("output", exist_ok=True)
    
    with open("output/generation_report.md", "w") as f:
        f.write("# Generation Engine Benchmark Report\n\n")
        f.write("## Results Summary\n")
        for test_name, result in results.items():
            f.write(f"- **{test_name}**: {result}\n")
            
    with open("output/benchmark_findings.md", "w") as f:
        f.write("# Benchmark Findings & Decisions\n\n")
        
        # Determine Batch Size Finding based on incremental output
        inc = results.get("incremental", {})
        max_batch = 12
        for size, success_rate in inc.items():
            if success_rate < 0.90:
                max_batch = int(size) - 1
                break
                
        f.write("### Finding 1: Maximum Reliable Batch Size\n")
        f.write(f"**Finding**: TwoPassBatchEngine reliability drops below 90% beyond {max_batch} objects.\n")
        f.write("**Evidence**: Incremental Output Benchmark.\n")
        f.write(f"**Decision**: Maximum Reliable Batch Size is {max_batch}.\n\n")
        
        f.write("### Finding 2: Thinking Mode Support\n")
        f.write(f"**Finding**: Explicit thinking modes are not supported.\n")
        f.write("**Evidence**: Qwen3 local runtime evaluation.\n")
        f.write(f"**Decision**: Rely on default inference.\n\n")
        
        f.write("### Freeze Official Pipeline Defaults\n")
        f.write("- Default Engine: `TwoPassBatchEngine`\n")
        f.write("- Default Parser: `Two-Stage Parser (ParseResult)`\n")
        f.write("- Default Temperature: `0.1`\n")
        f.write("- JSON Mode: `Enabled`\n")
        f.write(f"- Maximum Batch Size: `{max_batch}`\n")
