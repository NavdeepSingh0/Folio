## Dijkstra’s Algorithm

**Definition:** Dijkstra’s Algorithm is a greedy algorithm that finds the shortest path from a source vertex to all other vertices in a weighted graph with non-negative edge weights.

**Formula:**
$$
\text{Time Complexity} = O(E \log V)\text{ for binary heap implementation}
$$

Dijkstra’s Algorithm operates by maintaining a priority queue of vertices, where the vertex with the smallest known distance is selected at each step. It updates the shortest path estimates for adjacent vertices, ensuring that once a vertex is processed, its shortest path is finalized. This algorithm is particularly effective for graphs with non-negative edge weights, as negative weights can invalidate the algorithm's correctness. The algorithm's efficiency is O(E log V) when using a binary heap, making it suitable for large-scale network routing and pathfinding applications. It is widely used in GPS navigation, network routing protocols like OSPF, and game development for NPC pathfinding. The algorithm's correctness relies on the property that once a vertex is processed, its shortest path cannot be improved by subsequent updates.

**Algorithm Steps:**
1. Initialize a priority queue with the source node and set its distance to 0.
2. While the queue is not empty, extract the node with the smallest known distance.
3. For each adjacent node, calculate the tentative distance to it.
4. If the tentative distance is less than the current known distance, update it and add the node to the queue.
5. Repeat until all nodes are processed or the queue is empty.

```python
import heapq

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    priority_queue = [(0, start)]
    while priority_queue:
        current_dist, current_node = heapq.heappop(priority_queue)
        if current_dist > distances[current_node]:
            continue
        for neighbor, weight in graph[current_node].items():
            distance = current_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(priority_queue, (distance, neighbor))
    return distances
```

**Comparison:**
| Aspect | Dijkstra | BFS | Bellman-Ford |
|---|---|---|---|
| Edge Weights | Non-negative only | Unweighted (equal) | Negative allowed |
| Time Complexity | O(E log V) | O(V + E) | O(VE) |
| Detects Negative Cycles | No | N/A | Yes |
| Use Case | General shortest path | Unweighted shortest path | Negative weights |
| Optimality Guaranteed | ✓ Yes | ✓ Yes (for equal weights) | ✓ Yes |

> **Example:** In a road network, Dijkstra’s Algorithm helps find the shortest route from a starting city to all other cities, ensuring the fastest travel time by prioritizing roads with the least distance or travel time.

> [!TIP]
> **Exam Focus:** Focus on understanding the priority queue mechanism and the relaxation step. Be prepared to explain why negative weights invalidate the algorithm and how it differs from Bellman-Ford.

## Advanced Practice

### Conceptual Questions

**Q1:** Why is Dijkstra’s Algorithm unable to handle graphs with negative edge weights, even though it is a greedy approach?
> Dijkstra’s Algorithm assumes non-negative edge weights because once a node is processed, its shortest path is finalized. Negative weights can allow shorter paths to be discovered even after a node has been processed, violating this assumption and potentially leading to incorrect results. In contrast, Bellman-Ford iteratively relaxes all edges, making it suitable for negative weights.

**Q2:** Why does the priority queue in Dijkstra’s Algorithm ensure that nodes are processed in order of increasing distance from the source?
> The priority queue (typically a min-heap) always selects the node with the smallest tentative distance next. This ensures that once a node is processed, its shortest path is finalized, as any subsequent path to it would be longer or equal, adhering to the greedy choice property of the algorithm.

**Q3:** Why is the time complexity of Dijkstra’s Algorithm O(E log V) when using a binary heap, but O(E + V log V) with a Fibonacci heap?
> A binary heap has a higher constant factor for insertion and extraction operations compared to a Fibonacci heap, which allows for more efficient decrease-key operations. This results in a slightly better time complexity with a Fibonacci heap, though the difference is often negligible in practice due to lower constant factors in binary heaps.

### Comparison Questions

**Q1:** Under what circumstances should Dijkstra’s Algorithm be preferred over Bellman-Ford, and why?
> Dijkstra’s Algorithm should be preferred when the graph has non-negative edge weights and the goal is to find the shortest paths from a single source efficiently. Bellman-Ford is better suited for graphs with negative edge weights or when detecting negative cycles is necessary, but it has a higher time complexity of O(VE), making it less efficient for large graphs.

**Q2:** When would Dijkstra’s Algorithm be more suitable than BFS for finding the shortest path in a graph?
> Dijkstra’s Algorithm is more suitable than BFS when the graph has weighted edges with non-negative weights. BFS is only effective for unweighted graphs where all edges have the same weight, as it does not account for varying edge weights and cannot prioritize shorter paths efficiently.

