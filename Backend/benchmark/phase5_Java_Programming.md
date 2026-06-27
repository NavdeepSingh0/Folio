## Java Exception Handling (try-catch)

**Definition:** A mechanism in Java to handle runtime errors and unexpected events during program execution.

Exception handling in Java allows developers to manage errors gracefully. The try block contains code that might throw an exception, while the catch block handles the exception. The finally block, which is optional, executes after the try and catch blocks regardless of whether an exception occurred.

**Algorithm Steps:**
1. Identify the code that may throw an exception and place it in the try block.
2. Create a catch block to handle specific exceptions.
3. Optionally, add a finally block to execute cleanup code after the try and catch blocks.

```text
try { int result = 10 / 0; } catch (ArithmeticException e) { System.out.println("Cannot divide by zero"); }
```

> **Example:** try { int result = 10 / 0; } catch (ArithmeticException e) { System.out.println("Cannot divide by zero"); }

> [!NOTE]
> **Memory Trick:** Try to Catch, Finally Fix

> [!WARNING]
> **Common Mistake:** Forgetting to catch specific exceptions like ArithmeticException before catching a generic Exception.

> [!TIP]
> **Exam Focus:** Always remember that the finally block executes regardless of whether an exception was caught or not.

**Key Takeaways:**
- Use try-catch blocks to handle exceptions in Java.
- Always include a finally block for resource cleanup.
- Catch specific exceptions before generic ones to avoid masking errors.

