# ☕ Object-Oriented Programming using Java – Study Notes
> Subject: OOP using Java (23CSH-207 / 24CSH-207) | CSE 4th Semester  
> Unit 1 & Unit 2 – Java Exceptions, I/O Streams & Multithreading  
> Topic-wise structure | Theory + Code examples

---

## Table of Contents

### Chapter 0 – Java Exceptions (Unit 1)
1. [Java Exceptions – Introduction & Hierarchy](#1-java-exceptions--introduction--hierarchy)
2. [Exception Handling – try, catch, finally, throw, throws](#2-exception-handling--try-catch-finally-throw-throws)

### Chapter 1 – Java I/O & Streams
3. [Java I/O & Streams – Introduction](#3-java-io--streams--introduction)
4. [Byte Streams – FileOutputStream & FileInputStream](#4-byte-streams--fileoutputstream--fileinputstream)
5. [Byte Array Streams – ByteArrayOutputStream & ByteArrayInputStream](#5-byte-array-streams--bytearrayoutputstream--bytearrayinputstream)
6. [Character Streams – Writer & Reader, FileWriter & FileReader](#6-character-streams--writer--reader-filewriter--filereader)
7. [Character Array Streams – CharArrayReader & CharArrayWriter](#7-character-array-streams--charrayreader--chararraywriter)
8. [Filter Streams – FilterWriter & FilterReader](#8-filter-streams--filterwriter--filterreader)
9. [Piped I/O – PipedWriter & PipedReader](#9-piped-io--pipedwriter--pipedreader)
10. [Object Serialization & Deserialization](#10-object-serialization--deserialization)

### Chapter 2 – Multithreading
11. [Multithreading – Introduction & Thread Life Cycle](#11-multithreading--introduction--thread-life-cycle)
12. [Creating Threads – Thread Class & Runnable Interface](#12-creating-threads--thread-class--runnable-interface)
13. [Thread Synchronization](#13-thread-synchronization)

### Exam Prep
14. [Quick Reference – Methods, Classes & Key Points](#14-quick-reference--methods-classes--key-points)

---

---

# CHAPTER 0 – JAVA EXCEPTIONS (UNIT 1)

---

# 1. Java Exceptions – Introduction & Hierarchy

## 📖 What is an Exception?

An **exception** (or exceptional event) is a **problem that arises during the execution of a program**. When an exception occurs, the normal flow of the program is disrupted and the program terminates abnormally — which is not recommended. Therefore, exceptions must be handled.

---

## 📖 Common Causes of Exceptions

- A user has entered **invalid data**
- A file that needs to be opened **cannot be found**
- A **network connection** has been lost during communication
- The **JVM has run out of memory**

Some exceptions are caused by user error, others by programmer error, and others by physical resource failures.

---

## 📖 Error vs Exception

| | Error | Exception |
|--|-------|-----------|
| **Definition** | Indicates a **serious problem** that a reasonable application should NOT try to catch | Indicates a condition that a reasonable application **might try to catch** |
| **Examples** | `StackOverflowError`, `OutOfMemoryError` | `NullPointerException`, `FileNotFoundException` |
| **Handled by** | Usually not handled | Must/should be handled |

---

## 📖 Exception Hierarchy

All exception and error types are **subclasses of `Throwable`**, which is the base class of the hierarchy.

```
java.lang.Object
    └── java.lang.Throwable
            ├── java.lang.Error              ← NOT expected to be caught
            │       └── StackOverflowError, OutOfMemoryError, etc.
            └── java.lang.Exception          ← User programs should catch
                    ├── IOException
                    ├── SQLException
                    ├── FileNotFoundException
                    └── RuntimeException     ← Automatically defined; unchecked
                            ├── NullPointerException
                            ├── ArithmeticException
                            ├── ArrayIndexOutOfBoundsException
                            └── ClassCastException
```

**Two main branches:**
- **`Exception`** — used for exceptional conditions that user programs should catch; `NullPointerException` is an example
- **`Error`** — defines exceptions NOT expected to be caught under normal circumstances; used by the JVM to indicate errors in the runtime environment (`StackOverflowError`)
- **`RuntimeException`** — important subclass of `Exception`; automatically defined for programs; includes division by zero and invalid array indexing

---

## 📖 Three Types of Exceptions

### 1. Checked Exceptions
- Occur at **compile time** (also called compile-time exceptions)
- **Cannot be ignored** at compilation — programmer must handle them
- Subject to the **"catch or specify"** requirement: code that uses a checked exception **will not compile** if not caught or declared
- All Java exceptions are checked **except** those of `Error` and `RuntimeException` classes

> **Example:** Using `FileReader` — if the file doesn't exist, `FileNotFoundException` occurs. The compiler forces you to handle it. Methods `read()` and `close()` of `FileReader` throw `IOException` — compiler notifies to handle both.

### 2. Unchecked Exceptions (Runtime Exceptions)
- Occur at **execution time** (also called runtime exceptions)
- Include **programming bugs**: logic errors, improper API use
- **Ignored at compile time** — compiler doesn't force handling

> **Example:** Accessing the 6th element of an array of size 5 → `ArrayIndexOutOfBoundsException`

### 3. Errors
- **Not exceptions** — problems beyond control of user or programmer
- Typically **ignored** in code because you can rarely do anything about them
- Also ignored at compile time

> **Example:** Stack overflow → `StackOverflowError`

---

## 📖 How JVM Handles an Exception (Default Exception Handling)

When an exception occurs inside a method:

1. The method creates an **Exception Object** and hands it to the JVM
   - Exception Object contains: name, description, and current program state
   - This is called **throwing an Exception**

2. JVM searches the **Call Stack** (ordered list of method calls) for an **Exception Handler** (a block of code that can handle that exception)

3. JVM starts from the method where exception occurred and works **backwards** through the call stack

4. If an **appropriate handler** is found (type matches) → exception is passed to it and handled

5. If **no handler is found** in the entire call stack → JVM hands it to the **default exception handler**, which:
   - Prints the exception information
   - **Terminates the program abnormally**

---

## 📖 Why Exception Handling?

Without handling, if an exception occurs at statement 5 in a 10-statement program, statements 6–10 will **never execute**. With exception handling, the rest of the code can still run after the exception is dealt with.

---

## 📝 Quiz Answers

**Q1.** Which keyword is used to manually throw an exception?
> **C) throw**

**Q2.** `Exception` and `Error` are direct subclasses of?
> **B) Throwable**

---

---

# 2. Exception Handling – try, catch, finally, throw, throws

## 📖 Five Keywords for Exception Handling

Java exception handling is managed via **five keywords**:

| Keyword | Role |
|---------|------|
| `try` | Contains statements that may raise exceptions |
| `catch` | Handles the exception thrown by the try block |
| `throw` | Manually throws an exception |
| `throws` | Declares that a method may throw certain exceptions |
| `finally` | Code that always executes, whether exception occurred or not |

---

## 📖 try Block

- Contains the set of statements where an exception **can occur**
- Always followed by a `catch` block or `finally` block (or both)

```java
try {
    // statements that may cause an exception
}
```

---

## 📖 catch Block

- Handles exceptions that occur in the associated `try` block
- Must **follow** the `try` block immediately
- A single `try` block can have **several catch blocks** — for different exception types

```java
try {
    // risky code
} catch (ArithmeticException e) {
    // handles only ArithmeticException
} catch (NullPointerException e) {
    // handles only NullPointerException
} catch (Exception e) {
    // generic — handles ALL exceptions (place this LAST)
}
```

**Rules for multiple catch blocks:**
- A single try block can have **any number** of catch blocks
- `catch(Exception e)` is a **generic handler** — catches everything, but place it **last**
- If no exception occurs in try block → catch blocks are **completely ignored**
- When exception occurs → control jumps to the **matching** catch block
- Generic handler should be at the **end** — placing it first shows only generic messages; users need meaningful, specific messages

---

## 📖 finally Block

- Code in `finally` **always executes** — whether or not an exception occurred
- Used for **clean-up code** (closing files, releasing resources, etc.)
- Appears at the **end of catch blocks**

```java
try {
    // risky code
} catch (Exception e) {
    // exception handling
} finally {
    // ALWAYS executes — use for cleanup
    // e.g., close file, release DB connection
}
```

---

## 📖 Complete try-catch-finally Example

```java
public class ExceptionDemo {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;           // throws ArithmeticException
            System.out.println(result);    // never executes
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());  // "/ by zero"
        } finally {
            System.out.println("Finally block always runs");
        }
        System.out.println("Program continues normally...");
    }
}
```
```
Output:
Caught: / by zero
Finally block always runs
Program continues normally...
```

---

## 📖 throws Keyword

- Used for handling **checked exceptions**
- Informs the programmer (caller) that a method **may throw** certain exceptions
- Any method capable of causing exceptions must **list all possible exceptions** using `throws`

```java
returnType methodName() throws ExceptionType1, ExceptionType2 {
    // method code
}
```

```java
// Example:
public void readFile(String path) throws FileNotFoundException, IOException {
    FileReader fr = new FileReader(path);
    // ...
}
```

---

## 📖 throw Keyword

- Used to **explicitly throw** an exception (manually)
- Can also throw **custom/user-defined exceptions**
- Program execution **stops** at the `throw` statement; nearest matching `catch` is checked

```java
throw ThrowableInstance;

// Example:
throw new ArithmeticException("Age cannot be negative");
```

**Rules:**
- Only objects of `Throwable` class or its subclasses can be thrown
- Execution stops at `throw`; the closest matching catch block handles it

---

## 📖 throw vs throws — Key Differences

| | `throw` | `throws` |
|--|---------|---------|
| **Purpose** | Used to **actually throw** an exception | Used to **declare** that a method may throw exceptions |
| **Usage** | Inside the method body | In the method signature |
| **Followed by** | An instance (object) | Exception class name(s) |
| **Number** | Can throw only **one** exception at a time | Can declare **multiple** exceptions |
| **Example** | `throw new IOException("error")` | `void method() throws IOException, SQLException` |

---

## 📖 final vs finally vs finalize

| | `final` | `finally` | `finalize` |
|--|---------|-----------|------------|
| **Type** | Keyword | Block | Method |
| **Purpose** | Restricts class (can't inherit), method (can't override), variable (can't change value) | Contains important code; always executes whether exception handled or not | Performs clean-up just before object is **garbage collected** |

---

## 📖 User-Defined (Custom) Exceptions

You can create your own exception class in Java:

```java
// Custom exception class
class MyException extends Exception {
    public String toString() {
        return "Age must be 18 or older";   // meaningful message
    }
}
```

**Rules:**
- User-defined exception class must **extend `Exception`** class (or its subclass)
- Exception is thrown using the `throw` keyword
- Override `toString()` to provide meaningful information about the exception

### Example

```java
class MyExceptionDemo {
    static int flag = 0;

    public static void main(String args[]) {
        try {
            int age = Integer.parseInt(args[0]);
            if (age < 18)
                throw new MyException();     // throw custom exception
        } catch (ArrayIndexOutOfBoundsException e) {
            flag = 1;
            System.out.println("Exception: " + e);
        } catch (NumberFormatException e) {
            flag = 1;
            System.out.println("Exception: " + e);
        } catch (MyException e) {
            flag = 1;
            System.out.println("Exception: " + e);
        }
        if (flag == 0)
            System.out.println("Everything is fine");
    }
}
```

---

## 📖 Advantages of Exception Handling

| Advantage | Description |
|-----------|-------------|
| **Maintain normal flow** | Exception handling allows program to continue executing after an exception |
| **Separate error-handling from regular code** | Exceptions separate what to do when something goes wrong from the main program logic |
| **Propagate errors up call stack** | Errors can be reported up through nested method calls to where they can best be handled |

---

## 📝 Quiz Answers

**Q1.** What will happen with infinite recursion (calling a method from within itself without stopping)?
> **D) StackOverflowError** — it's an `Error`, not an `Exception` or compile-time error

**Q2.** Which keyword manually throws an exception?
> **C) throw**

---

---

# CHAPTER 1 – JAVA I/O & STREAMS

---

# 3. Java I/O & Streams – Introduction

## 📖 What is a Stream?

In Java, a **stream** is a group of objects that provides different methods which can be piped together to get the desired outcome. Java performs all I/O through streams.

- A stream is an **abstraction** that either produces or consumes information
- A stream is **linked to a physical device** by the Java I/O system
- The same I/O classes and methods can be applied to **different types of devices** since all streams behave in the same manner

> All stream classes are defined in the **`java.io`** package.

---

## 📖 Two Types of Streams in Java

| Type | Purpose | Encoding |
|------|---------|---------|
| **Byte Streams** | Handle input/output of **bytes**; used for reading/writing **binary data** | Raw bytes |
| **Character Streams** | Handle input/output of **characters**; use **Unicode** → can be internationalized | Unicode |

---

## 📖 Predefined Streams

The `System` class (in `java.lang`) contains three predefined stream variables:

| Stream | Type | Default Device |
|--------|------|---------------|
| `System.in` | InputStream (standard input) | Keyboard |
| `System.out` | PrintStream (standard output) | Console |
| `System.err` | PrintStream (standard error) | Console |

---

## 📖 InputStream vs OutputStream (Abstract Base Classes)

### OutputStream
- **Abstract class** in `java.io`
- Superclass of all classes representing an **output stream of bytes**
- Accepts output bytes and sends them to some **sink** (file, array, socket)
- Key method: `write()` — writes byte-by-byte or in chunks

### InputStream
- **Abstract class** in `java.io`
- Superclass of all classes representing an **input stream of bytes**
- Key method: `read()` — reads byte-by-byte or in chunks

### Key Methods of OutputStream

| Method | Description |
|--------|-------------|
| `write(int b)` | Writes the specified byte to the output stream |
| `write(byte[] b)` | Writes all bytes in the array to the output stream |
| `write(byte[] b, int off, int len)` | Writes `len` bytes from array starting at offset `off` |
| `flush()` | Flushes the output stream and forces any buffered bytes to be written |
| `close()` | Closes the stream and releases system resources |

### Key Methods of InputStream

| Method | Description |
|--------|-------------|
| `read()` | Reads the next byte; returns -1 if end of stream |
| `read(byte[] b)` | Reads up to `b.length` bytes into the array |
| `read(byte[] b, int off, int len)` | Reads up to `len` bytes into array starting at offset `off` |
| `available()` | Returns number of bytes available to read without blocking |
| `close()` | Closes the stream and releases system resources |
| `skip(long n)` | Skips over and discards `n` bytes |
| `mark(int readlimit)` | Marks the current position in the stream |
| `reset()` | Resets the stream to the last mark |

---

## 📝 Quiz Answers

**Q1.** Java input/output classes are available in which package?
> **b) java.io**

**Q2.** What are the inbuilt streams available in `java.io` package?
> **d) All of the above** (System.in, System.out, System.err)

**Q3.** FileInputStream → Byte stream for reading from file; FileOutputStream → Byte stream for writing to a file.

---

---

# 4. Byte Streams – FileOutputStream & FileInputStream

## 📖 FileOutputStream

**`FileOutputStream`** is an output stream used for **writing data to a file**.
- Used to write primitive values into a file
- Writes **byte-oriented data**

```java
public class FileOutputStream extends OutputStream
```

**Constructors:**
```java
FileOutputStream(String filePath)
FileOutputStream(String filePath, boolean append)  // append=true → adds to existing file
FileOutputStream(File fileObj)
```

### Key Methods of FileOutputStream

| Method | Description |
|--------|-------------|
| `write(int b)` | Writes the specified byte to the file output stream |
| `write(byte[] b)` | Writes all bytes from the array to the output stream |
| `write(byte[] b, int off, int len)` | Writes `len` bytes from array starting at `off` |
| `flush()` | Flushes the output stream |
| `close()` | Closes the stream |
| `getChannel()` | Returns the `FileChannel` associated with this stream |
| `getFD()` | Returns the `FileDescriptor` associated with this stream |

### Example – Write a Byte to File

```java
import java.io.FileOutputStream;

public class FileOutputStreamExample {
    public static void main(String args[]) {
        try {
            FileOutputStream fout = new FileOutputStream("D:\\testout.txt");
            fout.write(65);   // writes byte value 65 = 'A'
            fout.close();
            System.out.println("success...");
        } catch(Exception e) {
            System.out.println(e);
        }
    }
}
```
```
Output: success...
testout.txt contains: A
```

---

## 📖 FileInputStream

**`FileInputStream`** creates an `InputStream` you can use to **read bytes from a file**.

```java
FileInputStream(String filepath)   // throws FileNotFoundException
FileInputStream(File fileObj)
```

- `FileNotFoundException` is thrown if file does not exist (subclass of `IOException`)
- Overrides **six** methods of the abstract class `InputStream`
- `mark()` and `reset()` are **not overridden** — any attempt to use `reset()` generates an `IOException`

### Key Methods of FileInputStream

| Method | Description |
|--------|-------------|
| `int available()` | Returns bytes that can be read without blocking |
| `void close()` | Closes the stream and releases system resources |
| `FileDescriptor getFD()` | Returns the FileDescriptor object |
| `int read()` | Reads a single byte of data |
| `int read(byte[] b)` | Reads up to `b.length` bytes into array |
| `int read(byte[] b, int n, int m)` | Reads up to `m` bytes from nth byte into array |
| `long skip(long n)` | Skips over and discards `n` bytes |

### Example 1 – Read a Single Character

```java
import java.io.FileInputStream;

public class DataStreamExample {
    public static void main(String args[]) {
        try {
            FileInputStream fin = new FileInputStream("D:\\testout.txt");
            int i = fin.read();
            System.out.print((char)i);   // cast byte to char
            fin.close();
        } catch(Exception e) {
            System.out.println(e);
        }
    }
}
```
```
Output: W    (first character of "Welcome to javatpoint.")
```

### Example 2 – Read All Characters

```java
import java.io.FileInputStream;

public class DataStreamExample {
    public static void main(String args[]) {
        try {
            FileInputStream fin = new FileInputStream("D:\\testout.txt");
            int i = 0;
            while((i = fin.read()) != -1) {    // -1 means end of stream
                System.out.print((char)i);
            }
            fin.close();
        } catch(Exception e) {
            System.out.println(e);
        }
    }
}
```
```
Output: Welcome to javaTpoint
```

---

## 📝 Quiz Answers

**Q1.** Which class contains methods used to write in a file?
> **FileOutputStream** (FileInputStream is for reading)

**Q2.** Which exception is thrown when file specified for writing is not found?
> **c) FileNotFoundException**

**Q3.** Which exception is thrown by `read()` method of InputStream?
> **B) IOException**

---

---

# 5. Byte Array Streams – ByteArrayOutputStream & ByteArrayInputStream

## 📖 ByteArrayOutputStream

`ByteArrayOutputStream` is an implementation of an output stream that uses a **byte array as the destination**.

```java
ByteArrayOutputStream()              // creates buffer of 32 bytes
ByteArrayOutputStream(int numBytes)  // creates buffer of specified size
```

### Key Methods

| Method | Description |
|--------|-------------|
| `write(int b)` | Writes specified byte to the buffer |
| `write(byte[] b, int off, int len)` | Writes `len` bytes from array starting at `off` |
| `byte[] toByteArray()` | Returns a copy of the byte array in the buffer |
| `String toString()` | Converts buffer's content to a String |
| `void writeTo(OutputStream out)` | Writes the entire content to another output stream |
| `void reset()` | Resets the buffer so it can be reused |
| `int size()` | Returns the current size of the buffer |

### Example

```java
import java.io.*;

class ByteArrayOutputStreamDemo {
    public static void main(String args[]) throws IOException {
        ByteArrayOutputStream f = new ByteArrayOutputStream();

        String s = "This should end up in the array";
        byte buf[] = s.getBytes();
        f.write(buf);

        System.out.println("Buffer as a string");
        System.out.println(f.toString());         // convert to String

        System.out.println("Into array");
        byte b[] = f.toByteArray();               // retrieve as byte array
        for (int i = 0; i < b.length; i++) {
            System.out.print((char) b[i]);
        }

        System.out.println("\nTo an OutputStream()");
        OutputStream f2 = new FileOutputStream("test.txt");
        f.writeTo(f2);                            // write buffer to file
        f2.close();

        System.out.println("Doing a reset");
        f.reset();                                // reset the buffer
        for (int i = 0; i < 3; i++)
            f.write('X');
        System.out.println(f.toString());         // "XXX"

        OutputStream f3 = new FileOutputStream("test1.txt");
        f.writeTo(f3);
        f3.close();
    }
}
```

---

## 📖 ByteArrayInputStream

`ByteArrayInputStream` is an implementation of an input stream that uses a **byte array as the source**.

```java
ByteArrayInputStream(byte array[])                     // reads entire array
ByteArrayInputStream(byte array[], int start, int numBytes) // reads portion
```

- Contains an internal buffer used to read byte array as stream
- Buffer **automatically grows** according to data

### Key Methods

| Method | Description |
|--------|-------------|
| `int read()` | Reads next byte; returns -1 at end |
| `int read(byte[] b, int off, int len)` | Reads `len` bytes into array starting at `off` |
| `long skip(long n)` | Skips `n` bytes |
| `int available()` | Returns number of remaining bytes |
| `boolean markSupported()` | Returns true (mark/reset always supported) |
| `void mark(int readlimit)` | Marks current position |
| `void reset()` | Resets stream to last marked position |

### Example

```java
import java.io.*;

class ByteArrayInputStreamDemo {
    public static void main(String args[]) throws IOException {
        String tmp = "abcdefghijklmnopqrstuvwxyz";
        byte b[] = tmp.getBytes();

        ByteArrayInputStream input1 = new ByteArrayInputStream(b);        // whole array
        ByteArrayInputStream input2 = new ByteArrayInputStream(b, 0, 13); // first 13 chars

        int c;
        while ((c = input1.read()) != -1) {
            System.out.print((char) c);   // prints: abcdefghijklmnopqrstuvwxyz
        }
        System.out.println("");
        System.out.println("Second");
        while ((c = input2.read()) != -1) {
            System.out.print((char) c);   // prints: abcdefghijklm (first 13)
        }
    }
}
```

---

## 📝 Quiz Answers

**Q1.** What is the return type of the `available()` method?
> **int**

**Q2.** Which exception is thrown by `read()` of InputStream?
> **B) IOException**

---

---

# 6. Character Streams – Writer & Reader, FileWriter & FileReader

## 📖 Why Character Streams?

Character streams handle input/output of **characters** using **Unicode** — making them more efficient than byte streams for text data and supporting internationalization.

Two abstract base classes:
- **`Writer`** — abstract class defining streaming character **output**
- **`Reader`** — abstract class defining streaming character **input**

---

## 📖 Writer (Abstract Class)

```java
// implements Closeable, Flushable, Appendable
protected Writer()
```

### Key Methods of Writer

| Method | Description |
|--------|-------------|
| `void write(int c)` | Writes a single character |
| `void write(char[] cbuf)` | Writes an array of characters |
| `void write(char[] cbuf, int off, int len)` | Writes a portion of a character array |
| `void write(String str)` | Writes a String |
| `void write(String str, int off, int len)` | Writes a portion of a String |
| `void flush()` | Flushes the stream |
| `void close()` | Flushes and closes the stream |
| `Writer append(CharSequence csq)` | Appends the specified character sequence |

---

## 📖 Reader (Abstract Class)

```java
// implements Closeable and Readable
protected Reader()
```

### Key Methods of Reader

| Method | Description |
|--------|-------------|
| `int read()` | Reads a single character; returns -1 at end |
| `int read(char[] cbuf)` | Reads characters into an array |
| `int read(char[] cbuf, int off, int len)` | Reads `len` chars into array at offset `off` |
| `long skip(long n)` | Skips `n` characters |
| `boolean ready()` | Tells whether stream is ready to be read |
| `boolean markSupported()` | Tells whether mark/reset is supported |
| `void mark(int readAheadLimit)` | Marks the current position |
| `void reset()` | Resets the stream |
| `void close()` | Closes the stream |

---

## 📖 FileWriter

`FileWriter` creates a `Writer` to **write to a file**.

```java
FileWriter(String filePath)
FileWriter(String filePath, boolean append)  // append=true → adds to existing content
FileWriter(File fileObj)
FileWriter(File fileObj, boolean append)
// All throw IOException
```

### Key Methods

| Method | Description |
|--------|-------------|
| `write(int c)` | Writes a single character |
| `write(char[] cbuf, int off, int len)` | Writes portion of character array |
| `write(String str, int off, int len)` | Writes portion of a string |
| `flush()` | Flushes the stream |
| `close()` | Closes the stream |

### Example

```java
import java.io.*;

class FileWriterDemo {
    public static void main(String args[]) throws IOException {
        String source = "Now is the time for all good men\n"
                + " to come to the aid of their country\n"
                + " and pay their due taxes.";

        char buffer[] = new char[source.length()];
        source.getChars(0, source.length(), buffer, 0);

        // Append mode — writes every other character
        FileWriter f0 = new FileWriter("file11.txt", true);
        for (int i = 0; i < buffer.length; i += 2) {
            f0.write(buffer[i]);
        }
        f0.close();

        // Overwrite — writes entire buffer
        FileWriter f1 = new FileWriter("file22.txt");
        f1.write(buffer);
        f1.close();

        // Append mode — writes last 1/4 of buffer
        FileWriter f2 = new FileWriter("file33.txt", true);
        f2.write(buffer, buffer.length - buffer.length/4, buffer.length/4);
        f2.close();
    }
}
```

---

## 📖 FileReader

`FileReader` creates a `Reader` to **read the contents of a file**.

```java
FileReader(String filePath)  // throws FileNotFoundException
FileReader(File fileObj)
```

### Key Methods

| Method | Description |
|--------|-------------|
| `int read()` | Reads a single character |
| `int read(char[] cbuf, int off, int len)` | Reads characters into array |
| `boolean ready()` | Tells if stream is ready to be read |
| `long skip(long n)` | Skips `n` characters |
| `void close()` | Closes the stream |

### Example

```java
import java.io.*;

class FileReaderDemo {
    public static void main(String args[]) throws IOException {
        FileReader fr = new FileReader("file112.txt");
        BufferedReader br = new BufferedReader(fr);
        String s;
        // Read and print all lines
        while ((s = br.readLine()) != null) {
            System.out.println(s);
        }
        fr.close();
        br.close();
    }
}
```

---

## 📝 Quiz Answers

**Q1.** Which Exception is thrown by `FileReader` constructor?
> **a) FileNotFoundException**

**Q2.** Which class is used to read characters from a file?
> **a) FileReader**

---

---

# 7. Character Array Streams – CharArrayReader & CharArrayWriter

## 📖 CharArrayReader

`CharArrayReader` is an implementation of an input stream that uses a **character array as the source**.

```java
CharArrayReader(char array[])                        // reads entire array
CharArrayReader(char array[], int start, int numChars) // reads from start, numChars length
```

- Class is `java.io.CharArrayReader`
- Reads contents of a `char[]` as a character stream

### Key Methods of CharArrayReader

| Method | Description |
|--------|-------------|
| `int read()` | Reads a single character; returns -1 at end |
| `int read(char[] cbuf, int off, int len)` | Reads `len` characters into array at `off` |
| `boolean ready()` | Tells if stream is ready to be read |
| `long skip(long n)` | Skips `n` characters |
| `boolean markSupported()` | Returns true |
| `void mark(int readAheadLimit)` | Marks current position |
| `void reset()` | Resets stream to last mark |
| `void close()` | Closes the stream |

### Example

```java
import java.io.*;

public class CharArrayReaderDemo {
    public static void main(String args[]) throws IOException {
        String tmp = "abcdefghijklmnopqrstuvwxyz";
        int length = tmp.length();
        char c[] = new char[length];
        tmp.getChars(0, length, c, 0);

        CharArrayReader input1 = new CharArrayReader(c);         // full alphabet
        CharArrayReader input2 = new CharArrayReader(c, 0, 5);   // only first 5: "abcde"

        int i;
        System.out.println("input1 is:");
        while ((i = input1.read()) != -1) {
            System.out.print((char)i);   // abcdefghijklmnopqrstuvwxyz
        }
        System.out.println();
        System.out.println("input2 is:");
        while ((i = input2.read()) != -1) {
            System.out.print((char)i);   // abcde
        }
    }
}
```

---

## 📖 CharArrayWriter

`CharArrayWriter` is an implementation of an output stream that uses a **character array as the destination**.

```java
CharArrayWriter()               // default initial size
CharArrayWriter(int numChars)   // specified initial size
```

- Characters written are assigned to elements of the character array it manages
- **Auto-grows**: if characters written exceed array length, creates a new larger array and copies old data

### Key Methods of CharArrayWriter

| Method | Description |
|--------|-------------|
| `write(int c)` | Writes a single character |
| `write(char[] cbuf, int off, int len)` | Writes portion of character array |
| `write(String str, int off, int len)` | Writes portion of string |
| `char[] toCharArray()` | Returns a copy of the character array |
| `String toString()` | Converts contents to String |
| `void writeTo(Writer out)` | Writes contents to another Writer |
| `void reset()` | Resets the buffer |
| `int size()` | Returns current size of the buffer |

### Example

```java
import java.io.*;

class CharArrayWriterDemo {
    public static void main(String args[]) throws IOException {
        CharArrayWriter f = new CharArrayWriter();
        String s = "This should end up in the array";
        char buf[] = new char[s.length()];
        s.getChars(0, s.length(), buf, 0);
        f.write(buf);

        System.out.println("Buffer as a string");
        System.out.println(f.toString());

        System.out.println("Into array");
        char c[] = f.toCharArray();
        for (int i = 0; i < c.length; i++) {
            System.out.print(c[i]);
        }

        System.out.println("\nTo a FileWriter()");
        FileWriter f2 = new FileWriter("test.txt");
        f.writeTo(f2);
        f2.close();

        System.out.println("Doing a reset");
        f.reset();
        for (int i = 0; i < 3; i++)
            f.write('X');
        System.out.println(f.toString());   // "XXX"
    }
}
```

---

---

# 8. Filter Streams – FilterWriter & FilterReader

## 📖 FilterWriter

`FilterWriter` is an **abstract class** used to write **filtered character streams**. It filters or processes characters written to it, then writes results to the `Writer` it manages.

```java
protected FilterWriter(Writer out)  // creates FilterWriter with specified underlying Writer
```

- Subclasses must override some methods and may provide additional methods/fields
- Cannot be instantiated directly — must be subclassed (or use anonymous class)

### Key Methods of FilterWriter

| Method | Description |
|--------|-------------|
| `write(int c)` | Writes a single character |
| `write(char[] cbuf, int off, int len)` | Writes portion of character array |
| `write(String str, int off, int len)` | Writes portion of String |
| `flush()` | Flushes the stream |
| `close()` | Closes the stream |

### Example

```java
class FilterWriterDemo {
    public static void main(String[] args) throws Exception {
        FilterWriter fr = null;
        Writer wr = null;
        wr = new StringWriter();
        fr = new FilterWriter(wr) {};   // anonymous subclass

        String str = "Bhavneet";
        char c[] = {'B', 'h', 'a', 'v'};

        fr.write(str);         // write full String
        fr.flush();
        fr.write(c);           // write char array
        fr.write('s');         // write single char

        System.out.print(wr.toString());   // Output: BhavneetBhavs
        fr.close();
    }
}
```

---

## 📖 FilterReader

`FilterReader` is an **abstract class** for reading **filtered character streams**. It selectively processes data obtained from the `Reader` it manages.

```java
public abstract class FilterReader extends Reader
protected FilterReader(Reader in)   // creates new filtered reader
```

- Provides default methods that pass all requests to the contained stream
- Subclasses should override some methods and may provide additional ones

### Key Methods of FilterReader

| Method | Description |
|--------|-------------|
| `int read()` | Reads a single character |
| `int read(char[] cbuf, int off, int len)` | Reads characters into array |
| `long skip(long n)` | Skips `n` characters |
| `boolean ready()` | Tells if stream is ready |
| `boolean markSupported()` | Tells if mark/reset is supported |
| `void mark(int readAheadLimit)` | Marks current position |
| `void reset()` | Resets stream to last mark |
| `void close()` | Closes the stream |

### Example

```java
import java.io.*;

class FilterReaderdemo {
    public static void main(String[] args) throws IOException {
        Reader r = new StringReader("Bhavneet");
        FilterReader fr = new FilterReader(r) {};   // anonymous subclass

        char ch[] = new char[8];

        if (fr.markSupported()) {
            System.out.println("mark method is supported");
            fr.mark(100);
        }

        fr.skip(5);    // skip first 5 characters

        if (fr.ready()) {
            fr.read(ch);
            for (int i = 0; i < 8; i++) {
                System.out.print(ch[i]);    // prints last 3 chars: eet (+ padding)
            }

            fr.reset();   // go back to marked position
            for (int i = 0; i < 5; i++) {
                System.out.print((char)fr.read());   // prints: Bhavn
            }
        }
        fr.close();
    }
}
```

---

## 📝 Quiz Answer

**Q1.** What class is extended by `DataOutputStream`?
> **a) FilterOutputStream**

---

---

# 9. Piped I/O – PipedWriter & PipedReader

## 📖 What is Java Piped I/O?

**Pipes** are used as a **communication channel between threads** to transfer data in a **producer-consumer** scenario.

- Provide **unidirectional flow** of data: one thread writes, another reads
- Useful for **thread-based communication**

### Four Classes for Piped I/O

| Class | Type | Purpose |
|-------|------|---------|
| `PipedInputStream` | Byte-based | Read bytes from pipe |
| `PipedOutputStream` | Byte-based | Write bytes to pipe |
| `PipedReader` | Character-based | Read characters from pipe |
| `PipedWriter` | Character-based | Write characters to pipe |

---

## 📖 PipedWriter

`PipedWriter` is used to **write to a pipe as a stream of characters**. Generally connected to a `PipedReader` and used by **different threads**.

### Constructors

```java
PipedWriter()                    // creates unconnected writer
PipedWriter(PipedReader sink)    // creates writer connected to given PipedReader
```

### Key Methods

| Method | Description |
|--------|-------------|
| `void connect(PipedReader sink)` | Connects this writer to a PipedReader |
| `void write(int c)` | Writes a single character to the pipe |
| `void write(char[] cbuf, int off, int len)` | Writes portion of char array |
| `void flush()` | Flushes the stream |
| `void close()` | Closes the stream |

---

## 📖 PipedReader

`PipedReader` is used to **read from a pipe as a stream of characters**. Must be connected to the **same `PipedWriter`** and used by **different threads**.

### Constructors

```java
PipedReader()                     // creates unconnected reader
PipedReader(PipedWriter src)      // creates reader connected to given PipedWriter
PipedReader(int pipeSize)         // creates unconnected reader with given buffer size
PipedReader(PipedWriter src, int pipeSize)
```

### Key Methods

| Method | Description |
|--------|-------------|
| `void connect(PipedWriter src)` | Connects this reader to a PipedWriter |
| `int read()` | Reads a single character |
| `int read(char[] cbuf, int off, int len)` | Reads characters into array |
| `boolean ready()` | Tells if stream is ready to be read |
| `void close()` | Closes the stream |

---

## 📖 Example – PipedReader & PipedWriter with Threads

```java
import java.io.PipedReader;
import java.io.PipedWriter;

public class PipeReaderExample2 {
    public static void main(String[] args) {
        try {
            final PipedReader read = new PipedReader();
            final PipedWriter write = new PipedWriter(read);  // connect writer to reader

            // Reader thread — consumer
            Thread readerThread = new Thread(new Runnable() {
                public void run() {
                    try {
                        int data = read.read();
                        while (data != -1) {
                            System.out.print((char) data);
                            data = read.read();
                        }
                    } catch (Exception ex) {}
                }
            });

            // Writer thread — producer
            Thread writerThread = new Thread(new Runnable() {
                public void run() {
                    try {
                        write.write("My name is BHAVNEET\n".toCharArray());
                    } catch (Exception ex) {}
                }
            });

            readerThread.start();
            writerThread.start();

        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
    }
}
```
```
Output: My name is BHAVNEET
```

---

## 📝 Quiz Answers

**Q1.** `PipedWriter` is the subclass of:
> **a) Writer**

**Q2.** `write(int)` method of `PipedWriter` throws:
> **IOException**

---

---

# 10. Object Serialization & Deserialization

## 📖 What is Object Serialization?

**Object Serialization** is the process of **saving an object's state to a sequence of bytes** (on disk). **Deserialization** is the reverse — reading those bytes back and **rebuilding the object in memory**.

- The **Java Serialization API** provides a standard mechanism for this
- Can only serialize objects of a class that **implements `Serializable`** interface
- The process is **JVM-independent** — serialize on one platform, deserialize on another

---

## 📖 Key Classes

| Class | Purpose |
|-------|---------|
| `ObjectOutputStream` | Writes/serializes objects to an output stream |
| `ObjectInputStream` | Reads/deserializes objects from an input stream |
| `Serializable` | Marker interface — a class must implement this to be serializable |

---

## 📖 How to Serialize (Write to ObjectOutputStream)

```java
FileOutputStream out = new FileOutputStream("theTime");
ObjectOutputStream s = new ObjectOutputStream(out);
s.writeObject("Today");        // serialize a String
s.writeObject(new Date());     // serialize a Date object
s.flush();
```

## 📖 How to Deserialize (Read from ObjectInputStream)

```java
FileInputStream in = new FileInputStream("theTime");
ObjectInputStream s = new ObjectInputStream(in);
String today = (String) s.readObject();   // cast back to original type
Date date = (Date) s.readObject();
```

---

## 📖 Complete Example

```java
import java.io.*;

// Serializable class
public class MyClass implements Serializable {
    String s;
    int i;
    double d;

    public MyClass(String s, int i, double d) {
        this.s = s;
        this.i = i;
        this.d = d;
    }

    public String toString() {
        return "s=" + s + "; i=" + i + "; d=" + d;
    }
}

// Main class
public class SerializationDemo {
    public static void main(String args[]) {

        // SERIALIZATION
        try {
            MyClass object1 = new MyClass("Hello", -7, 2.7e10);
            System.out.println("object1: " + object1);

            FileOutputStream fos = new FileOutputStream("serial");
            ObjectOutputStream oos = new ObjectOutputStream(fos);
            oos.writeObject(object1);
            oos.flush();
            oos.close();
        } catch(Exception e) {
            System.out.println("Exception during serialization: " + e);
            System.exit(0);
        }

        // DESERIALIZATION
        try {
            MyClass object2;
            FileInputStream fis = new FileInputStream("serial");
            ObjectInputStream ois = new ObjectInputStream(fis);
            object2 = (MyClass) ois.readObject();   // cast to original type
            ois.close();
            System.out.println("object2: " + object2);
        } catch(Exception e) {
            System.out.println("Exception during deserialization: " + e);
            System.exit(0);
        }
    }
}
```
```
Output:
object1: s=Hello; i=-7; d=2.7E10
object2: s=Hello; i=-7; d=2.7E10
```

---

## 📖 The `transient` Keyword

- Used in object serialization
- By default, all fields are serialized **except `static` variables**
- If you **do not want** a particular non-static field to be serialized, declare it as `transient`
- `transient` is used **only with variable declarations**

```java
class Employee implements Serializable {
    String name;
    int salary;
    transient String password;   // will NOT be serialized
}
```

---

## 📝 Quiz Answers

**Q1.** Which is the process of writing the state of an object to a byte stream?
> **a) Serialization**

**Q2.** Which is an interface for control over serialization and deserialization?
> **b) Externalization** (but `Serializable` is the basic marker interface; `Externalizable` provides custom control)

