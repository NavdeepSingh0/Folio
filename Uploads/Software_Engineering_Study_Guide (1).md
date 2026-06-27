# Software Engineering - Complete Study Guide
## Comprehensive Notes from All Lectures (1.1 - 1.3)

---

## Table of Contents

### Chapter 1.1 - Introduction to Software Engineering
- [1.1.1 Definitions](#111-definitions)
- [1.1.2 Software Engineering Fundamentals](#112-software-engineering-fundamentals)
- [1.1.3 Software Development Life Cycle](#113-software-development-life-cycle-sdlc)
- [1.1.4 Classical Waterfall Model](#114-classical-waterfall-model)
- [1.1.5 Agile Software Development](#115-agile-software-development)

### Chapter 1.2 - Software Development Fundamentals
- [1.2.1 Requirements Analysis](#121-requirements-analysis)
- [1.2.2 Software Requirement Specification (SRS)](#122-software-requirement-specification-srs)
- [1.2.3 Behavioral Modeling](#123-behavioral-modeling)
- [1.2.4 Structural Modeling](#124-structural-modeling)

### Chapter 1.3 - Function and Object-Oriented Design
- [1.3.1 Function Oriented Design](#131-function-oriented-design)
- [1.3.2 Data Dictionaries and Structured Charts](#132-data-dictionaries-and-structured-charts)
- [1.3.3 Object-Oriented Design](#133-object-oriented-design)
- [1.3.4 UML Diagrams](#134-uml-diagrams)
- [1.3.5 Behavioral Diagrams](#135-behavioral-diagrams)
- [1.3.6 Statechart Diagrams](#136-statechart-diagrams)

---

# Chapter 1.1 - Introduction to Software Engineering

## 1.1.1 Definitions

### Software
**Definition**: Software is a program or set of programs containing instructions which provide desired functionality. The software is a collection of integrated programs. Software consists of carefully-organized instructions and code written by programmers in any of various special computer languages.

### Software Engineering
**Definition**: Software engineering (SE) is the application of engineering to the development of software in a systematic method. It is a systematic approach to the design, development, operation, and maintenance of a software system.

### Software Requirement Specification (SRS)
**Definition**: Software requirements specification (SRS) is a document that captures complete description about how the system is expected to perform.

### Software Development Life Cycle (SDLC)
**Definition**: The systems development life cycle (SDLC), also referred to as the application development life-cycle, is a term used in systems engineering, information systems and software engineering to describe a process for planning, creating, testing, and deploying an information system.

### Requirements Analysis
It is the first stage in the systems engineering process and software development process. Requirements analysis encompasses those tasks that go into determining the needs or conditions to meet for a new or altered product, taking account of the possibly conflicting requirements of the various stakeholders.

### Dual Role of Software

Software can act in two different ways:

#### 1. As a Product:
- Delivers the computing potential across network of Hardware
- Enables the Hardware to deliver the expected functionality
- Acts as information transformer (produces, manages, acquires, modifies, displays, or transmits information)

#### 2. As a Vehicle for Delivering a Product:
- Provides system functionality
- Controls other software
- Helps build other software

### Program vs. Software

| Aspect | Program | Software Product |
|--------|---------|------------------|
| **Size** | Usually small | Usually large |
| **Users** | Developed by individuals (single user) | Developed by large number of users |
| **Documentation** | No documentation or lack of proper documentation | Proper documentation and user manual prepared |
| **Development** | Unplanned, usually not systematic | Well systematic, organized, planned approach |
| **Functionality** | Limited functionality and features | More functionality, more options and features |

---

## 1.1.2 Software Engineering Fundamentals

### What is Software Engineering?

Software Engineering is a systematic approach to the design, development, operation, and maintenance of a software system. It is an engineering discipline that's applied to the development of software in a systematic approach (called a software process).

**Key Aspects**:
- Application of theories, methods, and tools to design and build software
- Meets specifications efficiently
- Cost-effective
- Ensures quality
- Not only technical process but also includes project management, tools, methods and theories

**Important Note**: Not applying software engineering methods results in more expensive, less reliable software. The costs will dramatically increase as changes come in.

### Objectives of Software Engineering

1. **Maintainability** - The ease with which changes in a functional unit can be performed to meet prescribed requirements

2. **Correctness** - The extent to which software meets its specified requirements

3. **Reusability** - The extent to which a module can be used in multiple applications

4. **Testability** - The extent to which software facilitates both the establishment of test criteria and evaluation

5. **Reliability** - The extent to which a program can be expected to perform its intended function over an arbitrary time period

6. **Portability** - The ease with which software can be transferred from one computer system or environment to another

7. **Adaptability** - The ease with which software allows differing system constraints and user needs to be satisfied

### Importance of Software Engineering

#### 1. Reduces Complexity
- Software engineering has a great solution to reduce the complication of any project
- Divides big problems into various small issues
- Each small issue is solved independently

#### 2. Minimizes Software Cost
- Programmers project everything and decrease unnecessary things
- Cost for software production becomes less compared to software without SE methods

#### 3. Decreases Time
- Well-handled procedures save time
- Software made according to SE methods decreases development time significantly

#### 4. Handling Big Projects
- Big projects need patience, planning, and management
- Requires lots of resources and should be completed on time
- SE methods help handle big projects without problems

#### 5. Reliable Software
- Software should be secure and work for its given time/subscription
- SE includes testing and maintenance, ensuring reliability

#### 6. Effectiveness
- Software becomes more effective when made according to standards
- Software engineering helps make software more effective

---

## 1.1.3 Software Development Life Cycle (SDLC)

### Definition
Software Development Life Cycle (SDLC) is a process used by the software industry to design, develop and test high-quality software. The SDLC aims to:
- Produce high-quality software that meets or exceeds customer expectations
- Reach completion within time and cost estimates
- Define methodology for improving quality of software

### SDLC Phases

#### Phase 1: Planning and Requirement Analysis
- Most important and fundamental stage in SDLC
- Performed by senior team members with inputs from:
  - Customer
  - Sales department
  - Market surveys
  - Domain experts
- Used to plan basic project approach
- Conduct product feasibility study (economical, operational, technical)
- Plan quality assurance requirements
- Identify risks associated with the project

#### Phase 2: Defining Requirements
- Clearly define and document product requirements
- Get approval from customer or market analysts
- Done through SRS (Software Requirement Specification) document
- Contains all product requirements to be designed and developed

#### Phase 3: Designing the Product Architecture
- SRS is reference for product architects
- Multiple design approaches proposed and documented in DDS (Design Document Specification)
- DDS reviewed by stakeholders
- Best design selected based on:
  - Risk assessment
  - Product robustness
  - Design modularity
  - Budget and time constraints
- Internal design of all modules clearly defined

#### Phase 4: Building or Developing the Product
- Actual development starts
- Programming code generated as per DDS
- Developers follow coding guidelines
- Programming tools used: compilers, interpreters, debuggers
- Programming languages: C, C++, Pascal, Java, PHP (chosen based on software type)

#### Phase 5: Testing the Product
- Testing activities involved in all stages
- Product defects reported, tracked, fixed, and retested
- Continues until product reaches quality standards defined in SRS

#### Phase 6: Deployment and Maintenance
- Product released formally in appropriate market
- May be deployed in stages per business strategy
- First released in limited segment
- Tested in real business environment (UAT - User Acceptance Testing)
- Maintenance for issues, patches, and enhancements

---

## 1.1.4 Classical Waterfall Model

### Overview
The Waterfall Model was the first Process Model to be introduced. It is also referred to as a **linear-sequential life cycle model**.

**Characteristics**:
- Very simple to understand and use
- Each phase must be completed before next phase begins
- No overlapping in phases
- Linear sequential flow
- Earliest SDLC approach

### Sequential Phases in Waterfall Model

#### 1. Requirement Gathering and Analysis
- All possible requirements captured
- Documented in requirement specification document

#### 2. System Design
- Requirement specifications studied
- System design prepared
- Specifies hardware and system requirements
- Defines overall system architecture

#### 3. Implementation
- System developed in small programs called units
- Units integrated in next phase
- Each unit developed and tested (Unit Testing)

#### 4. Integration and Testing
- All units integrated into system
- Post integration, entire system tested for faults and failures

#### 5. Deployment of System
- Functional and non-functional testing completed
- Product deployed in customer environment or released to market

#### 6. Maintenance
- Issues fixed through patches
- Better versions released for enhancement
- Changes delivered in customer environment

### Waterfall Model - Application

**When to Use**:
- Requirements are very well documented, clear and fixed
- Product definition is stable
- Technology is understood and not dynamic
- No ambiguous requirements
- Ample resources with required expertise available
- Project is short

**When NOT to Use**:
- Requirements are at moderate to high risk of changing
- Requirements are continuously changing
- Complex projects with high risk
- Project is long and ongoing

### Advantages of Waterfall Model

1. Simple and easy to understand and use
2. Easy to manage due to rigidity - each phase has specific deliverables and review
3. Phases are processed and completed one at a time
4. Works well for smaller projects with clearly understood requirements
5. Clearly defined stages
6. Well understood milestones
7. Easy to arrange tasks
8. Process and results are well documented

### Disadvantages of Waterfall Model

1. No working software produced until late in life cycle
2. High amounts of risk and uncertainty
3. Not good for complex and object-oriented projects
4. Poor for long and ongoing projects
5. Not suitable where requirements are at moderate to high risk of changing
6. Difficult to measure progress within stages
7. Cannot accommodate changing requirements
8. Adjusting scope during life cycle can end a project
9. Integration is done as "big-bang" at end, no early prototypes

---
---

## 1.1.5 Iterative Waterfall Model

### Overview
The Iterative Waterfall Model is an **Enhanced Waterfall with Feedback Loops**. It addresses the rigidity of the classical model by allowing feedback between phases.

**Key Features**:
1.  **Feedback Loops**: Feedback is possible between adjacent phases only (e.g., Design can send feedback to Requirements).
2.  **Early Error Correction**: Errors can be corrected earlier in the development lifecycle.
3.  **Sequential yet Flexible**: Maintains the sequential structure of the classical waterfall but adds flexibility.
4.  **Continuous Refinement**: Better quality is achieved through continuous iterative refinement.
5.  **Overlapping Phases**: Allows overlapping phases for specific activities.

### Structure (Build-Evaluate-Refine)
It follows a cycle: **Requirements ↔ Design ↔ Implementation ↔ Testing ↔ Deployment**, where each phase can circle back to the previous one for corrections.

### Advantages
1.  **Feedback**: Allows feedback and improvements between phases.
2.  **Flexibility**: More flexible than the traditional Waterfall model.
3.  **Risk Reduction**: Reduces risks through repeated refinement cycles.
4.  **Early Misunderstanding Handling**: Better handling of requirement misunderstandings early on.
5.  **Controlled Iteration**: Ensures structured progress.

### Disadvantages
1.  **Less Flexible than Agile**: Still less flexible compared to modern agile methods.
2.  **Duration**: Iterations may increase the overall project duration.
3.  **Documentation Overhead**: Changes between phases can create additional documentation work.
4.  **Not for Dynamic Reqs**: Not ideal for highly dynamic or unclear requirements.
5.  **Error Propagation**: Errors in early phases may still propagate if not caught immediately.

---

## 1.1.6 Prototype Model

### Overview
In this model, a prototype (an early approximation of a final system or product) is built, tested, and then reworked as necessary until an acceptable prototype is finally achieved from which the complete system or product can now be developed.

**Cycle**: **Quick Design → Build Prototype → Customer Evaluates → Refine or Build Final**

**Process Overview**:
A quick working model with limited functionality is developed initially. User feedback is incorporated iteratively throughout development cycles. This approach significantly reduces the risk of project failure through continuous validation.

### Types of Prototypes
1.  **Throwaway Prototype**:
    *   **Description**: Discarded after use.
    *   **Purpose**: To clarify requirements (understand what the user wants).
2.  **Evolutionary Prototype**:
    *   **Description**: Refined continuously.
    *   **Purpose**: Eventually becomes the final product.

### Advantages
1.  **User Involvement**: Active user involvement ensures better requirements.
2.  **Reduced Risks**: Reduced development risks and costs.
3.  **Early Understanding**: Better understanding of user needs early in the process.

### Disadvantages
1.  **Time-Consuming**: Can be time-consuming initially.
2.  **User Expectations**: Users may expect the prototype to be the actual final product.

---

## 1.1.7 Evolutionary Model

### Overview
The Evolutionary Model is an **Incremental Development Approach**. It is based on the idea of developing an initial implementation, exposing it to user comment, and evolving it through many versions until an adequate system has been developed.

**Key Aspects**:
1.  **Initial Core Version**: An initial version is released with only core functionality for user testing.
2.  **Progressive Addition**: Each subsequent version progressively adds new features based on feedback.
3.  **Driven by Feedback**: Continuous user feedback actively drives the overall development direction forward.
4.  **Accommodates Change**: Accommodates changing requirements effectively throughout the entire software development lifecycle.
5.  **Multiple Iterations**: Software evolves through multiple iterations until the complete system is achieved.

### Advantages
1.  **Continuous Refinement**: Supports continuous refinement based on user feedback.
2.  **Handles Unclear Reqs**: Handles unclear or changing requirements effectively.
3.  **Early Delivery**: Delivers working software early in development.
4.  **Risk Reduction**: Reduces project risks through incremental development.
5.  **Customer Involvement**: Encourages better customer involvement throughout cycles.

### Disadvantages
1.  **Scope Creep**: Can lead to frequent requirement changes and scope creep.
2.  **Unpredictable Timeline**: Overall development timeline may become unpredictable.
3.  **Resource Intensive**: Requires continuous customer interaction and availability.
4.  **Documentation Issues**: Documentation may be incomplete or inconsistent.
5.  **Not for Small Projects**: Not suitable for very small or short-term projects.

---

## 1.1.8 Spiral Model

### Overview
The Spiral Model combines **iterative development** with systematic aspects of the Waterfall model and **continuous risk analysis**. It is tailored for large, complex, and high-risk projects.

**Process**: Development proceeds through repeated spirals or refinement cycles.
**4 Phases per Spiral**:
1.  **Planning**: Determine objectives, alternatives, and constraints.
2.  **Risk Analysis**: Analyze alternatives and identify/resolve risks.
3.  **Engineering**: Develop and verify the product (Prototype -> Code).
4.  **Evaluation**: Customer evaluation and planning for the next phase.

### Characteristics
1.  **Risk Driven**: Strong focus on risk identification and reduction.
2.  **Multiple Iterations**: Each spiral produces increasingly refined software versions.
3.  **Hybrid**: Combines strengths of waterfall (systematic) and prototype (iterative).
4.  **Customer Focus**: Customer involvement throughout the entire process.

### Advantages
1.  **Risk Management**: excellent for handling risks.
2.  **Large Projects**: Suitable for large, complex, and high-risk projects.
3.  **Early Feedback**: Allows early customer feedback and requirement validation.
4.  **Flexibility**: Flexible with iterative refinement across all phases.

### Disadvantages
1.  **Expensive**: Can be expensive due to continuous risk analysis.
2.  **Expertise Needed**: Requires highly skilled risk management experts.
3.  **Complex**: Model is complex to manage and implement.
4.  **Not for Small Projects**: Not suitable for small or low-budget projects.
5.  **Timeline**: Project timeline may extend due to repeated cycles.

---

## 1.1.9 V-Model (Verification & Validation)

### Overview
The V-Model is an extension of the Waterfall model where **Process Execution** happens in a sequential V-shape. For every development phase, there is a corresponding testing phase.

**Key Concept**: **Testing is planned parallel** to development activities. It is NOT just an activity at the end.

### Phases
1.  **Requirement Analysis** ↔ **Acceptance Testing**
2.  **System Design** ↔ **System Testing**
3.  **Architecture Design** ↔ **Integration Testing**
4.  **Module Design** ↔ **Unit Testing**
5.  **Coding** (Bottom of the V)

### Advantages
1.  **Early Test Planning**: Emphasizes early test planning for higher product quality.
2.  **Clear Structure**: Clear structure with well-defined verification and validation stages.
3.  **Cost Reduction**: Detects defects early, reducing overall development cost.
4.  **Manageable**: Easy to manage due to phase-by-phase approach.
5.  **Reliability**: Suitable for critical systems requiring high reliability.

### Disadvantages
1.  **Rigidity**: Very rigid; changes are difficult to accommodate.
2.  **Unclear Requirements**: Not suitable for projects with unclear or evolving requirements.
3.  **Error Propagation**: Early errors may cause major issues later.
4.  **Late Product**: Working software is produced very late in the process.
5.  **Testing Expertise**: Requires strong understanding of testing at all stages.

---

## 1.1.10 Agile Software Development

### Definition
Agile is a **time-bound, iterative approach** to software delivery that builds software incrementally from the start of the project, instead of trying to deliver all at once.

### Why Agile?

**Problems with Traditional Models**:
- Technology progressing faster than ever
- Fast-paced changing environment
- Impossible to gather complete and exhaustive set of requirements
- Conventional models (like Waterfall) depend on completely specifying requirements
- Not geared towards rapid software development

**Solution**: Agile software development
- Specially designed for rapidly changing environment
- Embraces idea of incremental development
- Develops actual final product iteratively

### Characteristics of Agile Model

1. **Highest priority**: Satisfy customer through early and continuous delivery of valuable software

2. **Welcomes changing requirements**, even late in development

3. **Frequent delivery**: Deliver working software frequently (weeks to months), with preference to shortest timescale

4. **Motivated individuals**: Build projects around motivated individuals, give them environment and support needed

5. **Working software**: Primary measure of progress

6. **Simplicity**: Art of maximizing amount of work NOT done is essential

7. **Face-to-face conversation**: Most efficient method of conveying information

### Development Process in Agile

- Design and Implementation are central activities
- Design and Implementation incorporate requirements elicitation and testing
- Iteration occurs across activities
- Requirements and design developed together
- Requirements, design planning, and development executed in series of increments
- Focuses more on code development rather than documentation
- Gives extra level of flexibility compared to conventional models

### Advantages of Agile

1. **Quicker deployment** - Helps in increasing customer satisfaction
2. **Realistic approach** - Promotes teamwork and cross training
3. **Functionality development** - Developed and demonstrated to customer
4. **Resource requirements** - Minimal
5. **Suitable** - For fixed or changing requirements
6. **Easy delivery** - Quick and continuous delivery
7. **Minimal rules** - Easy to manage
8. **Concurrent development** - Enables
9. **Working methodology** - More realistic
10. **Less documentation** - More time on development

### Disadvantages of Agile

1. **Not suitable** - For handling complex dependencies
2. **More risk** - Greater risk of sustainability, maintainability, extensibility
3. **Documentation** - Overall plan, agile leader required
4. **Transfer of technology** - More difficult due to lack of documentation
5. **Difficult** - For large projects where documentation essential
6. **High individual dependency** - Newbies may struggle

### Spiral Model (Additional SDLC Model)

**Characteristics**:
- Risk-driven approach
- Combines iterative and waterfall models
- Four phases: Planning, Risk Analysis, Engineering, Evaluation

**Advantages**:
- Changing requirements can be accommodated
- Extensive use of prototypes
- Requirements captured more accurately
- Users see system early
- Development can be divided into smaller parts
- Risky parts developed earlier (better risk management)

**Disadvantages**:
- Management more complex
- End of project may not be known early
- Not suitable for small or low risk projects
- Could be expensive for small projects
- Process is complex
- Spiral may go on indefinitely
- Large number of intermediate stages requires excessive documentation

---

# Chapter 1.2 - Software Development Fundamentals

## 1.2.1 Requirements Analysis

### Overview
Requirement analysis is **significant and essential activity** after elicitation. We analyze, refine, and scrutinize gathered requirements to make consistent and unambiguous requirements.

**Purpose**:
- Reviews all requirements
- Provides graphical view of entire system
- Improves understandability of project
- Uses interaction with customer to clarify confusion
- Understands which requirements are more important

### Steps of Requirement Analysis

#### Step 1: Draw the Context Diagram
- Simple model defining boundaries and interfaces
- Identifies entities outside proposed system that interact with system
- Shows external world interaction points

**Example**: Student Result Management System context diagram would show:
- Students
- Teachers/Faculty
- Administrator
- External systems

#### Step 2: Development of a Prototype (Optional)
**Purpose**:
- Find out what customer wants
- Something that looks and acts as part of desired system
- Get feedback to modify until customer satisfied

**Benefits**:
- Helps client visualize proposed system
- Increases understanding of requirements
- Useful when developers and users uncertain about elements

**Important Notes**:
- Should be built quickly and at low cost
- Will have limitations
- Not acceptable in final system
- For market products, show to representative sample of potential purchasers

#### Step 3: Model the Requirements
**Consists of graphical representations**:
- Functions
- Data entities
- External entities
- Relationships between them

**Tools Used**:
- Data Flow Diagrams (DFD)
- Entity-Relationship Diagrams (ERD)
- Data Dictionaries
- State-transition Diagrams

**Benefits**:
- Helps find incorrect, inconsistent, missing, and superfluous requirements

#### Step 4: Finalize the Requirements
- Better understanding of system behavior after modeling
- Inconsistencies and ambiguities identified and corrected
- Data flow amongst modules analyzed
- Finalize analyzed requirements
- Document in prescribed format

### Analysis Principles

#### Operational Principles:
1. Information domain must be represented and understood
2. Functions software performs must be defined
3. Behavior of software must be represented
4. Models depicting information, function, and behavior must be partitioned to uncover details in layered fashion
5. Analysis process should move from essential information toward implementation detail

#### Additional Principles for Requirements Engineering:
1. Understand problem before creating analysis model
2. Develop prototypes enabling user to understand human/machine interaction
3. Record origin and reason for every requirement
4. Use multiple views of requirements
5. Rank requirements
6. Work to eliminate ambiguity

### Software Prototyping

**Definition**: Development of preliminary version of software system to allow certain aspects to be investigated.

**Primary Purpose**:
- Obtain feedback from intended users
- Update requirements specification
- Increase confidence in final system

**Additional Uses**:
- Investigate particular problem areas
- Explore implications of alternative design/implementation decisions

**Characteristics**:
- Obtain required information rapidly
- Minimum investment of resources
- Concentrate on certain aspects, ignore others
- May have no concern for efficiency/performance
- Some functions may be entirely omitted
- Must be realistic in aspects under investigation

---

## 1.2.2 Software Requirement Specification (SRS)

### Definition
A Software Requirements Specification (SRS) is a **document that captures complete description** about how the system is expected to perform. Usually signed off at end of requirements engineering phase.

### Purpose of SRS
- Detailed description of software system to be developed
- Includes functional and non-functional requirements
- Developed based on agreement between customer and contractors
- May include use cases of user interaction with system
- Contains all necessary requirements for project development

### Importance for Testing
- QA lead and managers create test plan based on SRS
- Testers must be clear with every detail to avoid faults in test cases
- Expected results must be clearly defined

### 2.1 Qualities of SRS

#### 1. Correctness
- Should be checked against standards
- Whole testing phase depends on SRS
- Must be verifiable

#### 2. Avoid Ambiguity
- Words should not have multiple meanings
- Clear meaning for better understanding
- Avoid confusion for testers

#### 3. Complete Requirements
- Clearly state what exactly is required
- Example: If sending data, specify data size limit
- All aspects covered

#### 4. Consistent Requirements
- Consistent within itself
- Consistent to reference documents
- Use same terminology throughout
- Follow standard naming conventions

#### 5. Verification of Expected Result
- Never use statements like "Work as expected"
- Clearly state what is expected
- Different testers should understand same expectation

#### 6. Testing Environment
- Specific conditions needed for testing
- Particular environment for accurate results
- Clear documentation of environment setup

#### 7. Pre-conditions Defined Clearly
- Most important part of test cases
- If not met properly, results will differ from expected
- All pre-conditions mentioned clearly in SRS

#### 8. Requirements ID
- Base of test case template
- Test case IDs written based on requirement IDs
- Easy to categorize modules
- Each ID defines particular module

#### 9. Security and Performance Criteria
- Security is priority, especially for sensitive information
- All security requirements properly defined
- Performance requirements clear
- Stress/load testing details specified

#### 10. Avoid Assumptions
- Assumptions could go wrong
- Test results may vary with assumptions
- Better to ask clients about missing requirements
- Ensure better understanding of expected results

#### 11. Delete Irrelevant Requirements
- Multiple teams work on SRS
- May include irrelevant requirements
- Remove to avoid confusion
- Reduce workload

#### 12. Freeze Requirements
- After client analyzes ambiguous/incomplete requirement
- Updated in next SRS version
- Client freezes requirement
- Result won't change unless major addition/modification

### Properties of Good SRS Document

#### 1. Concise
- Concise yet unambiguous, consistent, and complete
- Verbose descriptions decrease readability
- Increase error possibilities

#### 2. Structured
- Well-structured for easy understanding
- Simple to modify
- SRS undergoes several revisions
- Requirements evolve over time

#### 3. Black-box View
- Define what system should do
- Not how to do it
- Defines external behavior
- No discussion of implementation issues
- View system as black box
- Also known as black-box specification

#### 4. Conceptual Integrity
- Show conceptual integrity
- Reader can understand easily

#### 5. Response to Undesired Events
- Characterize acceptable responses to unwanted events
- System response to exceptional conditions

#### 6. Verifiable
- All requirements should be correct
- Should be possible to decide if requirements met in implementation

---

## 1.2.3 Behavioral Modeling

### Overview
Behavioral modeling is the analysis of how customers, or a whole cohort of customers, interact with a company, product, or service. 

**Purpose**:
- Determine whether or not to offer a service or product
- Identify potential customers
- Develop marketing strategies

**Application**: Used to establish and predict patterns and trends involving consumers or other end users.

### Context
The term behavioral modeling is broader than finance or business. It also refers to:
- Computer programming
- Geographical modeling
- Social sciences and psychology

**In Finance/Business**:
- Tries to explain:
  - Why individual or company makes decision to buy stock
  - Why individual may decide to hold rather than sell stock
- Attempts to model thinking processes relating to choice

**Goal**: Understand how decision-making happens in these contexts

### Breaking down Behavioral Modeling

**Usage by Financial Institutions**:
- Banks and credit card companies use behavioral modeling
- Estimate how individuals likely to use services

**Example - Credit Card Company**:
- Examines types of businesses card used at
- Location of stores
- Frequency and amount of purchases
- Estimates:
  - Future purchase behavior
  - Whether cardholder likely to have repayment problems

### Example of Behavioral Modeling

**Credit Card Spending Pattern Analysis**:
- Cardholder shifted from discount stores to high-end stores over 6 months
- Could indicate: income increase OR overspending
- To narrow down options and create accurate risk profile:
  - Check if only paying minimum payment
  - Check for late payments
  - Late payments indicate greater risk of insolvency

**Retail Application**:
- Retailers make estimates about consumer purchases
- Examine types of products purchased (in-store or online)
- Estimate likelihood of purchasing new product based on similarity to previous purchases
- Especially useful with customer loyalty programs
- Track individual spending patterns with granularity

**Example - Store Promotion**:
- If customers purchasing shampoo also purchase soap with coupon
- Store provides coupon for soap at point-of-sale to customer buying only shampoo

---

## 1.2.4 Structural Modeling

### Overview
Structural modeling captures the **static features** of a system.

**Components of Structural Modeling**:
- Class diagrams
- Object diagrams
- Deployment diagrams
- Package diagrams
- Composite structure diagram
- Component diagram

**Purpose**:
- Represents framework for system
- Framework is place where all other components exist
- Never describes dynamic behavior of system

### Types of Structural Models

#### Static Models
- Show structure of system design

#### Dynamic Models
- Show organization of system when executing

**Note**: These are NOT the same thing - dynamic organization (interacting threads) may be very different from static model of system components

### When to Create Structural Models

**Created when**:
- Discussing system architecture
- Designing system architecture

**Architectural Design**:
- Particularly important topic in software engineering
- UML component, package, and deployment diagrams used for architectural models
- Analysis-level class diagrams useful for understanding problem domain

### Domain Concept
**Domain**: Autonomous, real, or hypothetical world inhabited by distinct set of objects that behave according to rules and policies characterizing domain

**Subject Matters**: Different domains represent different subject matters we need to understand to build system

### UML Class Diagrams

**Purpose**:
- Used when developing object-oriented system model
- Show classes in system
- Show associations between classes

**Object Class**: General definition of one kind of system object

**Association**: Link between classes indicating some relationship exists

**During Early Stages**:
- Objects represent something in real world
- Examples: patient, prescription, doctor, etc.

### System Structure Display
- Display organization of system
- In terms of components that make up system
- Their relationships

---

# Chapter 1.3 - Function and Object-Oriented Design

## 1.3.1 Function Oriented Design

### Definition
In function-oriented design, the system is comprised of many smaller sub-systems known as **functions**. These functions are capable of performing significant tasks in the system. The system is considered as top view of all functions.

### Key Characteristics

#### 1. Inherits Properties of Structured Design
- Uses divide and conquer methodology
- Divides whole system into smaller functions
- Provides means of abstraction
- Conceals information and operations

#### 2. Information Sharing
- Functional modules can share information among themselves
- By means of information passing
- Using information available globally

#### 3. State Changes
- When program calls a function, function changes program state
- Sometimes not acceptable by other modules
- Works well where system state doesn't matter
- Program/functions work on input rather than state

### Function-Oriented Design Method
- Method to software design
- Model decomposed into set of interacting units/modules
- Each unit/module has clearly defined function
- System designed from functional viewpoint

### Design Notations
Design notations are primarily meant to be used during design process and represent design or design decisions.

**For Function-Oriented Design, represented by**:
1. Data Flow Diagrams (DFD)
2. Data Dictionaries  
3. Structured Charts
4. Pseudo Code

---

### Data Flow Diagram (DFD)

#### Overview
Data-flow design is concerned with designing a series of functional transformations that convert system inputs into required outputs. Design described as data-flow diagrams.

**Purpose**:
- Show how data flows through system
- Show how output derived from input
- Through series of functional transformations

#### Benefits of DFD
1. Useful and intuitive way of describing system
2. Generally understandable without specialized training (if control information excluded)
3. Show end-to-end processing
4. Can trace flow from data entry to data exit

#### DFD in Design Methods
- Integral part of several design methods
- Most CASE tools support DFD creation
- Different methods may use different icons
- Meanings are similar across notations

#### DFD Notation Symbols

**1. External Entity** (Rectangle)
- Represents sources/destinations of data
- External to system being modeled

**2. Process** (Circle/Rounded Rectangle)
- Represents transformation of data
- Takes input and produces output
- Named with verb phrase

**3. Data Flow** (Arrow)
- Shows movement of data
- Direction shown by arrow
- Labeled with name of data

**4. Data Store** (Open Rectangle/Two Parallel Lines)
- Repository of data
- Labeled with name describing stored data

#### Example: Report Generator
**System Description**:
- Produces report describing named entities in DFD
- User inputs name of design
- Report generator finds all names in DFD
- Looks up data dictionary
- Retrieves information about each name
- Collates into report
- Outputs report

---

## 1.3.2 Data Dictionaries and Structured Charts

### Data Dictionaries

#### Definition
A data dictionary lists all data elements appearing in the DFD model of a system.

**Contents**:
- All data flows
- Contents of all data stores appearing in DFDs
- All data items listed
- Objective of data items
- Definition of composite data elements in terms of components

#### Example Entry
```
grossPay = regularPay + overtimePay
```

#### Smallest Units
For smallest data element units, dictionary lists:
- Name
- Type

### Significance of Data Dictionary

#### 1. Standard Language
- Provides standard language for all relevant information
- Essential for large projects
- Different engineers tend to use different terms for same data
- Prevents unnecessary confusion

#### 2. Analysis Tool
- Provides analyst with means to determine definition of data structures
- In terms of component elements

---

### Structured Charts

#### Definition
Partitions system into **black boxes**. A black box is a system where functionality is known to user without knowledge of internal design.

#### What Structured Chart Shows

**Graphical representation showing**:
1. System partitions into modules
2. Hierarchy of component modules
3. Relation between processing modules
4. Interaction between modules
5. Information passed between modules

#### Structured Chart Notations

**Components**:

1. **Module** (Rectangle)
   - Represents a function or subroutine
   - Named according to function performed

2. **Module Call** (Arrow connecting modules)
   - Shows invocation relationship
   - Direction shows caller and called module

3. **Data Couple** (Arrow with empty circle)
   - Represents data passed between modules
   - Labeled with data name

4. **Control Couple** (Arrow with filled circle)
   - Represents control information passed
   - Example: flags, switches

5. **Conditional Call** (Diamond on connecting line)
   - Module called only under certain conditions

6. **Loop** (Curved arrow)
   - Module called repeatedly

### Pseudo Code

#### Definition
System description in short English-like phrases describing the function.

**Characteristics**:
- Uses keywords and indentation
- Used as replacement for flow charts
- Decreases amount of documentation required

**Example**:
```
BEGIN
    Read input data
    IF condition is true THEN
        Process data
    ELSE
        Display error
    ENDIF
    Write output
END
```

---

## 1.3.3 Object-Oriented Design

### Overview
In object-oriented design method, system is viewed as **collection of objects (entities)**. 

**Key Points**:
- State distributed among objects
- Each object handles its own state data
- Tasks defined for one object cannot refer or change data of other objects
- Objects have internal data representing state
- Similar objects create a class
- Each object is member of some class
- Classes may inherit features from super class

### Example
**Library Automation Software**:
- Each library representative may be separate object
- Has its own data
- Has functions to operate on that data

---

### Terms Related to Object Design

#### 1. Objects
- All entities involved in solution design
- Examples: person, banks, company, users
- Every entity has attributes
- Has methods to perform on attributes

#### 2. Classes
- Generalized description of an object
- Object is instance of a class
- Defines all attributes an object can have
- Defines methods representing object functionality

#### 3. Messages
- Objects communicate by message passing
- Consist of integrity of target object
- Name of requested operation
- Any other action needed to perform function
- Often implemented as procedure or function calls

#### 4. Abstraction
- In OOD, complexity handled using abstraction
- **Definition**: Removal of irrelevant and amplification of essentials
- Reduces complexity
- Focuses on what object does rather than how

#### 5. Encapsulation
- Also called information hiding concept
- Data and operations linked to single unit
- Bundles essential information together
- Restricts access to data and methods from outside world

**Benefits**:
- Data hiding and security
- Controlled access through methods
- Modularity

#### 6. Inheritance
- Allows similar classes to stack in hierarchical manner
- Lower/sub-classes can import, implement, re-use allowed variables and functions from super classes
- Makes it easier to:
  - Define specific class
  - Create generalized classes from specific ones

**Types**:
- Single inheritance
- Multiple inheritance
- Multilevel inheritance
- Hierarchical inheritance

#### 7. Polymorphism
- OOD languages provide mechanism where methods performing similar tasks but varying in arguments can have same name
- Single interface performing functions for different types
- Depending on object type, function performs required operations

**Types**:
- **Compile-time Polymorphism** (Method Overloading)
- **Runtime Polymorphism** (Method Overriding)

---

### OOP Concepts in Detail

#### Classes and Objects

**Class Example**:
```java
public class Student {
    // Attributes
    private String name;
    private int rollNumber;
    private double gpa;
    
    // Constructor
    public Student(String name, int rollNumber) {
        this.name = name;
        this.rollNumber = rollNumber;
        this.gpa = 0.0;
    }
    
    // Methods
    public void setGPA(double gpa) {
        if (gpa >= 0.0 && gpa <= 4.0) {
            this.gpa = gpa;
        }
    }
    
    public void displayInfo() {
        System.out.println("Name: " + name);
        System.out.println("Roll: " + rollNumber);
        System.out.println("GPA: " + gpa);
    }
}
```

**Object Creation**:
```java
Student student1 = new Student("Alice", 101);
Student student2 = new Student("Bob", 102);
```

#### Access Modifiers

| Modifier | Same Class | Same Package | Subclass | Other Packages |
|----------|-----------|--------------|----------|----------------|
| **public** | ✓ | ✓ | ✓ | ✓ |
| **protected** | ✓ | ✓ | ✓ | ✗ |
| **default** | ✓ | ✓ | ✗ | ✗ |
| **private** | ✓ | ✗ | ✗ | ✗ |

---

## 1.3.4 UML Diagrams

### Unified Modeling Language (UML)

#### Definition
Unified Modeling Language (UML) is a standard language for **specifying, visualizing, constructing, and documenting** the artifacts of software systems.

**Main Aim**: Define standard way to visualize how a system has been designed (like blueprints in engineering)

**Important**: UML is NOT a programming language; it is a visual language

**Usage**:
- Portray behavior and structure of system
- Helps software engineers, businessmen, system architects
- Used for modeling, design, and analysis

**Standardization**:
- Adopted by Object Management Group (OMG) in 1997
- Published by ISO as approved standard in 2005
- Revised periodically

### Do We Really Need UML?

**YES, because:**

1. **Complex Applications**
   - Need collaboration and planning from multiple teams
   - Require clear and concise communication

2. **Business Communication**
   - Businessmen do not understand code
   - UML essential to communicate with non-programmers
   - Communicate requirements, functionalities, processes

3. **Time Saving**
   - Saves time down the line
   - Teams able to visualize:
     - Processes
     - User interactions
     - Static structure of system

### UML Diagram Classification

UML linked with **object-oriented design and analysis**. UML diagrams broadly classified as:

#### 1. Structural Diagrams
**Purpose**: Capture static aspects or structure of system

**Types**:
- Component Diagrams
- Object Diagrams
- Class Diagrams
- Deployment Diagrams
- Package Diagrams
- Composite Structure Diagrams

#### 2. Behavior Diagrams
**Purpose**: Capture dynamic aspects or behavior of system

**Types**:
- Use Case Diagrams
- State Diagrams
- Activity Diagrams
- Interaction Diagrams
  - Sequence Diagrams
  - Communication Diagrams
  - Timing Diagrams
  - Interaction Overview Diagrams

---

### Structural UML Diagrams

#### 1. Class Diagram
- Most widely used UML diagram
- Building block of all object-oriented software systems
- Depicts static structure of system
- Shows system's classes, methods, and attributes
- Helps identify relationships between classes/objects

#### 2. Composite Structure Diagram
- Represents internal structure of a class
- Its interaction points with other parts of system
- Represents relationship between parts and configuration
- Determines how classifier (class, component, deployment node) behaves
- Represent internal structure of structured classifier
- Makes use of parts, ports, and connectors
- Can model collaborations
- Similar to class diagrams but represent individual parts in detail

#### 3. Object Diagram
- Can be referred to as screenshot of instances in system
- Shows relationship that exists between them
- Depicts behavior when objects instantiated
- Able to study behavior of system at particular instant
- Similar to class diagram except shows instances of classes
- Depict actual classifiers and relationships
- Represent specific instances of classes and relationships at point of time

#### 4. Component Diagram
- Represent how physical components in system organized
- Used for modeling implementation details
- Depict structural relationship between software system elements
- Help understand if functional requirements covered by planned development
- Essential for complex systems
- Interfaces used by components to communicate

#### 5. Deployment Diagram
- Represent system hardware and its software
- Shows what hardware components exist
- What software components run on them
- Illustrate system architecture as distribution of software artifacts over distributed targets
- Artifact: information generated by system software
- Used when software used, distributed, or deployed over multiple machines with different configurations

#### 6. Package Diagram
- Depict how packages and elements organized
- Simply shows dependencies between different packages
- Shows internal composition of packages
- Help organize UML diagrams into meaningful groups
- Make diagram easy to understand
- Used to organize class and use case diagrams

---

## 1.3.5 Behavioral Diagrams

### 1. State Machine Diagrams (Statechart Diagrams)

#### Overview
- Used to represent condition of system or part of system at finite instances of time
- Behavioral diagram representing behavior using finite state transitions
- Also referred to as State machines and State-chart Diagrams
- Model dynamic behavior of class in response to time and changing external stimuli

#### Purpose
- To model dynamic aspect of system
- To model lifetime of reactive system
- Describe different states of object during lifetime
- Define state machine to model states of object

#### How to Draw
**Before drawing, clarify**:
- Identify important objects to analyze
- Identify the states
- Identify the events

**Example**: Order object analysis
- First state: idle state (process starts)
- Next states arrived for events:
  - Send request
  - Confirm request
  - Dispatch order
- Events responsible for state changes of order object
- During lifecycle, object goes through states
- May have abnormal exits (due to system problems)
- Complete lifecycle = complete transaction

#### Where to Use
**Used for**:
- Modeling object states of system
- Modeling reactive system (consists of reactive objects)
- Identifying events responsible for state changes
- Forward and reverse engineering

---

### 2. Activity Diagrams

#### Overview
Basic purposes similar to other diagrams but **shows message flow from one activity to another** (not object to object like other diagrams).

**Activity**: Particular operation of the system

**Purpose**:
- Not only visualize dynamic nature
- Also used to construct executable system using forward and reverse engineering
- Missing part: message flow between activities

**Note**: Sometimes considered as flowchart but they are NOT (shows parallel, branched, concurrent, and single flows)

#### Purpose of Activity Diagram
- Draw activity flow of system
- Describe sequence from one activity to another
- Describe parallel, branched, and concurrent flow of system

#### How to Draw
**Before drawing, identify**:
- Activities
- Association
- Conditions
- Constraints

**Example**: Order Management System
**Main activities identified**:
- Send order by customer
- Receipt of the order
- Confirm the order
- Dispatch the order

**Process**:
- After receiving order request, condition checks performed
- Check if normal or special order
- After order type identified, dispatch activity performed
- Marked as termination of process

#### Where to Use
**Used for**:
- Modeling workflow by using activities
- Modeling business requirements
- High level understanding of system's functionalities
- Investigating business requirements at later stage

**Practical Applications**:
- Drawn from very high level
- Gives high level view of system
- Mainly for business users or non-technical persons
- More impact on business understanding than implementation details

---

### 3. Use Case Diagrams

#### Purpose
Capture **dynamic aspect** of system. But specific purpose distinguishes it from other diagrams.

**Specific Purpose**:
- Gather requirements of system including internal and external influences
- Requirements are mostly design requirements
- When system analyzed to gather functionalities, use cases prepared and actors identified
- After initial task complete, use case diagrams modeled to present outside view

#### Benefits
- Help us to design system from end user's perspective
- Commonly used for gathering requirements of system
- Used to get outside view of system
- Identify external and internal factors influencing system
- Show interaction among requirements (actors)

#### Use Case Diagram Components

**1. Actor** (Stick Figure)
- Represents user or external system interacting with system
- Can be person, organization, or external system

**2. Use Case** (Oval)
- Represents functionality or service provided by system
- Named with verb phrase

**3. Association** (Line)
- Shows relationship between actor and use case
- Actor participates in use case

**4. System Boundary** (Rectangle)
- Represents scope of system
- Contains use cases
- Actors outside boundary

**Additional Relationships**:
- **Include**: One use case includes functionality of another
- **Extend**: One use case optionally extends another
- **Generalization**: Specialization relationship

---

### 4. Sequence Diagram

#### Overview
Simply depicts **interaction between objects in sequential order** (order in which interactions take place).

Also called:
- Event diagrams
- Event scenarios

**Purpose**:
- Describe how and in what order objects in system function
- Widely used by businessmen and software developers
- Document and understand requirements for new and existing systems

#### What Sequence Diagram Shows
- Objects taking part in interaction
- Message flows among objects
- Sequence in which messages flowing
- Object organization

#### Example: Order Management System
**Objects** (4 total):
- Customer
- Order
- SpecialOrder
- NormalOrder

**Message Sequence**:
1. First call: `sendOrder()` - method of Order object
2. Next call: `confirm()` - method of SpecialOrder object
3. Last call: `Dispatch()` - method of SpecialOrder object

Mainly describes method calls from one object to another (actual scenario when system running)

---

### 5. Communication Diagram (Collaboration Diagram in UML 1.x)

#### Overview
Used to show **sequenced messages exchanged between objects**.

**Focus**: Primarily on objects and their relationships

**Difference from Sequence Diagram**:
- Can represent similar information
- Communication diagrams represent objects and links in free form
- Sequence diagrams show chronological sequence

---

### 6. Timing Diagram

#### Overview
**Special form of Sequence diagrams** used to depict behavior of objects over a time frame.

**Usage**:
- Show time and duration constraints
- Govern changes in states and behavior of objects

---

### 7. Interaction Overview Diagram

#### Overview
Models **sequence of actions** and helps simplify complex interactions into simpler occurrences.

**Characteristics**:
- Mixture of activity and sequence diagrams

---

## 1.3.6 Statechart Diagrams (Detailed)

### Purpose
Statechart diagram is one of five UML diagrams used to model **dynamic nature** of system.

**Key Functions**:
- Define different states of object during lifetime
- States changed by events
- Useful to model reactive systems

**Reactive Systems**: Systems that respond to external or internal events

**Main Purpose**: Model lifetime of object from creation to termination

### Uses
- Model dynamic aspect of system
- Model lifetime of reactive system
- Describe different states of object during lifetime
- Define state machine to model states of object

### How to Draw Statechart Diagram

Statechart diagrams describe states of different objects in life cycle. Emphasis on **state changes upon some internal or external events**.

**Before drawing, clarify**:
1. Identify important objects to analyze
2. Identify the states
3. Identify the events

### Example: Order Object

**Process**:
- **First state**: Idle state (where process starts)
- **Next states**: Arrived for events like:
  - Send request
  - Confirm request
  - Dispatch order
- Events responsible for state changes of order object

**During lifecycle**:
- Object goes through various states
- May have abnormal exits (due to system problems)
- Complete lifecycle = complete transaction
- Initial and final state of object shown

### Where to Use Statechart Diagrams

**Specific Purpose**: Define state changes triggered by events

**Events**: Internal or external factors influencing system

**When implementing system**:
- Very important to clarify different states of object
- Statechart diagrams used for this purpose
- States and events identified and modeled
- Models used during implementation

**Practical Implementation**:
- Mainly used to analyze object states influenced by events
- Analysis helpful to understand system behavior during execution

**Main Usage**:
- Model object states of system
- Model reactive system (consists of reactive objects)
- Identify events responsible for state changes
- Forward and reverse engineering

---

## Key Exam Preparation Points

### Critical Topics to Master

#### Chapter 1.1
1. ✓ Definition of Software vs Software Engineering
2. ✓ Dual role of software (product and vehicle)
3. ✓ Program vs Software Product differences
4. ✓ Objectives and importance of Software Engineering
5. ✓ All SDLC phases in detail
6. ✓ Waterfall Model - when to use, advantages, disadvantages
7. ✓ Agile Model - characteristics, process, advantages, disadvantages
8. ✓ Spiral Model - characteristics, advantages, disadvantages

#### Chapter 1.2
1. ✓ Steps of Requirements Analysis (4 steps)
2. ✓ Analysis Principles
3. ✓ Software Prototyping purpose and characteristics
4. ✓ SRS - 12 qualities in detail
5. ✓ Properties of good SRS (6 properties)
6. ✓ Behavioral Modeling concept and application
7. ✓ Structural Modeling components and purpose

#### Chapter 1.3
1. ✓ Function-Oriented Design characteristics
2. ✓ DFD - symbols, purpose, benefits
3. ✓ Data Dictionary significance
4. ✓ Structured Charts - what they show
5. ✓ Object-Oriented Design - 7 key terms
6. ✓ UML - definition, purpose, why we need it
7. ✓ UML diagram classification (Structural vs Behavioral)
8. ✓ All 6 structural diagrams
9. ✓ All 7 behavioral diagrams
10. ✓ Use Case, Sequence, Activity, Statechart diagrams in detail

### Important Comparisons

| Waterfall | Agile |
|-----------|-------|
| Sequential phases | Iterative cycles |
| No overlapping | Continuous overlap |
| Requirements fixed upfront | Welcome changing requirements |
| Late testing | Testing in each iteration |
| High documentation | Minimal documentation |
| Best for stable requirements | Best for changing requirements |

| Function-Oriented | Object-Oriented |
|-------------------|-----------------|
| System = functions | System = objects |
| Top-down approach | Bottom-up approach |
| Focuses on processes | Focuses on data and objects |
| DFD as main tool | Class diagrams as main tool |
| State doesn't matter | State important |

| Structural Diagrams | Behavioral Diagrams |
|---------------------|---------------------|
| Static aspects | Dynamic aspects |
| Structure of system | Behavior of system |
| Class, Object, Component | Use Case, Sequence, Activity |
| Deployment, Package | State, Interaction |

### Quick Revision Formulas

**SRS Qualities (12)**:
1. Correctness
2. Avoid Ambiguity
3. Complete
4. Consistent
5. Verifiable
6. Testing Environment
7. Pre-conditions
8. Requirements ID
9. Security & Performance
10. Avoid Assumptions
11. Delete Irrelevant
12. Freeze Requirements

**Good SRS Properties (6)**:
1. Concise
2. Structured
3. Black-box View
4. Conceptual Integrity
5. Response to Undesired Events
6. Verifiable

**OOD Key Terms (7)**:
1. Objects
2. Classes
3. Messages
4. Abstraction
5. Encapsulation
6. Inheritance
7. Polymorphism

### Common Exam Question Patterns

1. **Define and explain**: Software Engineering, SDLC, SRS, UML
2. **Compare**: Waterfall vs Agile, Function-Oriented vs Object-Oriented
3. **List and explain**: SDLC phases, SRS qualities, UML diagrams
4. **When to use**: Waterfall model application, Agile advantages
5. **Draw diagrams**: DFD, Use Case, Sequence, Activity, Statechart
6. **Explain with example**: Requirements Analysis steps, Prototyping, Behavioral Modeling

---

## Study Tips

### Week-by-Week Plan

**Week 1**: Chapter 1.1
- Day 1-2: Definitions, Software Engineering fundamentals
- Day 3-4: SDLC phases
- Day 5-6: Waterfall Model
- Day 7: Agile and Spiral Models

**Week 2**: Chapter 1.2
- Day 1-2: Requirements Analysis
- Day 3-4: SRS (all qualities and properties)
- Day 5: Behavioral Modeling
- Day 6: Structural Modeling
- Day 7: Review and practice questions

**Week 3**: Chapter 1.3
- Day 1-2: Function-Oriented Design, DFD
- Day 3-4: Object-Oriented Design, all OOD terms
- Day 5-6: UML Diagrams (all types)
- Day 7: Practice drawing diagrams

**Week 4**: Final Review
- Day 1-3: Review all chapters
- Day 4-5: Practice questions
- Day 6: Mock test
- Day 7: Final revision

### Best Practices

1. **Make your own notes** - Summarize each topic in your own words
2. **Draw diagrams** - Practice all UML diagrams multiple times
3. **Use flashcards** - For definitions and comparisons
4. **Explain to others** - Teaching helps retention
5. **Practice questions** - Solve previous year papers
6. **Create mind maps** - Visual connections between concepts
7. **Time yourself** - Practice answering within time limits

---

**Good Luck with Your Exams! 🎯📚**

*Last Updated: February 2026*
*Total Lectures Covered: 15 (1.1.1 through 1.3.6)*
