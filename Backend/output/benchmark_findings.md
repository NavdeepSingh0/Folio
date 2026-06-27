# Benchmark Findings & Decisions

### Finding 1: Maximum Reliable Batch Size
**Finding**: TwoPassBatchEngine reliability drops below 90% beyond 12 objects.
**Evidence**: Incremental Output Benchmark.
**Decision**: Maximum Reliable Batch Size is 12.

### Finding 2: Thinking Mode Support
**Finding**: Explicit thinking modes are not supported.
**Evidence**: Qwen3 local runtime evaluation.
**Decision**: Rely on default inference.

### Freeze Official Pipeline Defaults
- Default Engine: `TwoPassBatchEngine`
- Default Parser: `Two-Stage Parser (ParseResult)`
- Default Temperature: `0.1`
- JSON Mode: `Enabled`
- Maximum Batch Size: `12`