---

---

# CHAPTER 2 – MULTITHREADING

---

# 11. Multithreading – Introduction & Thread Life Cycle

## 📖 What is Multithreading?

Java's multithreading functionality enables **two or more application components to run concurrently** for optimal CPU utilization. Each component is called a **thread**. Threads are **lightweight processes inside other processes**.

---

## 📖 Multitasking vs Multithreading

| | Multitasking | Multithreading |
|--|-------------|----------------|
| **Unit** | Process (program) | Thread (part of program) |
| **Memory** | Each process has separate memory | Threads share memory of the process |
| **Switching** | Process context switching | Thread context switching |
| **Cost** | More expensive | Less expensive (lightweight) |
| **Communication** | More complex | Easier (shared memory) |

**Definition:** Multithreading = two or more parts of the **same process** running simultaneously.

---

## 📖 Thread Life Cycle (5 States)

```
          start()
New ──────────────▶ Runnable ◀──────────── Waiting
                      │                        │
                      │ (executes)              │ (signal)
                      ▼                        │
                   Running ───────────────────▶ |
                      │  \                      
                      │   \──────────────────▶ Timed Waiting
                      │                        (time expires)
                      ▼
                  Terminated
```

| State | Description |
|-------|-------------|
| **New** | Thread is created but not yet started; also called "born thread" |
| **Runnable** | After `start()` is called; thread is executing its task |
| **Waiting** | Thread waits for another thread to perform a task; transitions back when signaled |
| **Timed Waiting** | Thread waits for a specified interval (e.g., `sleep(millis)`); transitions back when time expires or event occurs |
| **Terminated (Dead)** | Thread completes its task or is otherwise terminated |