**Q3:** Under what conditions would Dijkstra’s Algorithm be preferred over BFS in terms of time complexity and correctness?
> Dijkstra’s Algorithm is preferred over BFS when the graph has non-negative edge weights and the shortest path requires considering varying edge weights. BFS is only correct for unweighted graphs, while Dijkstra’s Algorithm provides correct results for weighted graphs with non-negative weights, albeit with a higher time complexity of O(E log V) compared to BFS’s O(V + E).

### Scenario Questions

**Scenario:** A network routing system experiences a situation where some links have negative weights due to dynamic bandwidth allocation. Which approach should be taken to ensure correct shortest path computation?
**Expected Answer:**
> In this scenario, Dijkstra’s Algorithm should not be used because it cannot handle negative edge weights. Instead, Bellman-Ford should be employed, as it can handle negative weights and detect negative cycles, ensuring correct shortest path computation even in the presence of negative edge weights.

**Scenario:** A GPS navigation system encounters a graph with varying road distances and some roads with negative weights due to toll discounts. How should the system adjust its pathfinding algorithm to maintain accuracy?
**Expected Answer:**
> The GPS system should switch from Dijkstra’s Algorithm to Bellman-Ford, as it can handle negative edge weights. This ensures that the shortest path is computed correctly even when some roads have negative weights, such as toll discounts, without risking incorrect results.

**Scenario:** A game developer is implementing NPC pathfinding in a level with weighted edges, some of which have negative weights due to special events. Which algorithm should be used, and why?
**Expected Answer:**
> The developer should use Bellman-Ford instead of Dijkstra’s Algorithm because Bellman-Ford can handle negative edge weights and detect negative cycles, ensuring accurate shortest path calculations in the presence of such weights, which is essential for correct NPC behavior during special events.

### Viva Questions

**Q1:** Explain Dijkstra’s Algorithm in less than 30 seconds.
> Dijkstra’s Algorithm finds the shortest path from a source node to all other nodes in a weighted graph with non-negative edges using a priority queue to always select the next closest node, updating distances until all nodes are processed.

**Q2:** Why is the priority queue essential in Dijkstra’s Algorithm?
> The priority queue ensures that the node with the smallest tentative distance is processed first, allowing the algorithm to greedily select the shortest path incrementally and guaranteeing that once a node is processed, its shortest path is finalized.

**Q3:** Why can’t Dijkstra’s Algorithm handle negative edge weights?
> Dijkstra’s Algorithm assumes non-negative weights because once a node is processed, its shortest path is finalized. Negative weights can allow shorter paths to be found after processing, violating this assumption and leading to incorrect results.

### Coding Challenges

**Challenge:** Implement Dijkstra’s Algorithm with a Fibonacci heap to improve time complexity, and analyze its efficiency compared to a binary heap implementation.
*(Expected Topics: priority queue, time complexity, data structures)*

**Challenge:** Modify the standard Dijkstra’s Algorithm to handle graphs with negative edge weights by incorporating Bellman-Ford’s relaxation step, and explain the trade-offs in terms of time complexity and correctness.
*(Expected Topics: algorithm adaptation, edge weights, time complexity)*

**Challenge:** Design a function that computes the shortest path from a source to a destination using Dijkstra’s Algorithm, and analyze its time complexity for a graph with V vertices and E edges.
*(Expected Topics: algorithm implementation, time complexity, graph theory)*

### Exam Predictions

**[10 Marks]** Describe Dijkstra’s Algorithm, its time complexity, and explain why it cannot handle graphs with negative edge weights. Provide an example scenario where it would be appropriate to use.
**Marking Scheme:**
  - 2 marks for describing Dijkstra’s Algorithm
  - 2 marks for explaining time complexity
  - 2 marks for explaining negative edge weight limitation
  - 2 marks for providing an appropriate example
  - 2 marks for overall clarity and coherence

**[10 Marks]** Compare Dijkstra’s Algorithm and Bellman-Ford in terms of time complexity, edge weight handling, and use cases. Provide a scenario where each algorithm would be the best choice.
**Marking Scheme:**
  - 3 marks for time complexity comparison
  - 3 marks for edge weight handling and limitations
  - 2 marks for use case scenarios
  - 2 marks for overall clarity and coherence

**[10 Marks]** Implement Dijkstra’s Algorithm using a priority queue and analyze its time complexity. Discuss how the choice of priority queue data structure affects the algorithm’s performance.
**Marking Scheme:**
  - 3 marks for correct implementation
  - 3 marks for time complexity analysis
  - 2 marks for discussing priority queue impact
  - 2 marks for overall clarity and coherence

