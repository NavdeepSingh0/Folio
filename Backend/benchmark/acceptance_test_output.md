## Exception Handling (try-catch)

**Definition:** A mechanism to handle runtime errors to maintain normal application flow.

In Java, exceptions disrupt the flow of execution. Using try-catch blocks allows developers to catch these exceptions and handle them gracefully without crashing the program.

```text
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Cannot divide by zero");
}
```

> [!WARNING]
> **Common Mistake:** Forgetting to catch specific exceptions before generic Exception.

> [!TIP]
> **Exam Focus:** Remember that 'finally' blocks execute regardless of whether an exception was caught or not.

---

## Software Development Life Cycle (SDLC)

**Definition:** A process used by the software industry to design, develop and test high-quality software.

SDLC aims to produce high-quality software that meets or exceeds customer expectations, reaches completion within times and cost estimates. It consists of multiple phases like Planning, Defining, Designing, Building, Testing, and Deployment.

| Phase | Goal |
|---|---|
| Planning | Analyze requirements |
| Designing | Create architecture |
| Building | Write code |

**Key Takeaways:**
- SDLC reduces complexity
- Improves software quality
- Helps in project management

---

## Banker's Algorithm

**Definition:** A resource allocation and deadlock avoidance algorithm.

**Formula:**
```math
Need[i, j] = Max[i, j] - Allocation[i, j]
```

It tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources, and then makes an 's-state' check to test for possible activities, before deciding whether allocation should be allowed to continue.

**Algorithm Steps:**
1. Let Work and Finish be vectors of length m and n, respectively.
2. Find an index i such that both Finish[i] == false and Need_i <= Work.
3. If no such i exists, go to step 4.
4. Work = Work + Allocation_i; Finish[i] = true; Go to step 2.
5. If Finish[i] == true for all i, then the system is in a safe state.

> [!NOTE]
> **Memory Trick:** Think of a real bank never loaning out more money than it has.

---

