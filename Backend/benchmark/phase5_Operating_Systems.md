## Banker's Algorithm

**Definition:** The Banker's Algorithm is a resource allocation and deadlock avoidance algorithm.

**Formula:**
```math
Need[i, j] = Max[i, j] - Allocation[i, j]
```

The algorithm ensures that the system remains in a safe state by simulating resource allocation based on maximum possible needs. It checks for safety by determining if there exists a sequence of processes that can complete their execution without causing a deadlock.

**Algorithm Steps:**
1. Let Work and Finish be vectors of length m and n.
2. Find an index i such that both Finish[i] == false and Need_i <= Work.
3. If no such i exists, go to step 4.
4. Work = Work + Allocation_i; Finish[i] = true; Go to step 2.
5. If Finish[i] == true for all i, then the system is in a safe state.

> **Example:** Suppose a system has three processes and two resource types. The algorithm determines if there is a safe sequence of process execution by checking if each process can be allocated its required resources without entering a deadlock.

> [!NOTE]
> **Memory Trick:** Think of a real bank never loaning out more money than it has.

> [!TIP]
> **Exam Focus:** Focus on understanding the safety check process and the role of the Work and Finish vectors in determining system safety.

**Key Takeaways:**
- The Banker's Algorithm ensures system safety by simulating resource allocation.
- It uses Work and Finish vectors to determine if a safe sequence of process execution exists.