---

## 📖 Advantages of Multithreading

- **Improved performance and concurrency**
- Simplified coding of remote procedure calls and conversations
- **Simultaneous access** to multiple applications
- **Reduced number of required servers**

## 📖 Disadvantages of Multithreading

- **Difficulty of writing code** — more complex than single-threaded
- **Difficulty of debugging** — non-deterministic behavior
- **Difficulty of managing concurrency** — race conditions, deadlocks
- **Difficulty of testing** — hard to reproduce bugs
- **Difficulty of porting** existing single-threaded code

---

## 📝 Quiz Answers

**Q1.** Which defines multithreaded programming?
> **4) A process in which two or more parts of the same process run simultaneously**

**Q2.** A process can be:
> **c) Both single-threaded and multithreaded**

**Q3.** Termination of a process terminates:
> **c) All threads within the process**

---

---

# 12. Creating Threads – Thread Class & Runnable Interface

## 📖 Two Ways to Create a Thread

Java's multithreading system is built upon the **`Thread` class** and the **`Runnable` interface**. Both are in `java.lang`.

```
Method 1: Extend Thread class
Method 2: Implement Runnable interface
```

---

## 📖 Method 1: Extending Thread Class

`Thread` class:
- Extends `Object` class
- Implements `Runnable` interface
- Encapsulates a thread of execution

