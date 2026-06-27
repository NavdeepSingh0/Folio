MOCK_TEXT = """
Object-Oriented Programming (OOP) in C++
Object-Oriented Programming is a paradigm that organizes software design around data, or objects, rather than functions and logic. 
In C++, the main pillars and advanced concepts of OOP are:
1. Encapsulation: The bundling of data and the methods that operate on that data into a single unit.
2. Inheritance: A mechanism where a new class derives properties from an existing class.
3. Polymorphism: The ability of different objects to respond in their own way to the same function call.
4. Abstraction: Hiding the complex implementation details.
5. Classes and Objects: The basic building blocks.
6. Constructors and Destructors: Special member functions.
7. Virtual Functions: Used to achieve runtime polymorphism.
8. Interfaces: Abstract classes with purely virtual methods.
9. Operator Overloading: Giving special meaning to standard operators.
10. Multiple Inheritance: Inheriting from more than one class.
11. Friend Functions: Accessing private data of a class.
12. Templates: Generic programming features.
"""

def generate_outline(num_concepts):
    from app.models.folio import TopicOutline, ConceptOutline
    titles = [
        "Encapsulation", "Inheritance", "Polymorphism", "Abstraction",
        "Classes and Objects", "Constructors and Destructors", "Virtual Functions",
        "Interfaces", "Operator Overloading", "Multiple Inheritance",
        "Friend Functions", "Templates"
    ]
    concepts = [ConceptOutline(title=titles[i], slides=[i+1]) for i in range(min(num_concepts, len(titles)))]
    return TopicOutline(topic="OOP in C++", exam_focus="High", concepts=concepts)
