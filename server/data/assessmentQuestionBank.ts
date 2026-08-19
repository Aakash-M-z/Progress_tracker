/**
 * server/data/assessmentQuestionBank.ts
 * Curated Question Bank Seed Data for AlgoAscent Assessments
 */

export interface QuestionBankItem {
    id?: string;
    title: string;
    description: string;
    category: 'Coding' | 'DSA' | 'Aptitude' | 'Logical Reasoning' | 'Quantitative Ability' | 'OOP' | 'DBMS' | 'SQL' | 'OS' | 'CN' | 'Git' | 'Technical' | 'Frontend' | 'Backend' | 'Full Stack';
    questionType: 'coding' | 'mcq' | 'multi_select' | 'subjective';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    points: number;
    options?: { id: string; text: string }[];
    correctAnswer?: any;
    explanation?: string;
    functionName?: string;
    params?: string[];
    starterCode?: Record<string, string>;
    testCases?: { input: any; expectedOutput: any; description?: string }[];
    hiddenTestCases?: { input: any; expectedOutput: any; description?: string }[];
    expectedComplexity?: { time?: string; space?: string };
    timeLimit?: number;
    memoryLimit?: number;
    tags: string[];
}

export const SEED_QUESTION_BANK: QuestionBankItem[] = [
    // ═════════════════════════════════════════════════════════════════════════
    // CODING & DSA
    // ═════════════════════════════════════════════════════════════════════════
    {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        category: "Coding",
        questionType: "coding",
        difficulty: "Easy",
        points: 20,
        functionName: "twoSum",
        params: ["nums", "target"],
        tags: ["Arrays", "Hash Table", "Two Pointers"],
        expectedComplexity: { time: "O(n)", space: "O(n)" },
        starterCode: {
            javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your solution here\n    \n}",
            python: "def twoSum(nums, target):\n    # Write your solution here\n    pass",
            cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        \n    }\n};",
            java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}"
        },
        testCases: [
            { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1], description: "Basic positive pair" },
            { input: [[3, 2, 4], 6], expectedOutput: [1, 2], description: "Elements not at start" },
            { input: [[3, 3], 6], expectedOutput: [0, 1], description: "Duplicate values" }
        ],
        hiddenTestCases: [
            { input: [[-1, -2, -3, -4, -5], -8], expectedOutput: [2, 4], description: "Negative integers" },
            { input: [[0, 4, 3, 0], 0], expectedOutput: [0, 3], description: "Zero sum" },
            { input: [[1000000, 500, 1000000], 2000000], expectedOutput: [0, 2], description: "Large numbers" }
        ],
        explanation: "Using a hash map to store complements allows O(n) time lookup."
    },
    {
        title: "Merge Intervals",
        description: "Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        category: "Coding",
        questionType: "coding",
        difficulty: "Medium",
        points: 25,
        functionName: "merge",
        params: ["intervals"],
        tags: ["Arrays", "Sorting", "Intervals"],
        expectedComplexity: { time: "O(n log n)", space: "O(n)" },
        starterCode: {
            javascript: "/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nfunction merge(intervals) {\n    // Write your solution here\n    \n}",
            python: "def merge(intervals):\n    # Write your solution here\n    pass",
            cpp: "class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Write your solution here\n        \n    }\n};",
            java: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your solution here\n        return new int[][]{};\n    }\n}"
        },
        testCases: [
            { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expectedOutput: [[1, 6], [8, 10], [15, 18]], description: "Standard overlapping intervals" },
            { input: [[[1, 4], [4, 5]]], expectedOutput: [[1, 5]], description: "Touching boundary intervals" }
        ],
        hiddenTestCases: [
            { input: [[[1, 4], [0, 4]]], expectedOutput: [[0, 4]], description: "Unsorted input" },
            { input: [[[1, 4], [2, 3]]], expectedOutput: [[1, 4]], description: "Subsumed interval" },
            { input: [[[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]], expectedOutput: [[1, 10]], description: "Enveloping wide interval" }
        ],
        explanation: "Sort intervals by start time and iteratively merge when current start <= previous end."
    },
    {
        title: "Valid Parentheses",
        description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        category: "DSA",
        questionType: "coding",
        difficulty: "Easy",
        points: 15,
        functionName: "isValid",
        params: ["s"],
        tags: ["Stack", "String"],
        expectedComplexity: { time: "O(n)", space: "O(n)" },
        starterCode: {
            javascript: "/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n    // Write your solution here\n    \n}",
            python: "def isValid(s):\n    # Write your solution here\n    pass",
            cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        \n    }\n};",
            java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}"
        },
        testCases: [
            { input: ["()"], expectedOutput: true, description: "Simple pair" },
            { input: ["()[]{}"], expectedOutput: true, description: "Multiple types" },
            { input: ["(]"], expectedOutput: false, description: "Mismatched pair" }
        ],
        hiddenTestCases: [
            { input: ["([)]"], expectedOutput: false, description: "Interleaved incorrect ordering" },
            { input: ["{[]}"], expectedOutput: true, description: "Nested correct brackets" },
            { input: [""], expectedOutput: true, description: "Empty string" }
        ],
        explanation: "Use a LIFO stack to match closing brackets with top opening brackets."
    },
    {
        title: "Binary Search",
        description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
        category: "DSA",
        questionType: "coding",
        difficulty: "Easy",
        points: 15,
        functionName: "search",
        params: ["nums", "target"],
        tags: ["Binary Search", "Arrays"],
        expectedComplexity: { time: "O(log n)", space: "O(1)" },
        starterCode: {
            javascript: "function search(nums, target) {\n    // Write your solution here\n    \n}",
            python: "def search(nums, target):\n    # Write your solution here\n    pass",
            cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your solution here\n        \n    }\n};",
            java: "class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}"
        },
        testCases: [
            { input: [[-1, 0, 3, 5, 9, 12], 9], expectedOutput: 4, description: "Element exists" },
            { input: [[-1, 0, 3, 5, 9, 12], 2], expectedOutput: -1, description: "Element missing" }
        ],
        hiddenTestCases: [
            { input: [[5], 5], expectedOutput: 0, description: "Single element found" },
            { input: [[5], -5], expectedOutput: -1, description: "Single element not found" },
            { input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1], expectedOutput: 0, description: "First element" },
            { input: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10], expectedOutput: 9, description: "Last element" }
        ],
        explanation: "Standard binary search with two pointers `left` and `right`."
    },

    // ═════════════════════════════════════════════════════════════════════════
    // QUANTITATIVE ABILITY & APTITUDE
    // ═════════════════════════════════════════════════════════════════════════
    {
        title: "Work & Time Calculation",
        description: "A can complete a piece of work in 12 days, and B can complete the same work in 18 days. If they work together for 4 days, what fraction of the work remains unfinished?",
        category: "Quantitative Ability",
        questionType: "mcq",
        difficulty: "Medium",
        points: 10,
        options: [
            { id: "a", text: "4/9" },
            { id: "b", text: "5/9" },
            { id: "c", text: "1/3" },
            { id: "d", text: "2/3" }
        ],
        correctAnswer: "a",
        explanation: "A's 1-day work = 1/12. B's 1-day work = 1/18. Together in 1 day = 1/12 + 1/18 = 5/36. In 4 days = 4 * (5/36) = 20/36 = 5/9. Remaining work = 1 - 5/9 = 4/9.",
        tags: ["Time & Work", "Aptitude"]
    },
    {
        title: "Speed, Time & Distance: Train Crossing",
        description: "A train running at a speed of 72 km/h crosses a platform of length 250 meters in 25 seconds. What is the length of the train?",
        category: "Quantitative Ability",
        questionType: "mcq",
        difficulty: "Medium",
        points: 10,
        options: [
            { id: "a", text: "200 meters" },
            { id: "b", text: "250 meters" },
            { id: "c", text: "300 meters" },
            { id: "d", text: "350 meters" }
        ],
        correctAnswer: "b",
        explanation: "Speed in m/s = 72 * (5/18) = 20 m/s. Total distance covered in 25s = 20 * 25 = 500m. Total distance = Train Length + Platform Length. Train Length = 500 - 250 = 250m.",
        tags: ["Speed & Distance", "Aptitude"]
    },
    {
        title: "Probability: Dice Roll",
        description: "Two fair six-sided dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on top is a prime number?",
        category: "Aptitude",
        questionType: "mcq",
        difficulty: "Medium",
        points: 10,
        options: [
            { id: "a", text: "5/12" },
            { id: "b", text: "7/18" },
            { id: "c", text: "1/2" },
            { id: "d", text: "15/36" }
        ],
        correctAnswer: "a",
        explanation: "Total outcomes = 36. Prime sums possible: 2, 3, 5, 7, 11.\nSum 2: (1,1) -> 1\nSum 3: (1,2),(2,1) -> 2\nSum 5: (1,4),(2,3),(3,2),(4,1) -> 4\nSum 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) -> 6\nSum 11: (5,6),(6,5) -> 2\nTotal prime outcomes = 1 + 2 + 4 + 6 + 2 = 15. Probability = 15/36 = 5/12.",
        tags: ["Probability", "Aptitude"]
    },
    {
        title: "Permutations & Combinations",
        description: "In how many different ways can the letters of the word 'LEADING' be arranged in such a way that the vowels always come together?",
        category: "Quantitative Ability",
        questionType: "mcq",
        difficulty: "Hard",
        points: 10,
        options: [
            { id: "a", text: "360" },
            { id: "b", text: "720" },
            { id: "c", text: "5040" },
            { id: "d", text: "2160" }
        ],
        correctAnswer: "b",
        explanation: "Vowels in LEADING: E, A, I (3 vowels). Consonants: L, D, N, G (4 consonants). Treat (E, A, I) as 1 unit. Total units to arrange = 4 consonants + 1 unit = 5 units -> 5! = 120 ways. The 3 vowels can arrange among themselves in 3! = 6 ways. Total = 120 * 6 = 720 ways.",
        tags: ["Permutations", "Aptitude"]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // LOGICAL REASONING
    // ═════════════════════════════════════════════════════════════════════════
    {
        title: "Blood Relations Logic",
        description: "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
        category: "Logical Reasoning",
        questionType: "mcq",
        difficulty: "Easy",
        points: 10,
        options: [
            { id: "a", text: "Brother" },
            { id: "b", text: "Uncle" },
            { id: "c", text: "Father" },
            { id: "d", text: "Grandfather" }
        ],
        correctAnswer: "c",
        explanation: "The only son of Suresh's mother is Suresh himself. Therefore, the boy is the son of Suresh. Suresh is the father.",
        tags: ["Blood Relations", "Logical Reasoning"]
    },
    {
        title: "Number Series Pattern",
        description: "Find the missing number in the sequence: 4, 18, 48, 100, 180, ?",
        category: "Logical Reasoning",
        questionType: "mcq",
        difficulty: "Hard",
        points: 10,
        options: [
            { id: "a", text: "294" },
            { id: "b", text: "284" },
            { id: "c", text: "290" },
            { id: "d", text: "302" }
        ],
        correctAnswer: "a",
        explanation: "Pattern is n^3 - n^2 (or n^2 * (n - 1)) for n = 2, 3, 4, 5, 6, 7:\n2^3 - 2^2 = 8 - 4 = 4\n3^3 - 3^2 = 27 - 9 = 18\n4^3 - 4^2 = 64 - 16 = 48\n5^3 - 5^2 = 125 - 25 = 100\n6^3 - 6^2 = 216 - 36 = 180\n7^3 - 7^2 = 343 - 49 = 294.",
        tags: ["Number Series", "Logical Reasoning"]
    },
    {
        title: "Syllogism Deduction",
        description: "Statements:\n1. All cars are vehicles.\n2. Some vehicles are electric.\n\nConclusions:\nI. Some cars are electric.\nII. Some electric are vehicles.",
        category: "Logical Reasoning",
        questionType: "mcq",
        difficulty: "Medium",
        points: 10,
        options: [
            { id: "a", text: "Only conclusion I follows" },
            { id: "b", text: "Only conclusion II follows" },
            { id: "c", text: "Both I and II follow" },
            { id: "d", text: "Neither I nor II follows" }
        ],
        correctAnswer: "b",
        explanation: "Statement 2 states 'Some vehicles are electric', which directly implies 'Some electric are vehicles' (conversion of I-type statement). We cannot conclude that cars are electric from the premises.",
        tags: ["Syllogisms", "Logical Reasoning"]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // OBJECT-ORIENTED PROGRAMMING (OOP)
    // ═════════════════════════════════════════════════════════════════════════
    {
        title: "OOP: Polymorphism & Method Resolution",
        description: "Which of the following statements correctly distinguishes between Method Overloading and Method Overriding?",
        category: "OOP",
        questionType: "mcq",
        difficulty: "Easy",
        points: 10,
        options: [
            { id: "a", text: "Overloading occurs at runtime (dynamic binding); Overriding occurs at compile-time (static binding)." },
            { id: "b", text: "Overloading occurs in the same class with different method signatures; Overriding occurs in a subclass with the identical method signature." },
            { id: "c", text: "Overloading requires inheritance; Overriding does not require inheritance." },
            { id: "d", text: "Overriding requires changing the return type and parameter count." }
        ],
        correctAnswer: "b",
        explanation: "Method Overloading happens within the same class with different parameter lists (compile-time polymorphism). Method Overriding happens when a subclass provides a specific implementation of a method already defined in its parent class (runtime polymorphism).",
        tags: ["OOP", "Polymorphism"]
    },
    {
        title: "OOP: SOLID Principles - Liskov Substitution",
        description: "Which principle in SOLID states that 'Objects of a superclass should be replaceable with objects of its subclasses without breaking application correctness'?",
        category: "OOP",
        questionType: "mcq",
        difficulty: "Medium",
        points: 10,
        options: [
            { id: "a", text: "Single Responsibility Principle (SRP)" },
            { id: "b", text: "Open-Closed Principle (OCP)" },
            { id: "c", text: "Liskov Substitution Principle (LSP)" },
            { id: "d", text: "Interface Segregation Principle (ISP)" }
        ],
        correctAnswer: "c",
        explanation: "The Liskov Substitution Principle (LSP) ensures that derived classes must be substitutable for their base classes without altering the desirable properties of the program.",
        tags: ["OOP", "SOLID"]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // DBMS & SQL
    // ═════════════════════════════════════════════════════════════════════════
    {
        title: "DBMS: ACID Properties - Isolation Levels",
        description: "Which transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but allows Phantom Reads in SQL standards?",
        category: "DBMS",
        questionType: "mcq",
        difficulty: "Hard",
        points: 10,
        options: [
            { id: "a", text: "Read Uncommitted" },
            { id: "b", text: "Read Committed" },
            { id: "c", text: "Repeatable Read" },
            { id: "d", text: "Serializable" }
        ],
        correctAnswer: "c",
        explanation: "Repeatable Read prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads (new rows inserted by concurrent committed transactions matching query predicate). Serializable prevents all three.",
        tags: ["DBMS", "Transactions", "ACID"]
    },
    {
        title: "SQL: Subqueries and Second Highest Salary",
        description: "Given an `Employee` table with columns `(id, salary)`, which SQL query correctly and safely retrieves the second highest distinct salary, returning `NULL` if no second highest salary exists?",
        category: "SQL",
        questionType: "mcq",
        difficulty: "Medium",
        points: 10,
        options: [
            { id: "a", text: "SELECT salary FROM Employee ORDER BY salary DESC LIMIT 1 OFFSET 1;" },
            { id: "b", text: "SELECT MAX(salary) AS SecondHighestSalary FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee);" },
            { id: "c", text: "SELECT DISTINCT salary FROM Employee ORDER BY salary DESC LIMIT 2;" },
            { id: "d", text: "SELECT salary FROM Employee WHERE salary = (SELECT AVG(salary) FROM Employee);" }
        ],
        correctAnswer: "b",
        explanation: "`SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee)` properly returns `NULL` when there is only one distinct salary, avoiding empty-row errors.",
        tags: ["SQL", "Queries", "DBMS"]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // OPERATING SYSTEMS
    // ═════════════════════════════════════════════════════════════════════════
    {
        title: "Operating Systems: Deadlock Necessary Conditions",
        description: "Which of the following is NOT one of Coffman's four necessary conditions for a deadlock to occur in an operating system?",
        category: "OS",
        questionType: "mcq",
        difficulty: "Medium",
        points: 10,
        options: [
            { id: "a", text: "Mutual Exclusion" },
            { id: "b", text: "Hold and Wait" },
            { id: "c", text: "Preemption Allowed" },
            { id: "d", text: "Circular Wait" }
        ],
        correctAnswer: "c",
        explanation: "The four Coffman conditions are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption (resources cannot be forcibly taken), and 4. Circular Wait. 'Preemption Allowed' prevents deadlocks.",
        tags: ["OS", "Deadlocks", "Concurrency"]
    },
    {
        title: "Operating Systems: Virtual Memory & Page Faults",
        description: "What phenomenon occurs when a computer's virtual memory subsystem is in a constant state of paging, spending more time swapping pages than executing instructions?",
        category: "OS",
        questionType: "mcq",
        difficulty: "Easy",
        points: 10,
        options: [
            { id: "a", text: "Belady's Anomaly" },
            { id: "b", text: "Thrashing" },
            { id: "c", text: "Starvation" },
            { id: "d", text: "Fragmentation" }
        ],
        correctAnswer: "b",
        explanation: "Thrashing occurs when the system spends more time servicing page faults and moving data between RAM and disk than executing user instructions.",
        tags: ["OS", "Memory Management"]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // COMPUTER NETWORKS
    // ═════════════════════════════════════════════════════════════════════════
    {
        title: "Computer Networks: TCP 3-Way Handshake",
        description: "What is the correct sequence of packet flags exchanged during a standard TCP connection establishment between Client (C) and Server (S)?",
        category: "CN",
        questionType: "mcq",
        difficulty: "Easy",
        points: 10,
        options: [
            { id: "a", text: "C->S: SYN, S->C: ACK, C->S: FIN" },
            { id: "b", text: "C->S: SYN, S->C: SYN-ACK, C->S: ACK" },
            { id: "c", text: "C->S: ACK, S->C: SYN, C->S: ACK" },
            { id: "d", text: "C->S: SYN-ACK, S->C: ACK, C->S: SYN" }
        ],
        correctAnswer: "b",
        explanation: "The 3-way handshake is: 1. Client sends SYN (Synchronize Sequence Number). 2. Server responds with SYN-ACK. 3. Client acknowledges with ACK.",
        tags: ["CN", "TCP/IP", "Networking"]
    },
    {
        title: "Computer Networks: HTTP/1.1 vs HTTP/2 vs HTTP/3",
        description: "What is the underlying transport protocol used by HTTP/3 to eliminate head-of-line blocking at the transport layer?",
        category: "CN",
        questionType: "mcq",
        difficulty: "Hard",
        points: 10,
        options: [
            { id: "a", text: "TCP with TLS 1.3" },
            { id: "b", text: "QUIC over UDP" },
            { id: "c", text: "SCTP" },
            { id: "d", text: "Raw IP Sockets" }
        ],
        correctAnswer: "b",
        explanation: "HTTP/3 uses QUIC (Quick UDP Internet Connections), which runs over UDP and integrates TLS 1.3 encryption natively to prevent TCP head-of-line blocking.",
        tags: ["CN", "Protocols", "HTTP"]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // GIT & VERSION CONTROL
    // ═════════════════════════════════════════════════════════════════════════
    {
        title: "Git: Merge vs Rebase",
        description: "What is the primary difference between `git merge feature` and `git rebase main` on a feature branch?",
        category: "Git",
        questionType: "mcq",
        difficulty: "Medium",
        points: 10,
        options: [
            { id: "a", text: "`merge` rewrites commit hashes, whereas `rebase` creates a new merge commit preserving exact history." },
            { id: "b", text: "`merge` creates a new combined merge commit; `rebase` rewrites the commit history by reapplying commits linearly on top of the base branch." },
            { id: "c", text: "`rebase` cannot cause merge conflicts." },
            { id: "d", text: "`merge` only works on local repositories; `rebase` works exclusively with remote tracking branches." }
        ],
        correctAnswer: "b",
        explanation: "Git merge creates a non-destructive 2-parent merge commit. Git rebase moves the base of the feature branch to the tip of main and creates new commit hashes for linear history.",
        tags: ["Git", "Version Control"]
    },
    {
        title: "Git: Stash and Restore",
        description: "Which Git command saves your uncommitted changes (both staged and unstaged) to a dirty working directory stack and reverts the working tree to match HEAD?",
        category: "Git",
        questionType: "mcq",
        difficulty: "Easy",
        points: 10,
        options: [
            { id: "a", text: "git reset --hard" },
            { id: "b", text: "git stash" },
            { id: "c", text: "git revert HEAD" },
            { id: "d", text: "git clean -fd" }
        ],
        correctAnswer: "b",
        explanation: "`git stash` temporarily shelves changes made in working copy so you can work on something else, then reapply them later with `git stash pop`.",
        tags: ["Git", "Workflow"]
    },

    // ═════════════════════════════════════════════════════════════════════════
    // TECHNICAL & FULL STACK
    // ═════════════════════════════════════════════════════════════════════════
    {
        title: "Frontend: React Virtual DOM & Reconciliation",
        description: "Why does React require stable, unique `key` props when rendering dynamic lists of components?",
        category: "Technical",
        questionType: "mcq",
        difficulty: "Medium",
        points: 10,
        options: [
            { id: "a", text: "To uniquely style DOM elements via CSS selectors." },
            { id: "b", text: "To help React's Diffing algorithm identify which items have changed, been added, or removed across re-renders, minimizing DOM mutations." },
            { id: "c", text: "To enforce JavaScript object indexing." },
            { id: "d", text: "To encrypt the component's internal state in local storage." }
        ],
        correctAnswer: "b",
        explanation: "React uses keys to match children in the original tree with children in the subsequent tree, avoiding unnecessary element re-creation and maintaining component state.",
        tags: ["React", "Frontend", "Technical"]
    },
    {
        title: "Backend: RESTful API Idempotency",
        description: "According to HTTP specifications, which of the following HTTP methods are considered IDEMPOTENT?",
        category: "Technical",
        questionType: "mcq",
        difficulty: "Medium",
        points: 10,
        options: [
            { id: "a", text: "POST and PATCH" },
            { id: "b", text: "GET, PUT, and DELETE" },
            { id: "c", text: "POST, PUT, and DELETE" },
            { id: "d", text: "Only GET" }
        ],
        correctAnswer: "b",
        explanation: "An idempotent HTTP method can be called multiple times without producing a different outcome on the server resources. GET, PUT, DELETE, and HEAD are idempotent. POST is not.",
        tags: ["REST", "Backend", "APIs"]
    }
];