**Steps:**
1. Create a class that **extends `Thread`**
2. **Override the `run()` method** — contains the code the thread executes
3. Create an instance of the class
4. Call **`start()`** to begin execution (JVM calls `run()`)

### Constructors of Thread Class

```java
Thread()
Thread(String name)
Thread(Runnable r)
Thread(Runnable r, String name)
```

### Example

```java
class Multi extends Thread {
    public void run() {
        System.out.println("thread is running...");
    }
    public static void main(String args[]) {
        Multi t1 = new Multi();
        t1.start();    // starts thread; JVM calls run()
    }
}
```
```
Output: thread is running...
```

---

## 📖 Method 2: Implementing Runnable Interface

**Runnable** interface:
- Any class whose instances are meant to be executed by a thread should implement `Runnable`
- Has only **one method**: `public void run()`

**Steps:**
1. Create a class that **implements `Runnable`**
2. **Override the `run()` method**
3. Create an instance of the class
4. Create a **`Thread` object**, passing the Runnable instance
5. Call **`start()`** on the Thread object

### Example

```java
class Multi3 implements Runnable {
    public void run() {
        System.out.println("thread is running...");
    }
    public static void main(String args[]) {
        Multi3 m1 = new Multi3();
        Thread t1 = new Thread(m1);   // pass Runnable to Thread
        t1.start();
    }
}
```
```
Output: thread is running...
```

