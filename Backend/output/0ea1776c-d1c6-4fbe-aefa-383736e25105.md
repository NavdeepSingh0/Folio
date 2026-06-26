# 🖥️ Operating System – Study Notes
> Subject: Operating System (24CST-205/24ITT-205) | CSE 4th Semester  
> Compiled from Lectures 31–45 | Unit 3 | Topic-wise structure | Step-by-step solutions

---

## Table of Contents

### Unit 3 – Chapter 1: RAID
1. [RAID – Basics and Concept](#1-raid--basics-and-concept)
2. [RAID Levels (0–6)](#2-raid-levels-06)
3. [Problems with RAID](#3-problems-with-raid)

### Unit 3 – Chapter 2: File Management
4. [File Concepts and Attributes](#4-file-concepts-and-attributes)
5. [File Access Methods](#5-file-access-methods)
6. [File System Structure and Layers](#6-file-system-structure-and-layers)
7. [Directory Structure](#7-directory-structure)
8. [File Allocation Methods](#8-file-allocation-methods)
9. [Free Space Management](#9-free-space-management)

### Unit 3 – Chapter 3: Protection
10. [Goals and Principles of Protection](#10-goals-and-principles-of-protection)
11. [Domain of Protection](#11-domain-of-protection)
12. [Access Matrix](#12-access-matrix)
13. [Implementation of Access Matrix](#13-implementation-of-access-matrix)
14. [Revocation of Access Rights](#14-revocation-of-access-rights)

### Unit 3 – Chapter 4: Security
15. [The Security Problem](#15-the-security-problem)
16. [Program Threats](#16-program-threats)
17. [System and Network Threats](#17-system-and-network-threats)

### Unit 3 – Chapter 5: Distributed Systems
18. [Distributed System Basics](#18-distributed-system-basics)
19. [Network Topology and Connection Strategies](#19-network-topology-and-connection-strategies)
20. [Communication Structure and OSI Model](#20-communication-structure-and-osi-model)
21. [Client-Server and Peer-to-Peer Networks](#21-client-server-and-peer-to-peer-networks)
22. [Distributed Message Passing](#22-distributed-message-passing)

### Exam Prep
23. [Practice Questions & Answer Hints](#23-practice-questions--answer-hints)
24. [Quick Reference – Formulas & Tables](#24-quick-reference--formulas--tables)

---

---

# UNIT 3 – CHAPTER 1: RAID

---

# 1. RAID – Basics and Concept

## 📖 What is RAID?

**RAID** (Redundant Array of Independent Disks) is a way of combining multiple small, inexpensive disk drives into an **array** that appears to the computer as a **single logical storage unit**.

> **Original idea:** Replace one Single Large Expensive Drive (SLED) with many cheap drives working together — better performance AND reliability.

---

## 📖 Why RAID?

| Goal | How RAID Achieves It |
|------|----------------------|
| **Performance** | I/O operations overlap across multiple disks — higher throughput |
| **Reliability / Fault Tolerance** | Data stored redundantly — if one disk fails, data survives |
| **Capacity** | Multiple small disks combined into one large logical volume |
| **Storage Virtualization** | OS sees one big disk, not many individual ones |

> **Key metric:** RAID increases **Mean Time Between Failures (MTBF)** — redundancy means a single disk failure doesn't destroy data.

---

## 📖 Two Fundamental Techniques

### Striping (Used in RAID 0, 3, 4, 5, 6)

Data is split across multiple drives in **stripes** (as small as 512 bytes or as large as several MB).

```
File Data:
┌───────────────────────────────────────┐
│ Block 1 │ Block 2 │ Block 3 │ Block 4 │
└────┬────┴────┬────┴────┬────┴────┬────┘
     │         │         │         │
  Disk 1    Disk 2    Disk 3    Disk 1
```

**Benefits:** Multiple disks work in parallel → much higher throughput.

**Drawback:** No redundancy — if one disk fails, all data is lost.

### Mirroring (Used in RAID 1)

Every write goes to **two or more disks simultaneously** — 100% duplication.

```
Write data:
  ┌──────────┐     ┌──────────┐
  │  Disk 1  │  =  │  Disk 2  │  ← Exact copy
  └──────────┘     └──────────┘
```

**Benefits:** If one disk fails, the other has all the data. Reads can come from either disk (faster reads).

**Drawback:** Cost per MB is high — half the total disk space is used for duplicates.

---

## 📝 Quiz

**Q1.** What does RAID stand for, and what was its original purpose?
> **Redundant Array of Independent Disks.** Originally designed to replace Single Large Expensive Drives (SLEDs) with arrays of small cheap drives, providing both better performance (through parallelism) and better reliability (through redundancy).

**Q2.** What is striping and what problem does it solve?
> Striping partitions data into chunks distributed across multiple disks, allowing multiple disks to serve I/O requests simultaneously. This solves the **I/O bottleneck** of a single disk — instead of one disk's bandwidth, you get the combined bandwidth of all disks.

---

---

# 2. RAID Levels (0–6)

## 📖 RAID 0 — Striping (No Redundancy)

**Technique:** Data split (striped) across all drives. No parity, no mirroring.

```
Data: A B C D E F
Disk 1: A  C  E
Disk 2: B  D  F
```

| | |
|--|--|
| **Performance** | Excellent — all disks serve reads/writes simultaneously |
| **Redundancy** | ❌ None — one disk fails = ALL data lost |
| **Storage efficiency** | 100% — no space wasted on parity |
| **Common use** | Temporary scratch space, video editing (performance over safety) |

---

## 📖 RAID 1 — Mirroring

**Technique:** Every disk has an exact duplicate (mirror).

```
Disk 1: A B C D    (original)
Disk 2: A B C D    (mirror)
```

| | |
|--|--|
| **Performance** | Faster reads (can read from either disk); slower writes (must write to both) |
| **Redundancy** | ✅ Excellent — survives failure of any one disk |
| **Storage efficiency** | 50% — half the space is used for copies |
| **Common use** | OS drives, critical databases |

---

## 📖 RAID 2 — Bit-level Striping with Hamming ECC

**Technique:** Bit-level striping with Hamming error-correcting codes spread across dedicated disks.

> **Rarely used today** — all modern SCSI drives have built-in error detection, making RAID 2 unnecessary. Also requires 39 disks in the original design.

---

## 📖 RAID 3 — Byte-level Striping with Dedicated Parity

**Technique:** Data striped at byte level; one dedicated disk stores parity for all others.

- All disk spindles synchronized
- One byte on each disk, parity calculated across them
- **Single dedicated parity disk**

| | |
|--|--|
| **Redundancy** | ✅ Survives 1 disk failure |
| **Bottleneck** | Parity disk is written on every operation → becomes bottleneck |

---

## 📖 RAID 4 — Block-level Striping with Dedicated Parity

**Technique:** Data striped at **block level**; one dedicated disk stores parity.

```
Disk 1: A1  A2  A3
Disk 2: B1  B2  B3
Disk 3: C1  C2  C3
Disk 4: P1  P2  P3    ← Dedicated parity disk
```

| | |
|--|--|
| **Read performance** | Excellent (same as RAID 0) |
| **Write performance** | Poor for small random writes — parity disk updated every write |
| **Redundancy** | ✅ Survives 1 disk failure |
| **Storage efficiency** | (N-1)/N where N = number of disks |

---

## 📖 RAID 5 — Block-level Striping with Distributed Parity ⭐ Most Common

**Technique:** Data and **parity distributed across all disks** — no dedicated parity disk.

```
Disk 1: A1   B1   C1   P4
Disk 2: A2   B2   P3   C2
Disk 3: A3   P2   B3   C3
Disk 4: P1   A4   B4   C4
```

(P = Parity block, rotated across disks)

| | |
|--|--|
| **Read performance** | Excellent |
| **Write performance** | Good — parity writes distributed, no single bottleneck |
| **Redundancy** | ✅ Survives **1 disk failure** — all others calculate missing data from parity |
| **Storage efficiency** | (N-1)/N |
| **After failure** | Degraded mode — all reads require calculation; rebuild takes time |
| **Common use** | Most popular RAID for servers, NAS devices |

> **On failure:** If disk X fails, any read that would have come from X is recalculated from the remaining disks' data + parity using XOR. Performance drops but data is accessible.

---

## 📖 RAID 6 — Block-level Striping with Double Distributed Parity

**Technique:** Like RAID 5 but with **two independent parity calculations** (P and Q) distributed across all disks.

| | |
|--|--|
| **Redundancy** | ✅ Survives **2 simultaneous disk failures** |
| **Write performance** | Slower than RAID 5 (two parity calculations per write) |
| **Storage efficiency** | (N-2)/N |
| **Common use** | Large arrays, high-availability systems, very large disks |

> **Why RAID 6 matters:** As drives get larger, **rebuild time** (after a failure) grows from hours to days. During rebuild, RAID 5 risks losing all data if a second failure occurs. RAID 6 gives extra protection during this window.

---

## 📖 RAID Comparison Table

| Level | Technique | Min Disks | Fault Tolerance | Storage Efficiency | Best For |
|-------|-----------|-----------|----------------|--------------------|---------|
| **RAID 0** | Striping | 2 | None | 100% | Performance only |
| **RAID 1** | Mirroring | 2 | 1 disk | 50% | Critical data, OS |
| **RAID 2** | Bit striping + Hamming | 3 | 1 disk | Low | Obsolete |
| **RAID 3** | Byte striping + dedicated parity | 3 | 1 disk | (N-1)/N | Sequential I/O |
| **RAID 4** | Block striping + dedicated parity | 3 | 1 disk | (N-1)/N | Read-heavy |
| **RAID 5** | Distributed parity | 3 | 1 disk | (N-1)/N | **General purpose** |
| **RAID 6** | Double distributed parity | 4 | 2 disks | (N-2)/N | High availability |

---

## 📝 Quiz

**Q3.** RAID 5 has 4 disks each of 1 TB. What is the usable storage?
> Storage efficiency = (N-1)/N = 3/4. Usable = 4 × 1 TB × 3/4 = **3 TB**. (1 TB equivalent is used for distributed parity.)

**Q4.** Why can't RAID 5 tolerate two simultaneous disk failures?
> RAID 5 stores only one parity per stripe. If one disk fails, its data is reconstructed from the remaining data + that one parity. If **two** disks fail, there is no second parity to help reconstruct the second missing disk — the data is unrecoverable.

---

---

# 3. Problems with RAID

## 📖 Known Weaknesses

| Problem | Description |
|---------|-------------|
| **Rebuild time** | Large modern disks (4–20 TB) take **days** to rebuild after a failure. During rebuild, a second failure is catastrophic (RAID 5). |
| **Does NOT replace backup** | RAID protects against disk hardware failure only. It does NOT protect against: accidental deletion, ransomware, fire/flood, or controller failure. |
| **Write penalty** | RAID 5/6 require extra read-modify-write cycles for parity updates → slower random writes. |
| **RAID 0 risk** | With N disks and no redundancy, total failure probability is N × (single disk failure probability) — increases with more disks. |
| **Silent data corruption** | Some RAID levels don't detect silent bit rot within a disk's own sectors. |

> **Critical point:** RAID and backup are **not** the same thing. RAID = availability; Backup = recoverability.

---

## 📝 Quiz

**Q5.** A company stores all data on RAID 5. An employee accidentally deletes 10,000 files. Does RAID recover them?
> **No.** RAID protects against **hardware failure** (disk dying). Accidental deletion is a logical operation — RAID faithfully deletes the file across all disks. Backups are needed for this scenario.

---

---

# UNIT 3 – CHAPTER 2: FILE MANAGEMENT

---

# 4. File Concepts and Attributes

## 📖 What is a File?

The OS provides a **uniform logical view** of data storage — abstracting physical disk details into a logical unit called a **file**.

> **Definition:** A file is a **named collection of related data** — the smallest unit of logical secondary storage.

**Key properties:**
- Files are mapped onto physical storage (secondary memory)
- Data must be stored within a file to persist
- A file becomes independent of the process that created it (it has a name)

---

## 📖 File Attributes

| Attribute | Description |
|-----------|-------------|
| **Name** | Human-readable string (e.g., `report.c`) |
| **Identifier** | Unique tag used internally by the OS (not human-readable) |
| **Type** | File type (text, binary, executable, etc.) |
| **Location** | Pointer to where file is stored on device |
| **Size** | Current size in bytes/words/blocks |
| **Protection** | Who can read, write, execute |
| **Time, Date, User ID** | Creation, last modification, last access timestamps and owner |

---

## 📖 File Operations

The OS performs these basic file operations:

| Operation | Description |
|-----------|-------------|
| **Create** | Allocate space, make directory entry |
| **Write** | Write data to file position |
| **Read** | Read data from current position |
| **Reposition (Seek)** | Move the file pointer to a different location |
| **Delete** | Remove file entry, release disk space |
| **Truncate** | Erase contents but keep attributes |

---

## 📝 Quiz

**Q6.** What is the difference between a file's Name and its Identifier?
> The **Name** is a human-readable string (like `myfile.txt`) used for convenience. The **Identifier** is a unique internal number (like an inode number in Unix) that the OS uses to locate and manage the file — it's not exposed to the user.

---

---

# 5. File Access Methods

## 📖 Three Ways to Access File Data

### a) Sequential Access — Simplest

Information is processed in **order**, one record after another.

```
┌─────────────────────────────────────────┐
│  [Rec 1] → [Rec 2] → [Rec 3] → [Rec 4] │
│     ↑                                   │
│  File pointer moves forward only        │
└─────────────────────────────────────────┘
```

**Operations:**
- `read next` — reads next portion, advances pointer
- `write next` — appends to end of file, advances pointer
- Can also `reset` (rewind to beginning)

**Use case:** Log files, tape drives, audio/video streaming

---

### b) Direct Access (Relative Access)

File made of **fixed-length logical records**. Programs can read/write records in **any order**, in any position.

```
┌──────┬──────┬──────┬──────┬──────┐
│  0   │  1   │  2   │  3   │  4   │
└──────┴──────┴──────┴──────┴──────┘
  Read block 14, then block 53, then write block 7 — any order!
```

**Based on disk model** — disks allow random access to any block naturally.

**Use case:** Databases, indexed records (customer records by ID)

---

### c) Index Access

An **index table** contains pointers to various blocks of the file.

```
INDEX TABLE:
┌──────────────────────────┐
│ Key "A" → Block 7        │
│ Key "B" → Block 23       │
│ Key "C" → Block 41       │
└──────────────────────────┘
        │
        ▼  Search index → get pointer → access block directly
```

**Process:** Search index first → use pointer → directly access the desired record.

**Use case:** Large database files, sorted data lookup

---

## 📖 Access Method Comparison

| Method | Order | Speed | Use Case |
|--------|-------|-------|---------|
| Sequential | Must be in order | Medium | Logs, tapes, streams |
| Direct | Random, any order | Fast | Databases, random lookup |
| Index | Via index | Fast for large files | Large sorted data |

---

## 📝 Quiz

**Q7.** A bank processes transactions in the order they arrive (first-come, first-served). Which access method is most appropriate?
> **Sequential access** — transactions arrive in order and are processed in order, making sequential the natural fit. No random jumping is needed.

---

---

# 6. File System Structure and Layers

## 📖 File System Overview

The file system provides users with an interface to storage, mapping **logical** file names/blocks to **physical** disk locations.

**Key requirements:**
- Disk allows **in-place rewrite** and **random access**
- I/O transfers done in **blocks** (typically 512 bytes per sector)
- **File Control Block (FCB):** OS data structure holding all information about one file

---

## 📖 Layered File System Architecture

```
┌─────────────────────────────────────┐
│         Application Programs        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Logical File System           │
│  (metadata, FCBs/inodes, directory) │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      File Organization Module       │
│  (logical block → physical block)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Basic File System           │
│  (buffers, caches, block requests)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         I/O Control Layer           │
│  (device drivers, interrupt handlers│
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│            Devices                  │
│         (Disks, SSDs)               │
└─────────────────────────────────────┘
```

---

## 📖 Each Layer's Role

| Layer | Responsibility |
|-------|----------------|
| **Logical File System** | Manages metadata, translates filename → FCB (inode), directory management, protection |
| **File Organization Module** | Translates logical block numbers → physical block numbers; manages free space |
| **Basic File System** | Issues generic block read/write commands; manages memory buffers and caches |
| **I/O Control** | Device drivers; translates block commands to hardware-specific low-level commands |

> **Layering trade-off:** Reduces complexity and redundancy, but adds overhead and may decrease performance.

---

## 📖 In-Memory File System Structures

When a file is opened:
- **Mount table** — tracks mounted file systems, mount points, types
- **System-wide open-file table** — one entry per open file in the system
- **Per-process open-file table** — pointers to system-wide table entries
- **Buffer cache** — frequently used data blocks held in memory

**Opening a file:**
```
filename → logical file system → FCB (inode) →
system-wide open-file table → file handle returned to process
```

---

## 📖 File System Formats

Many file systems exist — each OS and medium uses its own format:

| System | Format(s) |
|--------|-----------|
| Windows | FAT, FAT32, NTFS |
| Linux | ext2, ext3, ext4 (40+ types) |
| Unix | UFS, FFS |
| CD-ROM | ISO 9660 |
| Modern | ZFS, GoogleFS |

---

## 📝 Quiz

**Q8.** What is the role of the File Organization Module in the layered file system?
> It translates **logical block numbers** (how the file system thinks about data) into **physical block numbers** (where data actually lives on disk). It also manages free space — tracking which physical blocks are available for new data.

---

---

# 7. Directory Structure

## 📖 What is a Directory?

A directory (folder) organizes files for storage, retrieval, and management. With millions or billions of files on a system, directories are essential for organization.

**Operations on a directory:**

| Operation | Description |
|-----------|-------------|
| Search | Find a specific file |
| Create | Add a new file entry |
| Delete | Remove a file entry |
| List | Show all files in directory |
| Rename | Change a file's name |
| Traverse | Walk the file system |

---

## 📖 Single-Level Directory

**Structure:** One directory containing ALL files on the disk.

```
┌─────────────────────────────────────────────────────┐
│  ROOT DIRECTORY                                     │
│  file1  file2  file3  file4  file5  ...             │
└─────────────────────────────────────────────────────┘
```

| Advantages | Disadvantages |
|-----------|---------------|
| Simple to implement | No two files can have the same name (entire system) |
| Easy for single user | Difficult to group related files |
| | Cannot scale to multi-user systems |

**Use case:** Simple embedded systems, early single-user systems.

---

## 📖 Two-Level Directory

**Structure:** One **Master Directory** at the top; each user gets their own **User Directory**.

```
MASTER DIRECTORY
├── User1/
│     file1  file2  file3
├── User2/
│     file1  fileA  report
└── User3/
      doc1   doc2
```

| Advantages | Disadvantages |
|-----------|---------------|
| Different users can use the same filename | Users cannot easily share files |
| Isolation between users | No grouping within a user's files |

---

## 📖 Tree-Structured (Hierarchical) Directory ⭐ Most Common

**Structure:** Each directory entry can be a **file or a subdirectory** — nested to any depth.

```
ROOT /
├── home/
│   ├── alice/
│   │   ├── docs/
│   │   │   └── thesis.txt
│   │   └── code/
│   │       └── main.c
│   └── bob/
│       └── music/
├── etc/
│   └── config.txt
└── bin/
    └── ls
```

| Advantages | Disadvantages |
|-----------|---------------|
| Files can be grouped logically | More complex path resolution |
| Each user has separate space | |
| Eliminates all single/two-level drawbacks | |
| Scales to any number of files | |

**Path types:**
- **Absolute path:** From root → `/home/alice/docs/thesis.txt`
- **Relative path:** From current directory → `docs/thesis.txt`

---

## 📖 Directory Implementation

### Linear List
- Array/linked list of (filename, pointer to FCB) pairs
- Simple but slow — linear search O(n) for lookup
- Can be improved with B+ trees for O(log n) lookup

### Hash Table
- Hash filename → index → look up entry
- O(1) average lookup time
- Problem: **Collisions** (two names hash to same slot)
- Fix: Chained-overflow method (linked list at each slot)

---

## 📝 Quiz

**Q9.** In a tree-structured directory, two users each have a file named `report.txt`. Is this a problem?
> **No.** In tree-structured directories, each file is identified by its full **absolute path** (e.g., `/home/alice/report.txt` vs `/home/bob/report.txt`). The same filename in different directories is perfectly fine — they are distinct paths.

---

---

# 8. File Allocation Methods

## 📖 What is File Allocation?

How the OS assigns **disk blocks** to store a file's data.

---

## 📖 1. Contiguous Allocation

Each file occupies a **set of consecutive (contiguous) disk blocks**.

```
File "report" starts at block 14, length 3:
Block: 14  15  16
Data:  [R1][R2][R3]
```

**Directory entry stores:** (start block, length)

**Mapping — logical block n to physical block:**
```
Physical block = start + n
```

| Advantages | Disadvantages |
|-----------|---------------|
| Best sequential access performance | **External fragmentation** — free space in non-contiguous holes |
| Simple mapping — only start + length needed | Must know file size at creation |
| | Files cannot easily grow |
| | Compaction needed to reclaim fragmented space (offline, expensive) |

---

## 📖 2. Linked Allocation

Each file is a **linked list of disk blocks** — blocks can be scattered anywhere on disk.

```
File "report" starts at block 9:
Block 9 → [data][ptr→16]
Block 16 → [data][ptr→1]
Block 1 → [data][ptr=nil]
```

**Directory entry stores:** (start block, end block)

**Mapping — to reach logical block Q:**
```
Follow the linked chain Q times from the start.
Displacement into block = R + 1
(where R = remainder after dividing logical offset by block size)
```

| Advantages | Disadvantages |
|-----------|---------------|
| No external fragmentation | **Sequential access only** — to reach block N, must traverse all N-1 pointers |
| Files can grow easily | Pointers use space within blocks |
| No need to know file size in advance | Reliability — one bad pointer breaks the whole chain |

**FAT (File Allocation Table) — variation of linked allocation:**

```
Beginning of disk has a TABLE, indexed by block number:
Block → Next Block (like a linked list, but all pointers in one table)

FAT Table:      Block 9 → 16
                Block 16 → 1
                Block 1 → EOF
```

- FAT is **cacheable in memory** → much faster than following on-disk pointers
- Used in Windows (FAT32), USB drives, memory cards

---

## 📖 3. Indexed Allocation

Each file has an **index block** — a dedicated block containing an array of pointers to all the file's data blocks.

```
Index Block for "report":
┌─────────────────────┐
│ Ptr → Block 9       │  ← Data block 0
│ Ptr → Block 16      │  ← Data block 1
│ Ptr → Block 1       │  ← Data block 2
│ Ptr → Block 25      │  ← Data block 3
└─────────────────────┘
```

**Directory entry stores:** (pointer to index block)

**Mapping — logical block n:**
```
Read index block → get pointer at position n → access data block
```

| Advantages | Disadvantages |
|-----------|---------------|
| Direct access to any block (O(1)) | Index block itself wastes space |
| No external fragmentation | For small files, even one index block wastes space |
| Files can grow easily | Large files need multi-level index blocks |

**Multi-level indexing for large files (Unix inode scheme):**
```
Direct blocks: 12 pointers → direct data blocks
Single indirect: 1 pointer → block of pointers → data blocks
Double indirect: 1 pointer → block of pointers → blocks of pointers → data
Triple indirect: one more level
```

---

## 📖 Allocation Method Comparison

| Method | Access | Fragmentation | File Growth | Overhead | Use Case |
|--------|--------|---------------|-------------|---------|---------|
| Contiguous | Fast sequential + direct | External | ❌ Difficult | Low | CD-ROMs, sequential files |
| Linked | Sequential only | None (external) | ✅ Easy | Pointer per block | Simple systems, FAT |
| Indexed | Fast direct + sequential | None | ✅ Easy | Index block | Unix (inodes), general purpose |

---

## 📝 Quiz

**Q10.** A file uses linked allocation and occupies blocks 2, 5, 7, 10. How many disk accesses to read the 4th block (block 10)?
> You must traverse the chain: read block 2 (disk access 1) → follow pointer to 5 (access 2) → follow pointer to 7 (access 3) → follow pointer to 10 (access 4). **4 disk accesses** — one per block in the chain.

**Q11.** Which allocation method gives the best performance for direct (random) access?
> **Indexed allocation** — the index block is read once (often cached), then any data block is accessed directly in one more disk access. Contiguous is also good but requires knowing file size; linked requires sequential traversal.

---

---

# 9. Free Space Management

## 📖 Why Track Free Space?

When a new file needs blocks, the OS must know which blocks are **available**. Free space management handles this.

---

## 📖 Technique 1: Bit Map (Bit Vector)

Each block is represented by **one bit**: `1 = free`, `0 = occupied` (or vice versa).

```
Blocks:   0  1  2  3  4  5  6  7  8  9 10 11 ...
Bitmap:   0  0  0  1  0  1  1  0  1  1  0   1 ...
               ↑
         block 3 and 5, 6, 8, 9, 11 are free
```

**Finding first free block:**
```
Find first bit = 1 in the bitmap → that's the free block number
```

| Advantages | Disadvantages |
|-----------|---------------|
| Simple and easy to find contiguous free space | Bitmap itself takes memory: 1 bit per block |
| Efficient with hardware bit operations | Must be kept in memory for performance |

**Size of bitmap:** For a 1 TB disk with 512-byte blocks → 1TB / 512B = 2 billion blocks → bitmap = 250 MB

---

## 📖 Technique 2: Linked Free List

All free blocks are linked together in a chain (linked list).

```
Free block head → [Block 5 | ptr→12] → [Block 12 | ptr→30] → [Block 30 | nil]
```

| Advantages | Disadvantages |
|-----------|---------------|
| No wasted space for the list structure | Traversal is slow — O(n) to find N free blocks |
| Simple | Not efficient for finding contiguous blocks |

---

## 📖 Technique 3: Grouping

Modify the linked free list: the **first free block stores addresses of N-1 free blocks** + a pointer to the next group.

```
Block 5 (group header):
│ addr of block 12 │
│ addr of block 30 │
│ addr of block 7  │
│ ptr → Block 45 (next group header) │
```

**Benefit:** Can quickly find many free blocks at once — better than one-at-a-time traversal.

---

## 📖 Technique 4: Counting

Since disk space is often allocated and freed in contiguous runs, store:

**(address of first free block, count of consecutive free blocks following it)**

```
Free list entries:
(Block 5, count=3)   → blocks 5, 6, 7 are free
(Block 20, count=1)  → block 20 is free
(Block 30, count=5)  → blocks 30–34 are free
```

**Efficient** for contiguous allocation patterns.

---

## 📖 Comparison of Free Space Methods

| Method | Space Needed | Speed | Best For |
|--------|-------------|-------|---------|
| Bit Map | 1 bit/block | Fast (bitwise ops) | General purpose |
| Linked List | Minimal | Slow (traversal) | Simple systems |
| Grouping | Minimal | Faster than linked | Finding many blocks fast |
| Counting | Moderate | Efficient | Contiguous allocation |

---

## 📝 Quiz

**Q12.** Design an efficient free space scheme for a system where files are created and deleted very frequently.
> **Bit Map** is best. Frequent creation/deletion means the OS constantly needs to find and mark free blocks. The bitmap allows fast bitwise scans to find free blocks and O(1) marking/unmarking. The bitmap can be cached in memory for maximum speed.

---

---

# UNIT 3 – CHAPTER 3: PROTECTION

---

# 10. Goals and Principles of Protection

## 📖 What is Protection?

A **mechanism** that controls the access of programs, processes, or users to resources in a computer system.

> **Original motivation:** In multiprogramming systems, untrustworthy users share a common name space — protection ensures safe sharing.

---

## 📖 Why Protection is Needed

1. **Prevent unauthorized access** — keep intruders from accessing data they shouldn't
2. **Enforce stated policy** — each active program uses resources only as permitted
3. **Improve reliability** — detect latent errors at interfaces between subsystems; prevent a faulty subsystem from contaminating a healthy one

---

## 📖 Role of Protection

Protection provides **mechanisms** for enforcing **policies**.

> **Critical distinction:**
> - **Mechanism** = HOW something is done (e.g., access control list checking)
> - **Policy** = WHAT should be done (e.g., only owner can write to this file)

**Separation of mechanism and policy is essential for flexibility** — policies change over time and place; mechanisms should support any policy without requiring redesign.

**Who sets policies:**
- Some fixed at system design time
- Some set by system management
- Some defined by individual users (to protect their own files)

---

## 📖 Principle of Least Privilege ⭐ Most Important Principle

> **Definition:** Programs, users, and systems should be given **just enough privileges** to perform their tasks — nothing more.

```
Security Guard analogy:
- Key that opens only public areas → minimal damage if lost
- Master key for all areas → catastrophic if lost or stolen
```

**Benefits:**
- Limits damage if a component has a bug or is compromised
- Reduces attack surface
- Creates audit trail of privileged operations

**Types:**
- **Static** — privileges fixed for the life of the process
- **Dynamic** — privileges change as process needs (domain switching, privilege escalation)

**"Need to Know" principle** — similar concept: a process should only access the data it currently needs for its task.

---

## 📖 Grain of Privilege

| Grain | Description | Example | Trade-off |
|-------|-------------|---------|----------|
| **Coarse-grained** | Large privilege chunks | Traditional Unix: user or root only | Simple but over-privileges |
| **Fine-grained** | Specific per-operation rights | File ACLs, RBAC | Complex but precise |

---

## 📝 Quiz

**Q13.** A web server process needs to read HTML files but should not modify them. How does least privilege apply?
> The web server process should be given **read-only** access to the web files directory — nothing more. It should not have write, execute, or delete permissions. If the server is compromised, the attacker cannot modify web content or access other system files.

---

---

# 11. Domain of Protection

## 📖 Computer System as Objects

A computer system is a collection of **objects** — hardware and software:

| Hardware Objects | Software Objects |
|-----------------|-----------------|
| CPU | Files |
| Memory segments | Programs |
| Printers | Semaphores |
| Disks | |
| Tape drives | |

Each object has:
- A **unique name**
- A set of **well-defined operations** (only valid operations can be performed)

---

## 📖 Access Rights and Domains

**Access Right:** `<object-name, rights-set>`
- Rights-set = subset of all valid operations on that object
- Example: `<File F1, {read, write}>`

**Domain:** A **set of access rights**
- Defines what objects a process can access AND what operations it can perform
- Example: Domain D1 = { `<F1, read>`, `<F3, read>` }

```
Domain can be defined by:
- User → all processes run by that user share the domain
- Process → each process has its own domain
- Procedure → each procedure activation has a domain (fine-grained)
```

---

## 📖 Need-to-Know Principle

> At any time, a process should only be able to access the resources it **currently needs** to complete its task.

**Example 1:** Procedure A() called by process P — A() should access its own variables + formal parameters, NOT all of P's memory.

**Example 2:** Compiler invoked by P to compile `source.c` — compiler should only access `source.c`, `output.o`, not all files on the system.

**Why:** Limits damage a faulty or compromised process can cause.

---

## 📝 Quiz

**Q14.** A process is running a compiler. Should the compiler have access to the system password file?
> **No.** By the need-to-know principle, the compiler needs access only to the source file being compiled, the output object file, and possibly temporary files. Access to `/etc/passwd` or any other system file unrelated to compilation violates least privilege and need-to-know.

---

---

# 12. Access Matrix

## 📖 The Access Matrix Model

The protection state of a system is modeled as a **matrix**:

- **Rows = Domains** (users, processes, procedures)
- **Columns = Objects** (files, devices, other domains)
- **Entry access(i,j)** = set of operations that a process in **Domain Dᵢ** can invoke on **Object Oⱼ**

---

## 📖 Example Access Matrix

| | **F1** | **F2** | **F3** | **Printer** |
|--|--------|--------|--------|-------------|
| **D1** | read | | read | |
| **D2** | | | | print |
| **D3** | | read | execute | |
| **D4** | read, write | | read, write | |

**Reading the matrix:**
- Process in D1: can **read** F1 and F3
- Process in D2: can **print** to printer
- Process in D3: can **read** F2 and **execute** F3
- Process in D4: can **read and write** F1 and F3 (same as D1 + write)

---

## 📖 Domains as Objects — Domain Switching

We can include **domains themselves as objects** in the matrix, with the `switch` operation:

| | **F1** | **F2** | **F3** | **Printer** | **D1** | **D2** | **D3** | **D4** |
|--|--------|--------|--------|-------------|--------|--------|--------|--------|
| **D1** | read | | read | | | switch | | |
| **D2** | | | | print | | | switch | switch |
| **D3** | | read | execute | | | | | |
| **D4** | read,write | | read,write | | switch | | | |

- A process in D2 can **switch** to D3 or D4
- A process in D4 can **switch** to D1
- A process in D1 can **switch** to D2

> **Switching from Dᵢ to Dⱼ is allowed** if and only if `switch ∈ access(i, j)`.

---

## 📖 Special Access Rights

| Right | Symbol | Meaning |
|-------|--------|---------|
| **Copy** | `*` (asterisk) | Can copy this access right to another domain for the same object |
| **Owner** | `owner` | Can add or remove ANY access right in that object's column |
| **Control** | `control` | (In domain object) Dᵢ can modify Dⱼ's access rights |
| **Switch** | `switch` | Can switch from current domain to another domain |

**Copy example:** If D2 has `read*` on F2, it can give `read` on F2 to any other domain.

**Owner example:** If D1 has `owner` on F1, D1 can add `write` for D3 on F1, or remove D2's `read` on F1.

---

## 📖 Policy vs Mechanism

The access matrix **separates mechanism from policy**:
- **Mechanism:** OS provides the access matrix + enforcement rules
- **Policy:** Users/administrators fill in the matrix entries

> This separation enables **flexibility** — the OS doesn't hard-code who can access what; it just enforces whatever the matrix says.

---

## 📝 Quiz

**Q15.** In the access matrix, domain D3 has `read` on F2. Can D3 give `read` on F2 to D1?
> **Only if D3 has `read*` (copy right) on F2.** Regular `read` cannot be transferred. The `*` asterisk attached to a right is what permits copying it to another domain's entry for the same object.

---

---

# 13. Implementation of Access Matrix

## 📖 The Challenge

The access matrix is almost always **sparse** — most entries are empty (most domains cannot access most objects). Storing it as a full 2D matrix wastes enormous memory.

**Solution: Decompose the matrix** — either by rows or by columns.

---

## 📖 Method 1: Capability List (Row-wise decomposition)

Each **domain (subject)** gets a list of tuples: `(object, rights)` for every object it can access.

```
Domain D1's Capability List:
┌──────────────────────┐
│ (F1, {read})         │
│ (F3, {read})         │
└──────────────────────┘

Domain D2's Capability List:
┌──────────────────────┐
│ (Printer, {print})   │
└──────────────────────┘
```

**Capability format:**
```
┌────────────────────────────────┐
│ Object Descriptor │ Access Rights│
│ (address/pointer) │ (read/write) │
└────────────────────────────────┘
```

**How access works:** If a process holds capability `(F1, read)`, it may read F1. **Capabilities cannot be forged** — the OS protects them.

| Advantages | Disadvantages |
|-----------|---------------|
| Fast — just check if capability exists | Hard to **revoke** rights from all domains quickly |
| Works well for user access patterns | Capabilities must be protected from tampering |

---

## 📖 Method 2: Access Control List — ACL (Column-wise decomposition)

Each **object** gets a list of tuples: `(subject, rights)` for every domain that can access it.

```
File F1's Access Control List:
┌────────────────────────────┐
│ (D1, {read})               │
│ (D4, {read, write})        │
└────────────────────────────┘
```

**Access check process:**
1. Subject S requests access to object O in mode M
2. System searches O's ACL for entry `(S, rights)`
3. If found and M ∈ rights → access granted
4. Otherwise → exception raised

**Sample ACL for file `data.txt`:**

| Subject | Access Rights |
|---------|--------------|
| ravi | read, write, execute |
| rana | read |
| jeffy | write |
| alice | execute |

| Advantages | Disadvantages |
|-----------|---------------|
| **Easy revocation** — just remove entry from ACL | Checking access requires searching the list |
| **Easy audit** — see who can access object | ACL can become long for popular shared objects |
| Most common in real systems (Unix, Windows) | |

---

## 📖 Method 3: Lock-and-Key Mechanism (Hybrid)

**Combines capabilities and ACLs:**

- Each **subject** has capabilities with `(object, key)` pairs
- Each **object** has an ACL with `(lock, rights)` pairs
- Access granted only if the subject's `key` matches the object's `lock`

```
Subject S has capability: (F1, key=0x5A3F)
Object F1 has ACL entry: (lock=0x5A3F, {read, write})
                              ↑
                         keys match → access granted
```

**Revocation:** Change the object's lock → all old keys become invalid.

---

## 📖 Comparison of Implementations

| Feature | Global Table | ACL (per object) | Capabilities (per domain) | Lock-and-Key |
|---------|-------------|-----------------|--------------------------|-------------|
| **Space** | Large (full matrix) | Compact | Compact | Moderate |
| **Access check** | Fast lookup | Linear search | Fast (capability check) | Two lookups |
| **Revocation** | Easy | Easy | Hard | Easy (change lock) |
| **Selective revocation** | Yes | Yes | No (without indirection) | Depends |
| **Real-world use** | Rarely | Very common (Unix/Windows) | Some systems | Rare |

---

## 📝 Quiz

**Q16.** Why is revocation easier with ACLs than with capabilities?
> With ACLs, rights are stored **at the object** — to revoke access for domain D, simply remove D's entry from the object's ACL. With capabilities, rights are stored **distributed across all domains** — to revoke, you must find and remove the capability from every domain that holds it, which requires a system-wide search.

---

---

# 14. Revocation of Access Rights

## 📖 When and Why Revoke?

In a dynamic protection system, access rights may need to be removed — a user leaves the organization, a security breach is discovered, temporary access expires.

---

## 📖 Dimensions of Revocation

| Dimension | Options |
|-----------|---------|
| **Timing** | Immediate vs. Delayed |
| **Scope** | General (all users) vs. Selective (specific users) |
| **Extent** | Total (all rights) vs. Partial (some rights) |
| **Duration** | Permanent vs. Temporary (can regain later) |

**With ACLs:** Revocation is **easy** — search list, delete entry. Supports all dimensions above.

**With Capabilities:** Much harder — capabilities are **distributed** across domains.

---

## 📖 Capability Revocation Schemes

### 1. Reacquisition
Periodically delete all capabilities from all domains. Processes must re-request capabilities. If access is revoked, re-request fails.

**Problem:** Delay between revocation and actual denial.

### 2. Back-Pointers
Each object maintains a list of all capabilities pointing to it. On revocation, follow pointers and invalidate them.

**Used in:** MULTICS. **Problem:** Complex and expensive to maintain.

### 3. Indirection
Capabilities point to a **global table entry**, which points to the object.

```
Capability → Global Table Entry → Object
                     ↑
           Revoke by deleting this entry
```

When capability is exercised: looks up table → if entry deleted → access denied.

**Used in:** CAL system. **Problem:** Does not allow selective revocation (one entry per capability type).

### 4. Keys
Each capability has a **key**; each object has a **master key**.

```
Capability key == Object master key → access allowed
```

**Revoke:** Change the object's master key → all old capabilities with old key become invalid immediately.

**Selective revocation:** Use a list of keys per object (different capabilities have different keys).

---

## 📖 Role-Based Access Control (RBAC)

Modern systems (e.g., Solaris 10) implement **RBAC** — an extension of least privilege:

```
Privileges → assigned to → Roles
Users → assigned to → Roles
Users → take on → Role → get its privileges
```

**Example:** A backup operator role has exactly the privileges needed to read files and write to tape — not root, not user, just exactly backup rights.

**Benefits:** Reduces reliance on superuser accounts; limits damage from compromised accounts.

---

## 📝 Quiz

**Q17.** A capability-based system needs to immediately revoke all access to a file. Which scheme supports immediate revocation most cleanly?
> **Indirection** — delete the global table entry that all capabilities for this file point to. The next time any capability tries to access the file, it finds no valid table entry → access denied immediately, without hunting down every capability in every domain.

---

---

# UNIT 3 – CHAPTER 4: SECURITY

---

# 15. The Security Problem

## 📖 Security vs Protection

| | Protection | Security |
|--|-----------|---------|
| **Focus** | Internal control of access | Defense against external and internal threats |
| **Goal** | Correct use of resources | Prevent malicious misuse |
| **Scope** | Within the system | System + network + people |

> A system is **secure** if resources are used and accessed as intended under all circumstances. In practice, perfect security is **unachievable** — we aim to minimize risk.

---

## 📖 Key Terminology

| Term | Definition |
|------|-----------|
| **Intruder (Cracker)** | Entity attempting to breach security |
| **Threat** | Potential security violation |
| **Attack** | Attempted breach of security (accidental or malicious) |

> **Accidental vs Malicious:** Accidental misuse is easier to protect against (safeguards, input validation). Malicious attacks require more sophisticated defenses.

---

## 📖 Security Violation Categories

| Category | Description | Example |
|----------|-------------|---------|
| **Breach of Confidentiality** | Unauthorized **reading** of data | Password file stolen |
| **Breach of Integrity** | Unauthorized **modification** of data | Grade record altered |
| **Breach of Availability** | Unauthorized **destruction** of data/service | Files encrypted by ransomware |
| **Theft of Service** | Unauthorized **use** of resources | Using CPU for crypto mining |
| **Denial of Service (DoS)** | Prevention of **legitimate use** | Server flooded with requests |

---

## 📖 Security Violation Methods

| Method | Description |
|--------|-------------|
| **Masquerading** | Pretending to be an authorized user to escalate privileges |
| **Replay Attack** | Capturing and re-sending valid communications (with or without modification) |
| **Man-in-the-Middle** | Attacker sits between two parties, intercepting and possibly modifying messages |
| **Session Hijacking** | Intercepting an already-established session to bypass authentication |

---

## 📖 Security Measure Levels

Security must be enforced at multiple levels — a chain is only as strong as its weakest link:

```
┌──────────────────────────────────────┐
│          Application Level           │ ← Secure coding practices
├──────────────────────────────────────┤
│           OS Level                   │ ← System calls, access control
├──────────────────────────────────────┤
│          Network Level               │ ← Firewalls, encryption
├──────────────────────────────────────┤
│          Physical Level              │ ← Lock server rooms, secure hardware
└──────────────────────────────────────┘
```

---

## 📝 Quiz

**Q18.** An attacker captures a user's login session token and uses it to access the system later. Which attack method is this?
> **Session hijacking** — the attacker uses a stolen session token from an already-authenticated session to bypass the login/authentication step entirely.

---

---

# 16. Program Threats

## 📖 What are Program Threats?

Malicious code embedded in programs that exploits system vulnerabilities.

---

## 📖 Types of Program Threats

### Trojan Horse
A **program that appears legitimate** but performs malicious actions in the background.

```
User runs: "free_screensaver.exe"
Visible: Nice screensaver
Hidden: Keystroke logger / file deletion / backdoor
```

**Detection:** Hard — looks like a normal program. Antivirus signatures help.

---

### Logic Bomb
Code embedded in a legitimate program that **executes when a specific condition is met**.

```
if (date == "01/01/2025") {
    delete_all_files();   ← Logic bomb!
}
```

**Example:** Disgruntled employee plants bomb to destroy data if their name is removed from payroll.

---

### Trapdoor (Backdoor)
A **secret, undocumented entry point** to a program, bypassing normal authentication.

```
if (username == "secret_admin") {
    grant_full_access();   ← Trapdoor!
}
```

Often planted by developers during testing and never removed, or maliciously inserted.

---

### Stack/Buffer Overflow
Exploiting programs that **don't validate input size** — writing past the end of a buffer overwrites the stack.

```
Normal:                    Buffer Overflow:
┌──────────┐              ┌──────────┐
│ Buffer   │              │ Attacker │ ← Attacker's code
│ [      ] │              │  Code    │    overwrites
│ Return   │              │ Return   │ ← Points to
│ Address  │              │ Address  │    attacker's code!
└──────────┘              └──────────┘
```

**Result:** Attacker's code runs with the victim program's privileges.

**Prevention:** Bounds checking, non-executable stacks, stack canaries, ASLR.

---

### Virus
A program that **attaches itself to another program** and replicates when the host runs.

- Requires a **host file** to spread
- Can corrupt files, display messages, steal data

---

### Worm
A **self-replicating program** that spreads **independently across networks** — no host file needed.

```
Worm (vs Virus):
Virus:  needs a host file, spreads when host runs
Worm:   spreads on its own through network vulnerabilities
```

**Famous example — Morris Internet Worm (1988):**
- First major worm to spread across the internet
- Exploited Unix vulnerabilities (sendmail debug, fingerd buffer overflow, rsh/rexec trust)
- Infected thousands of machines, caused significant slowdowns
- Author Robert Morris convicted under Computer Fraud and Abuse Act

---

## 📖 Program Threat Comparison

| Threat | Host Needed | Self-Replicates | Trigger |
|--------|-------------|-----------------|---------|
| Trojan Horse | Looks legitimate | No | Execution |
| Logic Bomb | Hidden in legit code | No | Specific condition |
| Trapdoor | Inside legit program | No | Secret input |
| Buffer Overflow | Vulnerable program | No | Malformed input |
| Virus | Yes (host file) | Yes (in files) | Host execution |
| Worm | No | Yes (network) | Network vulnerability |

---

## 📝 Quiz

**Q19.** What is the key difference between a virus and a worm?
> A **virus** requires a **host file** — it attaches to an existing program and spreads when that program is executed. A **worm** is self-contained and spreads **independently** over a network by exploiting vulnerabilities, without needing a host file.

---

---

# 17. System and Network Threats

## 📖 Types of System and Network Attacks

### Denial-of-Service (DoS) Attack

**Goal:** Overwhelm a system so legitimate users cannot access it — **not to gain access, but to deny service**.

```
Normal:    10 req/sec → Server responds fine
DoS:    10,000 req/sec → Server overwhelmed, crashes or drops legitimate requests
```

**DDoS (Distributed DoS):** Attack comes from **many compromised machines** (botnet) simultaneously — much harder to block.

---

### Port Scanning
Systematically probing a host's ports to discover which services are running — used by attackers to find vulnerabilities.

---

### Sniffing
**Passive** interception of network traffic — capturing packets passing through a network segment.

**Used for:** Stealing passwords, session tokens, sensitive data on unencrypted connections.

**Defense:** Encryption (HTTPS, VPN, TLS).

---

### Spoofing
Falsifying the source address of packets to impersonate another host.

**IP Spoofing:** Sending packets with a fake source IP → victim responds to wrong address.

---

### Man-in-the-Middle (MitM)
Attacker positions themselves between two communicating parties.

```
Alice ←→ [Attacker] ←→ Bob

Alice thinks she's talking to Bob
Bob thinks he's talking to Alice
Attacker reads/modifies everything
```

**Defense:** Certificate-based authentication, TLS/SSL.

---

## 📖 Security Defense Measures

| Defense | What it protects against |
|---------|--------------------------|
| **Firewalls** | Filter network traffic; block unauthorized connections |
| **Intrusion Detection Systems (IDS)** | Detect anomalous activity patterns |
| **Encryption** | Makes intercepted data unreadable |
| **Authentication** | Verify identity before granting access |
| **Audit Logs** | Record all access for forensic analysis |
| **Principle of Least Privilege** | Limits damage if any component is compromised |

---

## 📝 Quiz

**Q20.** How does DDoS differ from regular DoS, and why is DDoS harder to defend against?
> Regular **DoS** comes from a **single source** — easy to block by blacklisting one IP address. **DDoS** comes from **thousands or millions of distributed compromised machines** (a botnet) — blocking individual IPs is impractical since new ones keep joining. You must block entire IP ranges, use rate limiting, or use specialized DDoS mitigation services.

---

---

# UNIT 3 – CHAPTER 5: DISTRIBUTED SYSTEMS

---

# 18. Distributed System Basics

## 📖 What is a Distributed System?

A collection of **loosely coupled processors** interconnected by a **communications network**.

```
    Site A          Site B          Site C
  ┌────────┐      ┌────────┐      ┌────────┐
  │ CPU+Mem│─────►│ CPU+Mem│─────►│ CPU+Mem│
  └────────┘      └────────┘      └────────┘
       └─────────────────────────────────┘
                  Network
```

**Terminology:**
- **Node/Host/Site:** Location of one processor
- **Loosely coupled:** Processors do not share memory or clock

---

## 📖 Reasons for Distributed Systems

| Reason | Description |
|--------|-------------|
| **Resource Sharing** | Share files at remote sites; use remote printers; access distributed databases |
| **Computation Speedup** | Break tasks into subtasks running on different sites simultaneously (load sharing) |
| **Reliability** | If one site fails, others continue; work transferred to other sites |
| **Communication** | Message passing between users and processes at different sites |

---

## 📖 Two Types of Distributed OS

### Network Operating System (NOS)
Users are **aware** they are accessing remote resources. Access is done **explicitly**:

- Remote login: `telnet`, `ssh`
- Remote Desktop (Windows)
- File transfer: `ftp`, `scp`

> **Example:** You know you're SSH-ing into a remote server.

### Distributed Operating System
Users are **unaware** of multiple machines. Remote resources accessed like **local resources** — transparent.

Three migration types:

| Type | Description |
|------|-------------|
| **Data Migration** | Transfer files/portions of files across sites as needed |
| **Computation Migration** | Transfer the computation (not the data) to where the data lives |
| **Process Migration** | Execute entire processes or parts at different sites |

**Reasons for Process Migration:**
- Load balancing — even workload across network
- Computation speedup — run subprocesses concurrently
- Hardware preference — process needs specialized hardware at another site
- Software preference — required software only at one site
- Data access — process runs where data is, avoids huge data transfer

---

## 📝 Quiz

**Q21.** What is the key difference between a Network OS and a Distributed OS?
> In a **Network OS**, users explicitly request remote resources (they know which machine they're connecting to). In a **Distributed OS**, the multiplicity of machines is **transparent** — the system looks and behaves like a single unified machine, and the OS handles remote access automatically.

---

---

# 19. Network Topology and Connection Strategies

## 📖 Network Topology

How sites are **physically connected** — evaluated on:

| Criterion | Question |
|-----------|---------|
| **Installation cost** | How expensive to link the sites? |
| **Communication cost** | How long to send a message from A to B? |
| **Reliability** | If a link/site fails, can others still communicate? |

**Common topologies:**

```
Star:        Ring:        Bus:         Mesh:
   A            A           A-B-C         A---B
  /|\           |                        |   |
 B C D         B-E           |           D---C
  \|/           |           D-E-F
   E            C-D
```

| Topology | Cost | Communication | Reliability |
|----------|------|---------------|-------------|
| Star | Medium | Depends on hub | Hub is single point of failure |
| Ring | Low | O(n) hops | One break disrupts all |
| Bus | Low | Fast | One break disrupts all |
| Fully Connected Mesh | High | O(1) hops | Excellent — many paths |
| Tree | Low | O(log n) | Moderate |

---

## 📖 Routing Strategies

**How messages travel from site A to site B:**

### Fixed Routing
- Path from A to B is **determined in advance** (usually shortest path)
- Path only changes if a hardware failure makes it impossible
- **Advantages:** Minimizes cost; ensures message order
- **Disadvantages:** Cannot adapt to load changes

### Virtual Circuit
- Path from A to B is **fixed for the duration of one session**; different sessions may use different paths
- **Partial** remedy for load changes
- Messages delivered in order within a session

### Dynamic Routing
- Path chosen **each time a message is sent** — uses least loaded link at that moment
- **Advantages:** Adapts to load changes; avoids heavily loaded paths
- **Disadvantages:** Messages may arrive **out of order** (fix: append sequence numbers to messages)

---

## 📖 Connection Strategies

**How a connection is established to send messages:**

| Strategy | Description | Analogy | Trade-off |
|----------|-------------|---------|-----------|
| **Circuit Switching** | Permanent physical link established for entire communication | Telephone call | Low per-message overhead; setup time; may waste bandwidth |
| **Message Switching** | Temporary link for one complete message | Post office mail | No setup time; more per-message overhead |
| **Packet Switching** | Messages split into fixed-size packets; each may take a different path; reassembled at destination | Internet data | Most flexible; packets may arrive out of order |

> **Internet uses packet switching** — data split into IP packets that may travel different routes and are reassembled at the destination.

---

## 📝 Quiz

**Q22.** Why might packets in a packet-switched network arrive out of order?
> Each packet is independently routed through the network. Different packets of the same message may take different paths (due to dynamic routing selecting least-loaded links). Some paths are longer or more congested, so later-sent packets may arrive before earlier ones. **Sequence numbers** and reassembly at the destination fix this.

---

---

# 20. Communication Structure and OSI Model

## 📖 OSI Reference Model — 7 Layers

The OSI (Open Systems Interconnection) model partitions network communication into 7 layers. Each layer handles a specific part of the communication problem.

```
Sender                                   Receiver
┌──────────────────┐                ┌──────────────────┐
│ 7. Application   │◄──────────────►│ 7. Application   │
├──────────────────┤                ├──────────────────┤
│ 6. Presentation  │                │ 6. Presentation  │
├──────────────────┤                ├──────────────────┤
│ 5. Session       │                │ 5. Session       │
├──────────────────┤                ├──────────────────┤
│ 4. Transport     │                │ 4. Transport     │
├──────────────────┤                ├──────────────────┤
│ 3. Network       │                │ 3. Network       │
├──────────────────┤                ├──────────────────┤
│ 2. Data Link     │                │ 2. Data Link     │
├──────────────────┤                ├──────────────────┤
│ 1. Physical      │◄──── Medium───►│ 1. Physical      │
└──────────────────┘                └──────────────────┘
```

---

## 📖 Layer Descriptions

| Layer | # | Responsibility | Scope |
|-------|---|----------------|-------|
| **Physical** | 1 | Mechanical/electrical transmission of raw bit stream | P2P (physical link) |
| **Data Link** | 2 | Frames, error detection/recovery at physical layer | P2P |
| **Network** | 3 | Routing packets, addressing, load-based routing decisions | Source to Destination |
| **Transport** | 4 | Partitioning into packets, packet ordering, flow control, physical addresses | End to End |
| **Session** | 5 | Process-to-process communication sessions | End to End |
| **Presentation** | 6 | Format translation (character sets, half/full duplex, encryption) | End to End |
| **Application** | 7 | File transfer, email, remote login, distributed databases | User |

> **Memory trick:** "Please Do Not Throw Sausage Pizza Away" → Physical, Data Link, Network, Transport, Session, Presentation, Application

---

## 📖 TCP/IP Model (Simplified, Real-World)

The practical internet model collapses OSI's 7 layers into 4:

| TCP/IP Layer | Corresponds to OSI Layers |
|-------------|--------------------------|
| Application | Application + Presentation + Session |
| Transport | Transport |
| Internet (IP) | Network |
| Network Access | Data Link + Physical |

---

## 📖 Contention — Managing Shared Network Access

When multiple sites transmit simultaneously on a shared link:

### CSMA/CD (Carrier Sense Multiple Access / Collision Detection)
- Site **listens** before transmitting (carrier sense)
- If two sites transmit simultaneously → **collision detected** → both stop
- Wait a random time, retry
- **Used in:** Ethernet (most common wired LAN standard)
- **Problem:** Under heavy load, many collisions → degraded performance

### Token Passing
- A special message (**token**) circulates in the network (ring structure)
- Site must **wait for the token** to arrive before transmitting
- After transmitting, releases the token to the next site
- **Fair, no collisions** — only token holder transmits
- **Used in:** Some IBM and HP/Apollo systems

### Message Slots
- Fixed-length slots circulate in the ring
- Large messages split into slot-sized packets
- **Used in:** Cambridge Digital Communication Ring (experimental)

---

## 📝 Quiz

**Q23.** At which OSI layer does routing of packets occur?
> **Layer 3 — Network layer.** It handles addressing of outgoing packets, decoding addresses of incoming packets, and maintaining routing tables to make forwarding decisions. The IP protocol operates at this layer.

---

---

# 21. Client-Server and Peer-to-Peer Networks

## 📖 Client-Server Network

A **centralized** architecture where most processing and data storage happens on servers; clients request services.

```
        Clients                  Server
┌──────┐   ┌──────┐           ┌──────────┐
│Client│   │Client│  ─────►  │  Server  │
└──────┘   └──────┘  ◄─────  │(processes│
                              │ all data)│
┌──────┐   ┌──────┐           └──────────┘
│Client│   │Client│
└──────┘   └──────┘
```

**How it works:**
1. Client sends request to server
2. Server processes request (does the computation, accesses data)
3. Server sends result back to client
4. Client displays/uses result

**Examples of clients:** Web browsers, email clients, chat programs, database client apps.

| Advantages | Disadvantages |
|-----------|---------------|
| Centralized management | Server is **single point of failure** |
| Easy to update/maintain | Server can be **overloaded** with too many requests |
| Strong security at server | **DDoS attacks** target server specifically |

---

## 📖 Peer-to-Peer (P2P) Network

**Decentralized** architecture — every node acts as both **client and server**. Each node shares its own files with others.

```
  Node A ←──────────► Node B
    ▲    ╲            ▲
    │      ╲          │
    │        ╲        │
  Node D ◄────── Node C
```

**How it works:**
- No central server
- File sharing and computation distributed among all nodes
- Can use a central **index server** (early P2P: Napster) or be fully distributed (BitTorrent)

**Examples:** BitTorrent, Kazaa, older Napster, blockchain networks.

| Advantages | Disadvantages |
|-----------|---------------|
| No single point of failure | Hard to regulate/manage |
| Scales well (more nodes = more capacity) | Security concerns — unverified content |
| Distributes bandwidth across all peers | Commonly associated with piracy |

---

## 📖 Comparison

| Feature | Client-Server | Peer-to-Peer |
|---------|---------------|--------------|
| Architecture | Centralized | Decentralized |
| Management | Easier | Harder |
| Scalability | Limited by server | Scales with nodes |
| Reliability | Single point of failure | Highly redundant |
| Security | Server-controlled | Difficult to enforce |
| Use case | Web, email, databases | File sharing, blockchain |

---

## 📝 Quiz

**Q24.** A company's email server fails. In a client-server email system, what happens to all clients?
> **All clients lose email access** — they cannot send or receive emails because the server is the single point of processing and storage. This is the key weakness of client-server: the server is a single point of failure.

---

---

# 22. Distributed Message Passing

## 📖 Message Passing Model

In distributed systems, processes on different machines communicate by **sending and receiving messages** through communication channels.

```
Process A (Node 1)                    Process B (Node 2)
┌──────────────┐   ─── message ──►  ┌──────────────┐
│              │                    │              │
│  send(B, m)  │   ◄── reply ──    │ receive(A, m)│
└──────────────┘                    └──────────────┘
       │                                   │
   Network channel connecting nodes
```

**Key properties:**
- Channels are **private** between communicating processes
- Sender determines data to send (like initiating a phone call)
- Communication completes only when **receiver actively accepts** (like answering a call)
- No strict time constraint — receiver may delay or ignore

> **Successful communication requires active participation from BOTH sender and receiver.**

---

## 📖 Types of Message Passing

### Synchronous Message Passing
**Both sender and receiver must be synchronized** — they rendezvous at the communication point.

```
Sender:   ─── send ──── WAIT ─────── continue ───►
                           │
Receiver: ──── WAIT ───── receive ──────────────►
                    ↑
             Both wait for each other
```

**Characteristics:**
- Sender blocks until receiver is ready
- Tightly coupled — must coordinate timing
- Simpler reasoning about program state

### Asynchronous Message Passing
**Non-blocking** — sender sends and immediately continues. Messages buffered until receiver reads.

```
Sender:   ─── send ──────────────────── continue ───►
                  ↓ (to buffer)
             [Message Queue]
                  ↑
Receiver: ──────────────── receive ──────────────────►
                    (reads from buffer whenever ready)
```

**Characteristics:**
- Sender doesn't wait — continues immediately
- Enables concurrent execution
- More complex — must handle buffer full, message loss

---

## 📖 Message Delivery Models

| Model | Description | Recipients |
|-------|-------------|-----------|
| **Unicast** | One sender → One receiver | 1:1 |
| **Multicast** | One sender → Group of receivers | 1:Many (selected group) |
| **Broadcast** | One sender → All nodes | 1:All |

---

## 📖 Message Passing in Context

Message passing supports:
- **Coordination** — processes agree on shared state
- **Synchronization** — ordering of events across machines
- **Data sharing** — transfer information without shared memory

---

## 📝 Quiz

**Q25.** In synchronous message passing, what happens if the receiver is busy and does not immediately accept the message?
> The **sender blocks** (waits) until the receiver becomes ready to accept the message. This is the defining characteristic of synchronous (blocking) communication — unlike asynchronous where the message would be buffered and the sender continues immediately.

---

---

# UNIT 3 – EXAM PREP

---

# 23. Practice Questions & Answer Hints

## 📖 RAID Questions

**Q1.** Compare RAID 0, RAID 1, and RAID 5 in terms of storage, redundancy, and performance.

| | RAID 0 | RAID 1 | RAID 5 |
|--|--------|--------|--------|
| Storage efficiency | 100% | 50% | (N-1)/N |
| Redundancy | None | Full (mirror) | 1 disk failure |
| Read performance | Excellent | Excellent | Excellent |
| Write performance | Excellent | Slower (2 writes) | Good |
| Min disks | 2 | 2 | 3 |

**Q2.** RAID 5 with 4 disks, block-level striping with distributed parity. Which disk holds parity for block 6?

> **Solution:** With 4 disks, parity rotates: blocks 0-3 → parity on D4, blocks 4-7 → parity on D3, blocks 8-11 → parity on D2... Block 6 is in the group 4-7. Parity for this stripe is on **Disk 3** (parity position rotates to avoid the bottleneck of RAID 4's dedicated parity disk).

**Q3.** RAID 0 with 3 disks, file size = 12 MB, block = 1 MB. Illustrate block distribution.

```
Block 1  → Disk 1
Block 2  → Disk 2
Block 3  → Disk 3
Block 4  → Disk 1
Block 5  → Disk 2
Block 6  → Disk 3
...
Block 10 → Disk 1
Block 11 → Disk 2
Block 12 → Disk 3

Disk 1: Blocks 1, 4, 7, 10
Disk 2: Blocks 2, 5, 8, 11
Disk 3: Blocks 3, 6, 9, 12
```

---

## 📖 File System Questions

**Q4.** Compare contiguous, linked, and indexed allocation in terms of access time, memory utilization, and file growth.

| | Contiguous | Linked | Indexed |
|--|-----------|--------|---------|
| Sequential access | Excellent | Good | Good |
| Random access | Excellent | Poor (O(n)) | Excellent (O(1)) |
| External fragmentation | Yes | No | No |
| File growth | Difficult | Easy | Easy |
| Overhead | None | Pointer/block | Index block |

**Q5.** File in linked allocation: blocks 2, 5, 7, 10. How many disk accesses to read block 4 (the 4th block sequentially) vs directly?

> Sequential to 4th block: Must traverse chain — read 2 (1), follow to 5 (2), follow to 7 (3), follow to 10 (4) = **4 disk accesses**.
> Direct access in linked allocation: **Not possible without traversal** — linked allocation does not support true direct access. You must still traverse from the beginning: same 4 accesses.

**Q6.** Design an efficient free space scheme for high file creation/deletion.

> **Bit Map (Bit Vector)** with bitmap cached in memory. Reason: Frequent creation/deletion means constantly finding free blocks and marking/unmarking them. Bitmap allows O(1) mark/unmark and fast bitwise scan to find free blocks. Cache the bitmap in RAM to avoid disk access on every operation.

---

## 📖 Protection Questions

**Q7.** Explain Access Matrix with an example. Show how domain switching is controlled.

> Use the 4×4 example from Topic 12. Show both the basic matrix (domains vs files/printer) and the extended matrix (with domains as objects and switch rights). Show that `switch(D1→D2)` is possible because `switch ∈ access(1,D2)`.

**Q8.** Compare ACL and Capability List for implementing access matrix.

> ACL = column-wise; easy revocation (delete row in object's list); system checks who can access object. Capabilities = row-wise; easy access check (process carries its rights); hard revocation (must find all capabilities distributed across system).

---

## 📖 Security Questions

**Q9.** Explain the differences between virus, worm, and Trojan horse.

| | Virus | Worm | Trojan Horse |
|--|-------|------|--------------|
| Host needed | Yes | No | Looks legitimate |
| Self-replicates | Yes (in files) | Yes (network) | No |
| Spread mechanism | File sharing, execution | Network vulnerabilities | User downloads/runs it |
| Harm | File corruption, data theft | Network overload, payloads | Hidden malicious action |

**Q10.** What are the four dimensions of access revocation?

> (1) **Timing:** Immediate vs Delayed — does revocation take effect at once or after a delay?
> (2) **Scope:** General (all users) vs Selective (specific domains only)
> (3) **Extent:** Total (all rights for object) vs Partial (only some rights)
> (4) **Duration:** Permanent (never re-granted) vs Temporary (can be re-granted later)

---

## 📖 Distributed Systems Questions

**Q11.** Compare client-server and peer-to-peer architectures.

> Client-server: centralized, easy management, server = single point of failure, DDoS target. P2P: decentralized, no single point of failure, scales with nodes, harder to manage/secure.

**Q12.** Explain synchronous vs asynchronous message passing in distributed systems.

> Synchronous: both sender and receiver synchronize — sender blocks until receiver accepts. Tightly coupled, simpler reasoning. Asynchronous: sender sends to buffer and continues; receiver reads when ready. Non-blocking, enables concurrency, needs buffer management.

---

---

# 24. Quick Reference – Formulas & Tables

## 🔑 RAID Storage Formulas

```
RAID 0: Usable = N × D         (N disks, each D TB — no redundancy)
RAID 1: Usable = D             (only one disk worth of data, rest mirrors)
RAID 3: Usable = (N-1) × D     (one dedicated parity disk)
RAID 4: Usable = (N-1) × D     (one dedicated parity disk)
RAID 5: Usable = (N-1) × D     (distributed parity = 1 disk equivalent)
RAID 6: Usable = (N-2) × D     (two parity disks equivalent)

Example: RAID 5 with 4 disks of 2 TB each:
  Usable = (4-1) × 2 TB = 6 TB
```

## 🔑 RAID Level Quick Reference

| Level | Technique | Min Disks | Failures Tolerated | Efficiency |
|-------|-----------|-----------|-------------------|------------|
| 0 | Striping | 2 | **0** | 100% |
| 1 | Mirroring | 2 | 1 | 50% |
| 3 | Byte stripe + dedicated parity | 3 | 1 | (N-1)/N |
| 4 | Block stripe + dedicated parity | 3 | 1 | (N-1)/N |
| 5 | Distributed parity | 3 | **1** | (N-1)/N |
| 6 | Double distributed parity | 4 | **2** | (N-2)/N |

---

## 🔑 File Allocation Comparison

| | Contiguous | Linked | Indexed |
|--|-----------|--------|---------|
| Sequential access | Excellent | Good | Good |
| Random access | Excellent | **Poor** | Excellent |
| External fragmentation | **Yes** | No | No |
| Internal fragmentation | No | No | No (index block only) |
| File growth | **Hard** | Easy | Easy |
| Overhead | None | Pointer/block | Index block |
| FAT variation | — | Yes (FAT) | — |
| Real-world | CD-ROM | FAT32 | Unix inodes |

---

## 🔑 File Access Methods

| Method | Order Required | Speed | Best For |
|--------|---------------|-------|---------|
| Sequential | Yes (one by one) | Medium | Logs, tapes |
| Direct | No (any block) | Fast | Databases |
| Index | No (via index) | Fast for large files | Large sorted data |

---

## 🔑 Directory Types

| Type | Multi-user | Same filename allowed | Grouping | Scalability |
|------|-----------|----------------------|---------|-------------|
| Single-level | ❌ | ❌ | ❌ | Poor |
| Two-level | ✅ | ✅ (different users) | ❌ | Moderate |
| Tree-structured | ✅ | ✅ (different paths) | ✅ | Excellent |

---

## 🔑 Free Space Management

| Method | Space | Speed | Best For |
|--------|-------|-------|---------|
| Bit Map | 1 bit/block | Fast (bitwise) | General, frequent alloc |
| Linked List | Minimal | Slow (traverse) | Simple systems |
| Grouping | Minimal | Medium | Finding blocks in bulk |
| Counting | Small | Medium | Contiguous patterns |

---

## 🔑 Access Matrix Implementations

| Method | Decomposition | Revocation | Real Use |
|--------|--------------|------------|---------|
| Global Table | Full matrix | Easy | Rarely |
| ACL (per object) | Column-wise | **Easy** | Very common (Unix, Windows) |
| Capabilities | Row-wise | **Hard** | Some OS |
| Lock-and-Key | Hybrid | Easy (change lock) | Rare |

---

## 🔑 Security Violations

| Category | Action | Example |
|----------|--------|---------|
| Breach of Confidentiality | Unauthorized **read** | Data theft |
| Breach of Integrity | Unauthorized **modify** | Record tampering |
| Breach of Availability | Unauthorized **destroy** | Ransomware |
| Theft of Service | Unauthorized **use** | Crypto mining |
| Denial of Service | **Prevent** legitimate use | Server flood |

---

## 🔑 Program Threats

| Threat | Host? | Self-Replicates? | Trigger |
|--------|-------|-----------------|---------|
| Trojan Horse | Looks legit | No | Execution |
| Logic Bomb | Hidden in code | No | Condition/Event |
| Trapdoor | Inside code | No | Secret input |
| Buffer Overflow | Vulnerable code | No | Malformed input |
| Virus | Yes (file) | Yes (files) | Host run |
| Worm | No | Yes (network) | Network vuln |

---

## 🔑 OSI Model Layers

| # | Layer | Key Role | Protocol Examples |
|---|-------|---------|-------------------|
| 7 | Application | User interaction, file transfer, email | HTTP, FTP, SMTP |
| 6 | Presentation | Format translation, encryption | SSL/TLS |
| 5 | Session | Process-to-process sessions | NetBIOS |
| 4 | Transport | Packet ordering, flow control, addresses | TCP, UDP |
| 3 | Network | Routing, addressing | IP |
| 2 | Data Link | Frames, error detection (P2P) | Ethernet, Wi-Fi |
| 1 | Physical | Bit transmission | Cable, fiber, radio |

**Memory trick:** "Please Do Not Throw Sausage Pizza Away" (bottom to top)

---

## 🔑 Routing Strategy Comparison

| Strategy | Path | Adapts to Load? | Message Order | Use |
|----------|------|-----------------|---------------|-----|
| Fixed | Pre-determined | No | Preserved | Simple networks |
| Virtual Circuit | Fixed per session | Partially | Preserved | ATM |
| Dynamic | Chosen per message | **Yes** | May arrive out-of-order | Internet |

---

## 🔑 Client-Server vs P2P

| | Client-Server | Peer-to-Peer |
|--|---------------|--------------|
| Architecture | Centralized | Decentralized |
| Point of failure | Server (single) | None |
| Management | Easy | Hard |
| Scalability | Server-limited | Node-driven |
| Examples | Web, email, SQL | BitTorrent, blockchain |

---

*End of OS Study Notes – Unit 3, Topic-wise 🎯*