---

## 📖 What `start()` Does

When `start()` is called:
1. A **new thread starts** (with a new call stack)
2. Thread moves from **New state → Runnable state**
3. When thread gets CPU time, its **`run()` method executes**

---

## 📖 Key Methods of Thread Class

| Method | Description |
|--------|-------------|
| `void run()` | Contains the code for the thread to execute |
| `void start()` | Starts thread execution; JVM calls `run()` |
| `void sleep(long ms)` | Pauses thread for specified milliseconds |
| `void join()` | Waits for the thread to die |
| `void join(long ms)` | Waits for thread to die for specified milliseconds |
| `int getPriority()` | Returns thread priority |
| `void setPriority(int p)` | Changes thread priority |
| `String getName()` | Returns thread name |
| `void setName(String name)` | Changes thread name |
| `Thread currentThread()` | Returns reference to currently executing thread (static) |
| `int getId()` | Returns thread ID |
| `Thread.State getState()` | Returns current state of thread |
| `boolean isAlive()` | Tests if thread is alive |
| `void yield()` | Pauses current thread; allows other threads to execute |
| `boolean isDaemon()` | Tests if thread is a daemon thread |
| `void setDaemon(boolean b)` | Marks thread as daemon or user thread |
| `void interrupt()` | Interrupts the thread |
| `boolean isInterrupted()` | Tests if thread has been interrupted |
| `static boolean interrupted()` | Tests if current thread has been interrupted |
| `void suspend()` | Suspends thread *(deprecated)* |
| `void resume()` | Resumes suspended thread *(deprecated)* |
| `void stop()` | Stops thread *(deprecated)* |

---

## 📖 Example with sleep() and Thread Name

```java
class MyThread extends Thread {
    public void run() {
        try {
            for (int i = 1; i <= 5; i++) {
                System.out.println("Number: " + i);
                Thread.sleep(500);  // sleep 500ms between prints
            }
        } catch (InterruptedException e) {
            System.out.println("Thread interrupted!");
        }
    }
}

public class ThreadExample {
    public static void main(String[] args) {
        MyThread thread = new MyThread();
        thread.start();   // starts the thread
    }
}
```
```
Output:
Number: 1
Number: 2
Number: 3
Number: 4
Number: 5
(each printed 500ms apart)
```

---

## 📖 Accessing the Main Thread

```java
// Get reference to current (main) thread
static Thread currentThread()

// Example: UseMain.java
public class UseMain {
    public static void main(String[] args) throws InterruptedException {
        Thread t = Thread.currentThread();
        System.out.println("Current thread: " + t);

        t.setName("MyMainThread");
        System.out.println("After name change: " + t);

        for (int i = 5; i > 0; i--) {
            System.out.println(i);
            Thread.sleep(1000);
        }
    }
}
```

---

## 📝 Quiz Answers

**Q1.** A thread in Java can be created by:
> **C) Both of the above** (extending Thread or implementing Runnable)

**Q2.** When a class extends Thread, it should override which method to start the thread?
> **B) run()**

**Q3.** Analyze the code: `public abstract class Test implements Runnable { public void doSomething() { }; }`
> **C) The program compiles fine** — an abstract class doesn't need to implement all interface methods

---

---

# 13. Thread Synchronization

## 📖 Why Synchronization?

Threads often **share data**. Without synchronization, different threads might try to **access and change the same data at the same time**, leading to inconsistent or corrupted data.

**Key concept:** Only **one thread at a time** should access a shared resource.

**Example:** Producer thread writes data to a data structure while Consumer thread reads from it simultaneously — dangerous without synchronization.

---

## 📖 The Monitor (Lock)

- Synchronization is implemented using **monitors** (also called **semaphores**)
- **Every object** in Java is associated with a **monitor** (lock)
- A thread can **lock** or **unlock** a monitor
- Only **one thread at a time** may hold a lock on a monitor

**How locks work:**
- A thread that needs consistent access to an object's fields must **acquire the lock** before accessing them
- It **releases the lock** when done
- This is built around an internal entity called the **lock** or **monitor**

---

## 📖 Types of Thread Synchronization

```
Thread Synchronization
├── Mutual Exclusive
│   ├── Synchronized method
│   ├── Synchronized block
│   └── Static synchronization
└── Cooperation (Inter-thread communication)
```

---

## 📖 Synchronized Method

If you declare any method as **`synchronized`**, it becomes a synchronized method.

- Used to **lock an object** for any shared resource
- When a thread invokes a synchronized method → it **automatically acquires** the lock for that object
- When the thread completes → it **automatically releases** the lock

```java
synchronized returnType methodName() {
    // only one thread can execute this at a time
}
```

### Example – Without vs With Synchronization

```java
// Synchronized class
class Table {
    synchronized void printTable(int n) {   // synchronized method
        for (int i = 1; i <= 5; i++) {
            System.out.println(n * i);
            try {
                Thread.sleep(400);
            } catch(Exception e) {
                System.out.println(e);
            }
        }
    }
}

class MyThread1 extends Thread {
    Table t;
    MyThread1(Table t) { this.t = t; }
    public void run() { t.printTable(5); }
}

class MyThread2 extends Thread {
    Table t;
    MyThread2(Table t) { this.t = t; }
    public void run() { t.printTable(100); }
}

public class TestSynchronization2 {
    public static void main(String args[]) {
        Table obj = new Table();     // SINGLE shared object
        MyThread1 t1 = new MyThread1(obj);
        MyThread2 t2 = new MyThread2(obj);
        t1.start();
        t2.start();
    }
}
```
```
Output:
5
10
15
20
25
100
200
300
400
500
```
> Without `synchronized`: the two threads would interleave, mixing 5×table and 100×table output chaotically.
> With `synchronized`: one thread completes fully before the other starts.

---

## 📖 Synchronized Block

A **synchronized block** locks only a specific portion of code rather than the entire method:

```java
synchronized(objectReference) {
    // critical section — only one thread at a time
}
```

---

## 📖 Static Synchronization

Synchronizes on the **class level** (class lock) rather than the object level. Used when multiple objects are involved and you still want mutual exclusion:

```java
synchronized static void methodName() {
    // synchronized on the class, not an instance
}
```

---

## 📖 Inter-Thread Communication (Cooperation)

| Method | Description |
|--------|-------------|
| `wait()` | Causes current thread to release lock and wait until another thread calls `notify()` |
| `notify()` | Wakes up one thread that is waiting on the object's monitor |
| `notifyAll()` | Wakes up all threads waiting on the object's monitor |

---

## 📝 Quiz Answers

**Q1.** What is synchronization in reference to a thread?
> **a) It is a process of handling situations when two or more threads need access to a shared resource**

**Q2.** In the synchronized method example, if two threads call `printTable()` on the same object, they:
> Execute sequentially — one completes before the other begins

---

---

# 14. Quick Reference – Methods, Classes & Key Points

## 🔑 Stream Class Hierarchy

```
java.io
├── Byte Streams
│   ├── OutputStream (abstract)
│   │   ├── FileOutputStream
│   │   ├── ByteArrayOutputStream
│   │   ├── FilterOutputStream
│   │   │   └── DataOutputStream
│   │   └── ObjectOutputStream
│   └── InputStream (abstract)
│       ├── FileInputStream
│       ├── ByteArrayInputStream
│       ├── FilterInputStream
│       └── ObjectInputStream
│
└── Character Streams
    ├── Writer (abstract)
    │   ├── FileWriter
    │   ├── CharArrayWriter
    │   ├── FilterWriter (abstract)
    │   ├── StringWriter
    │   └── PipedWriter
    └── Reader (abstract)
        ├── FileReader
        ├── CharArrayReader
        ├── FilterReader (abstract)
        ├── StringReader
        └── PipedReader
```

---

## 🔑 Byte Stream vs Character Stream

| Aspect | Byte Stream | Character Stream |
|--------|-------------|-----------------|
| **Unit** | Bytes (8-bit) | Characters (Unicode, 16-bit) |
| **Base classes** | InputStream / OutputStream | Reader / Writer |
| **Used for** | Binary data, images, audio | Text data |
| **Encoding** | Raw bytes | Unicode |
| **Example** | FileInputStream/FileOutputStream | FileReader/FileWriter |

---

## 🔑 Stream Class Quick Reference

| Class | Type | Direction | Description |
|-------|------|-----------|-------------|
| `FileInputStream` | Byte | Input | Read bytes from file |
| `FileOutputStream` | Byte | Output | Write bytes to file |
| `ByteArrayInputStream` | Byte | Input | Read bytes from byte array |
| `ByteArrayOutputStream` | Byte | Output | Write bytes to byte array |
| `FileReader` | Char | Input | Read chars from file |
| `FileWriter` | Char | Output | Write chars to file |
| `CharArrayReader` | Char | Input | Read chars from char array |
| `CharArrayWriter` | Char | Output | Write chars to char array |
| `FilterReader` | Char | Input | Abstract — filter char input |
| `FilterWriter` | Char | Output | Abstract — filter char output |
| `PipedReader` | Char | Input | Read chars from pipe |
| `PipedWriter` | Char | Output | Write chars to pipe |
| `ObjectInputStream` | Object | Input | Deserialize objects |
| `ObjectOutputStream` | Object | Output | Serialize objects |

---

## 🔑 Thread States – Quick Reference

```
NEW → RUNNABLE → (RUNNING) → WAITING / TIMED_WAITING → RUNNABLE → TERMINATED
                           ↗                          ↘
                     (blocked on lock)             (lock acquired)
```

| State | Trigger |
|-------|---------|
| **New** | `Thread t = new Thread()` |
| **Runnable** | `t.start()` |
| **Waiting** | `wait()`, `join()` |
| **Timed Waiting** | `sleep(ms)`, `wait(ms)`, `join(ms)` |
| **Terminated** | `run()` method returns or exception thrown |

---

## 🔑 Thread Creation – Two Methods Compared

| | Extend Thread | Implement Runnable |
|--|---------------|-------------------|
| **Syntax** | `class MyThread extends Thread` | `class MyClass implements Runnable` |
| **Method to override** | `run()` | `run()` |
| **Start thread** | `new MyThread().start()` | `new Thread(new MyClass()).start()` |
| **Multiple inheritance** | Not possible (already extends Thread) | Possible (class can extend another class) |
| **Preferred?** | Less preferred | **More preferred** |
| **When to use** | Thread subclass needed | Better OO design |

---

## 🔑 Synchronization — Key Points

| Concept | Key Point |
|---------|-----------|
| **Why needed** | Prevent race conditions when threads share data |
| **Monitor/Lock** | Every object has one; only one thread can hold it at a time |
| **synchronized method** | Entire method is locked; thread acquires lock, executes, releases lock |
| **synchronized block** | Only specific section locked — more granular control |
| **static synchronization** | Locks the class, not an instance |
| **Inter-thread comm** | `wait()`, `notify()`, `notifyAll()` — used inside synchronized context |

---

## 🔑 Serialization — Key Points

| Concept | Key Point |
|---------|-----------|
| **Serializable** | Marker interface — class must implement it |
| **ObjectOutputStream** | Used to serialize (write) objects |
| **ObjectInputStream** | Used to deserialize (read) objects |
| **transient** | Field is NOT serialized |
| **static** | Fields are NOT serialized by default |
| **Platform independence** | Serialized on one JVM, deserialized on any other JVM |

---

## 🔑 Common Exceptions in Java I/O

| Exception | When Thrown |
|-----------|------------|
| `IOException` | General I/O error |
| `FileNotFoundException` | Specified file does not exist |
| `InterruptedException` | Thread is interrupted during `sleep()`, `wait()`, etc. |

---

## 🔑 Quiz Quick Answers (All Topics)

| Question | Answer |
|----------|--------|
| Java I/O classes are in which package? | `java.io` |
| Predefined streams available? | System.in, System.out, System.err (all of above) |
| FileInputStream → ? | Byte stream for reading from file |
| FileOutputStream → ? | Byte stream for writing to file |
| Exception by FileReader constructor? | FileNotFoundException |
| Class used to read chars from file? | FileReader |
| What class extends DataOutputStream? | FilterOutputStream |
| PipedWriter is subclass of? | Writer |
| Thread creation in Java? | Both extend Thread or implement Runnable |
| Method overridden when extending Thread? | run() |
| Which defines multithreaded programming? | Two or more parts of same process run simultaneously |
| Termination of process terminates? | All threads within the process |
| Synchronization is? | Process of handling situations when multiple threads need access to shared resource |
| Serialization is? | Writing the state of an object to a byte stream |
| Interface for serialization? | Serializable |

---

*End of Java OOP Unit 2 Study Notes – All 11 PPTs, Topic-wise 🎯*
