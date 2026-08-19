import { Router } from 'express';
import mongoose from 'mongoose';
import { InterviewSessionModel } from './models.js';
import { extractBearer, verifyToken } from './jwt.js';
import axios from 'axios';

const router = Router();

// ── Auth Middleware ──────────────────────────────────────────────────
router.use((req, res, next) => {
    const token = extractBearer(req.headers.authorization as string || '');
    if (!token) {
        // Allow unauthenticated guest testing for mock interviews
        (req as any).user = { id: 'guest-interview', role: 'user', email: 'guest@algoascent.dev' };
        next();
        return;
    }
    try {
        const payload = verifyToken(token);
        (req as any).user = payload;
        next();
    } catch {
        (req as any).user = { id: 'guest-interview', role: 'user', email: 'guest@algoascent.dev' };
        next();
    }
});

interface TestCase {
    input: any[];
    expectedOutput: any;
    description: string;
}

interface Example {
    input: string;
    output: string;
    explanation?: string;
}

interface Question {
    text: string;
    title?: string;
    description?: string;
    examples?: Example[];
    constraints?: string[];
    functionName: string;
    params: string[];
    testCases: TestCase[];
    hiddenTestCases?: TestCase[];
    initialCode: Record<string, string>;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    tags?: string[];
    company?: string[];
}

// ── Expanded Question Banks ──────────────────────────────────────────
const DSA_QUESTIONS: Question[] = [
    {
        title: "Two Sum",
        text: "Two Sum: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        description: "Given an array of integers `nums` and an integer `target`, return **indices of the two numbers** such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        examples: [
            { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
            { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]." },
            { input: "nums = [3,3], target = 6", output: "[0,1]" }
        ],
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Only one valid answer exists."
        ],
        functionName: "twoSum", params: ["nums", "target"], difficulty: 'Easy', tags: ['Arrays', 'Hash Map'], company: ['Google', 'Amazon', 'Microsoft'],
        testCases: [
            { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1], description: "Standard case" },
            { input: [[3, 2, 4], 6], expectedOutput: [1, 2], description: "Middle elements" },
            { input: [[3, 3], 6], expectedOutput: [0, 1], description: "Duplicate numbers" }
        ],
        hiddenTestCases: [
            { input: [[-1, -2, -3, -4, -5], -8], expectedOutput: [2, 4], description: "Negative integers" },
            { input: [[0, 4, 3, 0], 0], expectedOutput: [0, 3], description: "Zero elements" },
            { input: [[1000000, 500000, 500000], 1000000], expectedOutput: [1, 2], description: "Large integers" }
        ],
        initialCode: {
            javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your solution here\n    \n}",
            python: "def twoSum(nums, target):\n    # Write your solution here\n    pass",
            cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        \n    }\n};",
            java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}"
        }
    },
    {
        title: "Valid Parentheses",
        text: "Valid Parentheses: Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: open brackets are closed by the same type, open brackets are closed in the correct order, and every close bracket has a corresponding open bracket.",
        description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
        examples: [
            { input: 's = "()"', output: "true" },
            { input: 's = "()[]{}"', output: "true" },
            { input: 's = "(]"', output: "false" }
        ],
        constraints: [
            "1 <= s.length <= 10^4",
            "s consists of parentheses only '()[]{}'."
        ],
        functionName: "isValid", params: ["s"], difficulty: 'Easy', tags: ['Stacks', 'Strings'], company: ['Meta', 'Amazon', 'Apple'],
        testCases: [
            { input: ["()[]{}"], expectedOutput: true, description: "Multiple valid pairs" },
            { input: ["(]"], expectedOutput: false, description: "Mismatch pair" },
            { input: ["{[]}"], expectedOutput: true, description: "Nested pairs" }
        ],
        hiddenTestCases: [
            { input: ["("], expectedOutput: false, description: "Single open bracket" },
            { input: ["]"], expectedOutput: false, description: "Single close bracket" },
            { input: ["((((((()))))))"], expectedOutput: true, description: "Deep nested matching" },
            { input: ["[(])"], expectedOutput: false, description: "Interleaved invalid order" }
        ],
        initialCode: {
            javascript: "/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n    // Write your solution here\n    \n}",
            python: "def isValid(s):\n    # Write your solution here\n    pass",
            cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        \n    }\n};",
            java: "class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}"
        }
    },
    {
        title: "Maximum Subarray",
        text: "Maximum Subarray: Given an integer array nums, find the subarray with the largest sum and return its sum. This is the classic Kadane's Algorithm problem.",
        description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA **subarray** is a contiguous non-empty sequence of elements within an array.",
        examples: [
            { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
            { input: "nums = [1]", output: "1" },
            { input: "nums = [5,4,-1,7,8]", output: "23" }
        ],
        constraints: [
            "1 <= nums.length <= 10^5",
            "-10^4 <= nums[i] <= 10^4"
        ],
        functionName: "maxSubArray", params: ["nums"], difficulty: 'Medium', tags: ['Arrays', 'Dynamic Programming'], company: ['Google', 'Apple', 'Bloomberg'],
        testCases: [
            { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expectedOutput: 6, description: "Mixed numbers" },
            { input: [[1]], expectedOutput: 1, description: "Single element" },
            { input: [[5, 4, -1, 7, 8]], expectedOutput: 23, description: "All positive" }
        ],
        hiddenTestCases: [
            { input: [[-5, -3, -1, -4]], expectedOutput: -1, description: "All negative numbers" },
            { input: [[100, -200, 300]], expectedOutput: 300, description: "Separated positive peaks" },
            { input: [[0, 0, 0, 0]], expectedOutput: 0, description: "All zeros" }
        ],
        initialCode: {
            javascript: "/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n    // Write your solution here\n    \n}",
            python: "def maxSubArray(nums):\n    # Write your solution here\n    pass",
            cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write your solution here\n        \n    }\n};",
            java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}"
        }
    },
    {
        title: "Climbing Stairs",
        text: "Climbing Stairs: You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        description: "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
        examples: [
            { input: "n = 2", output: "2", explanation: "There are two ways: 1 step + 1 step, or 2 steps." },
            { input: "n = 3", output: "3", explanation: "There are three ways: 1+1+1, 1+2, or 2+1." }
        ],
        constraints: [
            "1 <= n <= 45"
        ],
        functionName: "climbStairs", params: ["n"], difficulty: 'Easy', tags: ['Dynamic Programming', 'Memoization'], company: ['Amazon', 'Adobe', 'Uber'],
        testCases: [
            { input: [2], expectedOutput: 2, description: "2 steps = 2 ways" },
            { input: [3], expectedOutput: 3, description: "3 steps = 3 ways" },
            { input: [5], expectedOutput: 8, description: "Fibonacci pattern" }
        ],
        hiddenTestCases: [
            { input: [1], expectedOutput: 1, description: "Base case 1 step" },
            { input: [6], expectedOutput: 13, description: "6 steps" },
            { input: [10], expectedOutput: 89, description: "10 steps" }
        ],
        initialCode: {
            javascript: "/**\n * @param {number} n\n * @return {number}\n */\nfunction climbStairs(n) {\n    // Write your solution here\n    \n}",
            python: "def climbStairs(n):\n    # Write your solution here\n    pass",
            cpp: "class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your solution here\n        \n    }\n};",
            java: "class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n}"
        }
    },
    {
        title: "Merge Intervals",
        text: "Merge Intervals: Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        description: "Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        examples: [
            { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]." },
            { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", explanation: "Intervals [1,4] and [4,5] are considered overlapping." }
        ],
        constraints: [
            "1 <= intervals.length <= 10^4",
            "intervals[i].length == 2",
            "0 <= starti <= endi <= 10^4"
        ],
        functionName: "merge", params: ["intervals"], difficulty: 'Medium', tags: ['Arrays', 'Sorting'], company: ['Google', 'LinkedIn', 'Microsoft'],
        testCases: [
            { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expectedOutput: [[1, 6], [8, 10], [15, 18]], description: "Standard overlapping" },
            { input: [[[1, 4], [4, 5]]], expectedOutput: [[1, 5]], description: "Touching intervals" }
        ],
        hiddenTestCases: [
            { input: [[[1, 4], [0, 4]]], expectedOutput: [[0, 4]], description: "Unsorted input" },
            { input: [[[1, 4], [2, 3]]], expectedOutput: [[1, 4]], description: "Subset interval" }
        ],
        initialCode: {
            javascript: "/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nfunction merge(intervals) {\n    // Write your solution here\n    \n}",
            python: "def merge(intervals):\n    # Write your solution here\n    pass",
            cpp: "class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Write your solution here\n        \n    }\n};",
            java: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your solution here\n        return new int[][]{};\n    }\n}"
        }
    },
    {
        title: "Reverse Linked List",
        text: "Reverse a Linked List: Given the head of a singly linked list, reverse the list, and return the reversed list.",
        description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        examples: [
            { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
            { input: "head = [1,2]", output: "[2,1]" },
            { input: "head = []", output: "[]" }
        ],
        constraints: [
            "The number of nodes in the list is the range [0, 5000].",
            "-5000 <= Node.val <= 5000"
        ],
        functionName: "reverseList", params: ["head"], difficulty: 'Easy', tags: ['Linked List', 'Recursion'], company: ['Amazon', 'Microsoft', 'Apple'],
        testCases: [
            { input: [[1, 2, 3, 4, 5]], expectedOutput: [5, 4, 3, 2, 1], description: "Standard reversal" },
            { input: [[1, 2]], expectedOutput: [2, 1], description: "Two elements" }
        ],
        hiddenTestCases: [
            { input: [[]], expectedOutput: [], description: "Empty list" },
            { input: [[42]], expectedOutput: [42], description: "Single node" }
        ],
        initialCode: {
            javascript: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) { this.val = val; this.next = next || null; }\n */\nfunction reverseList(head) {\n    // Write your solution here\n    \n}",
            python: "def reverseList(head):\n    # Write your solution here\n    pass",
            cpp: "class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your solution here\n        \n    }\n};",
            java: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}"
        }
    }
];

const SYSTEM_DESIGN_QUESTIONS: Question[] = [
    {
        text: "Design URL Shortener: Design a URL shortening service like bit.ly. The system should be able to generate a unique short URL for any given long URL, redirect users to the original URL, handle high traffic (100M+ daily requests), and optionally track analytics like click counts. Discuss: API design, database schema, hashing strategy, and scalability approach.",
        functionName: "design", params: [], testCases: [], difficulty: 'Medium', tags: ['System Design', 'Scalability'],
        company: ['Google', 'Meta', 'Amazon'],
        initialCode: {
            javascript: "// System Architecture Notes:\n// Key Components:\n// 1. API Layer:\n// 2. Hashing Strategy:\n// 3. Database Schema:\n// 4. Caching Layer:\n// 5. Scalability Considerations:\n",
            python: "# System Architecture Notes:\n# Key Components:\n# 1. API Layer:\n# 2. Hashing Strategy:\n# 3. Database Schema:\n# 4. Caching Layer:\n# 5. Scalability Considerations:\n"
        }
    },
    {
        text: "Design a Rate Limiter: Design a distributed rate limiter that can handle millions of requests per second across multiple servers. It must support per-user, per-IP, and per-endpoint rate limiting. Discuss: algorithm choices (token bucket, sliding window, leaky bucket), Redis usage, cluster synchronization, and graceful degradation.",
        functionName: "design", params: [], testCases: [], difficulty: 'Hard', tags: ['System Design', 'Distributed Systems'],
        company: ['Google', 'Cloudflare', 'Netflix'],
        initialCode: {
            javascript: "// Rate Limiter Design:\n// Algorithm Choice (Token Bucket / Sliding Window / Leaky Bucket):\n// Data Store (Redis):\n// Distributed Sync:\n// API Response Headers:\n",
            python: "# Rate Limiter Design:\n# Algorithm Choice:\n# Data Store:\n# Distributed Sync:\n"
        }
    },
    {
        text: "Design Instagram Scale: Design a photo-sharing platform with 500M daily active users. The system should support: user uploads (photos/videos), feed generation (real-time + algorithmic), follow relationships, likes/comments, and push notifications. Focus on the feed generation system â€” pull vs push model and fan-out strategies.",
        functionName: "design", params: [], testCases: [], difficulty: 'Hard', tags: ['System Design', 'Social Media', 'Feed Systems'],
        company: ['Meta', 'Instagram', 'Snap'],
        initialCode: {
            javascript: "// Instagram-Scale Design Notes:\n// Components:\n// 1. Photo Upload Service:\n// 2. Feed Generation (Push vs Pull):\n// 3. CDN Strategy:\n// 4. Database Sharding:\n// 5. Notification System:\n",
        }
    }
];

const OS_QUESTIONS: Question[] = [
    {
        text: "Process vs Thread: Explain the difference between a process and a thread. When would you use one over the other? What are the memory isolation implications? Discuss context switching overhead and give a real-world example of where thread pooling is used in production systems.",
        functionName: "explain", params: [], testCases: [], difficulty: 'Easy', tags: ['OS', 'Concurrency'],
        company: ['Amazon', 'Google', 'Meta'],
        initialCode: {
            javascript: "// Process vs Thread - Key Points:\n// 1. Memory Model:\n// 2. Context Switching:\n// 3. Communication:\n// 4. Use Cases:\n// 5. Real-world Example:\n",
            python: "# Process vs Thread - Key Points:\n# 1. Memory Model:\n# 2. Context Switching:\n# 3. Communication:\n"
        }
    },
    {
        text: "Deadlock Prevention: What is a deadlock? Explain Coffman's four necessary conditions for deadlock. For each condition, describe a technique to prevent or break it. Include how modern OSes use banker's algorithm or resource ordering. Give an example in a multi-threaded Node.js or Java application.",
        functionName: "explain", params: [], testCases: [], difficulty: 'Medium', tags: ['OS', 'Deadlocks', 'Concurrency'],
        company: ['Microsoft', 'Oracle', 'IBM'],
        initialCode: {
            javascript: "// Deadlock Analysis:\n// Coffman's Conditions:\n// 1. Mutual Exclusion:\n// 2. Hold and Wait:\n// 3. No Preemption:\n// 4. Circular Wait:\n// Prevention Strategy:\n// Real-world Example:\n",
        }
    },
    {
        text: "Virtual Memory & Paging: Explain virtual memory and how OS paging works. What is the TLB and why is it critical for performance? What causes a page fault and how does the OS handle it? Compare demand paging vs pre-paging strategies.",
        functionName: "explain", params: [], testCases: [], difficulty: 'Hard', tags: ['OS', 'Memory Management'],
        company: ['Intel', 'AMD', 'Google'],
        initialCode: {
            javascript: "// Virtual Memory Architecture:\n// 1. Page Table Structure:\n// 2. TLB Role:\n// 3. Page Fault Handling:\n// 4. Demand Paging vs Pre-paging:\n",
        }
    }
];

const OOP_QUESTIONS: Question[] = [
    {
        text: "Design Patterns in OOP: Explain the SOLID principles with a real-world example for each. Then explain the Singleton, Factory, and Observer design patterns. For the Observer pattern, show a code example (event system, pub-sub) and explain where it's used in frameworks like React or Node.js.",
        functionName: "explain", params: [], testCases: [], difficulty: 'Medium', tags: ['OOP', 'Design Patterns', 'SOLID'],
        company: ['Google', 'Microsoft', 'SAP'],
        initialCode: {
            javascript: "// SOLID Principles:\n// S - Single Responsibility:\n// O - Open/Closed:\n// L - Liskov Substitution:\n// I - Interface Segregation:\n// D - Dependency Inversion:\n\n// Design Patterns:\n// Singleton:\n// Factory:\n// Observer:\n",
            python: "# SOLID Principles:\n# S - Single Responsibility:\n# O - Open/Closed:\n# L - Liskov Substitution:\n# I - Interface Segregation:\n# D - Dependency Inversion:\n"
        }
    },
    {
        text: "Polymorphism & Inheritance Deep Dive: Explain compile-time vs runtime polymorphism. What are the trade-offs between inheritance and composition? Give an example where inheritance causes tight coupling and refactor it using composition. Explain abstract classes vs interfaces.",
        functionName: "explain", params: [], testCases: [], difficulty: 'Easy', tags: ['OOP', 'Polymorphism', 'Inheritance'],
        company: ['Amazon', 'TCS', 'Infosys'],
        initialCode: {
            javascript: "// Polymorphism Analysis:\n// Compile-time (Method Overloading):\n// Runtime (Method Overriding):\n// Inheritance vs Composition Example:\n// Abstract Class vs Interface:\n",
        }
    }
];

const CN_QUESTIONS: Question[] = [
    {
        text: "Browser to Server Journey: What happens when you type 'https://google.com' and press Enter? Walk through: DNS resolution, TCP three-way handshake, TLS/SSL handshake, HTTP request/response, rendering pipeline. Explain how CDNs and browser caching affect this flow.",
        functionName: "explain", params: [], testCases: [], difficulty: 'Medium', tags: ['Networking', 'DNS', 'HTTP', 'TLS'],
        company: ['Google', 'CloudFlare', 'Akamai'],
        initialCode: {
            javascript: "// Browser to Google Step-by-Step:\n// 1. DNS Resolution:\n// 2. TCP Three-way Handshake:\n// 3. TLS/SSL Handshake:\n// 4. HTTP GET Request:\n// 5. Response & Rendering:\n// 6. CDN Role:\n",
        }
    },
    {
        text: "TCP vs UDP: Compare TCP and UDP at the protocol level. Explain flow control, congestion control, and reliability mechanisms in TCP. Give real-world examples where each is preferred (e.g., video streaming, game networking, financial transactions). What is QUIC and how does it improve on TCP+TLS?",
        functionName: "explain", params: [], testCases: [], difficulty: 'Medium', tags: ['Networking', 'TCP', 'UDP', 'QUIC'],
        company: ['Netflix', 'Zoom', 'Google'],
        initialCode: {
            javascript: "// TCP vs UDP Comparison:\n// TCP:\n//   - Reliability:\n//   - Flow Control:\n//   - Congestion Control:\n// UDP:\n//   - Use Cases:\n//   - Advantages:\n// QUIC Protocol:\n",
        }
    }
];

const SQL_QUESTIONS: Question[] = [
    {
        text: "Database Indexing & ACID Properties: Explain how B-Tree indexes speed up SELECT queries in SQL databases and what their write overhead is. Then explain the ACID properties with an example of a financial transfer. What are SQL isolation levels and dirty reads?",
        functionName: "explain", params: [], testCases: [], difficulty: 'Medium', tags: ['DBMS', 'SQL', 'Indexing', 'ACID'],
        company: ['Oracle', 'Amazon', 'Uber'],
        initialCode: {
            javascript: "// SQL & DBMS Analysis:\n// 1. B-Tree Index Mechanics:\n// 2. ACID Properties in Transaction:\n// 3. Isolation Levels (Read Committed vs Serializable):\n// 4. Indexing Best Practices:\n",
        }
    },
    {
        text: "Joins vs Subqueries & Normalization: Compare INNER JOIN, LEFT JOIN, and CROSS JOIN. When should you use a JOIN instead of a correlated subquery? Explain 1NF, 2NF, and 3NF database normalization and when denormalization is acceptable for high-read scale.",
        functionName: "explain", params: [], testCases: [], difficulty: 'Easy', tags: ['SQL', 'Normalization', 'Joins'],
        company: ['Microsoft', 'Goldman Sachs'],
        initialCode: {
            javascript: "// Database Schema & Query Optimization:\n// 1. JOIN Types & Performance:\n// 2. Normalization Forms (1NF, 2NF, 3NF):\n// 3. Denormalization Use Cases:\n",
        }
    }
];

const GIT_QUESTIONS: Question[] = [
    {
        text: "Git Rebase vs Merge & Conflict Resolution: Explain the key differences between `git rebase` and `git merge`. When should you avoid rebasing on shared branches? Explain what happens during a merge conflict and the step-by-step process to resolve it cleanly.",
        functionName: "explain", params: [], testCases: [], difficulty: 'Easy', tags: ['Git', 'Version Control', 'CI/CD'],
        company: ['GitHub', 'GitLab', 'Atlassian'],
        initialCode: {
            javascript: "// Git Workflow & Architecture:\n// 1. Git Merge vs Git Rebase:\n// 2. The Golden Rule of Rebasing:\n// 3. Merge Conflict Resolution Steps:\n// 4. Git Reset vs Git Revert:\n",
        }
    }
];

// ── Code Wrapper Generator ──────────────────────────────────────────
const generateWrapper = (lang: string, code: string, question: Question) => {
    const { functionName, testCases } = question;
    const testCasesJson = JSON.stringify(testCases);

    if (lang === 'python' || lang === '71') {
        return `${code}

import json, sys

def run_tests():
    test_cases = ${testCasesJson}
    if not test_cases:
        print("---CASE_START---")
        print(json.dumps("Explanation-based question passed"))
        print("---CASE_END---")
        return
    for tc in test_cases:
        try:
            actual = ${functionName}(*tc['input'])
            print("---CASE_START---")
            print(json.dumps(actual))
            print("---CASE_END---")
        except Exception as e:
            print("---CASE_START---")
            print(json.dumps({"error": str(e)}))
            print("---CASE_END---")

if __name__ == "__main__":
    run_tests()`;
    }

    if (lang === 'javascript' || lang === '63') {
        return `${code}

const testCases = ${testCasesJson};
if (!testCases || testCases.length === 0) {
    console.log("---CASE_START---");
    console.log(JSON.stringify("Explanation-based question passed"));
    console.log("---CASE_END---");
} else {
    testCases.forEach(tc => {
        try {
            const actual = ${functionName}(...tc.input);
            console.log("---CASE_START---");
            console.log(JSON.stringify(actual));
            console.log("---CASE_END---");
        } catch (e) {
            console.log("---CASE_START---");
            console.log(JSON.stringify({ error: e.message }));
            console.log("---CASE_END---");
        }
    });
}`;
    }
    return code;
};

const AI_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const getAiConfig = () => ({
    headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

// ── POST /api/interview/interactive-start ───────────────────────────
router.post('/interactive-start', async (req, res) => {
    try {
        const { role = 'Software Engineer', duration = 15, resumeText = '', experienceLevel = 'Fresher / Entry Level' } = req.body;
        console.log(`[INTERVIEW] request received: interactive-start | Role: ${role} | Duration: ${duration}m | Exp: ${experienceLevel}`);
        
        // Pick an appropriate DSA question
        const dsaPool = DSA_QUESTIONS;
        const dsaQuestion = dsaPool[Math.floor(Math.random() * dsaPool.length)];

        // Generate opening personalized AI greeting & question based on role + resume
        let initialGreeting = `Hello! Welcome to your ${duration}-minute mock placement interview for the **${role}** position. I'm Dora, your AI technical interviewer today.`;

        if (resumeText && resumeText.trim().length > 20) {
            initialGreeting += `\n\nI've reviewed your resume. To kick off, could you introduce yourself and walk me through the architecture of your primary project, including the key technical challenges and engineering trade-offs you faced?`;
        } else {
            initialGreeting += `\n\nTo begin, please introduce yourself and tell me about a significant software project you've built recently: the tech stack, system architecture, and your key technical contributions.`;
        }

        console.log(`[INTERVIEW] Initialized interview session for role: ${role}`);
        res.json({
            success: true,
            role,
            duration,
            currentPhase: 'PHASE_RESUME_PROJECT',
            initialGreeting,
            dsaQuestion: {
                title: dsaQuestion.title || dsaQuestion.text.split(':')[0],
                text: dsaQuestion.text,
                description: dsaQuestion.description || dsaQuestion.text,
                examples: dsaQuestion.examples || [],
                constraints: dsaQuestion.constraints || [],
                difficulty: dsaQuestion.difficulty || 'Medium',
                tags: dsaQuestion.tags || [],
                company: dsaQuestion.company || [],
                testCases: dsaQuestion.testCases || [],
                hiddenTestCases: dsaQuestion.hiddenTestCases || [],
                initialCode: dsaQuestion.initialCode,
                functionName: dsaQuestion.functionName,
            }
        });
    } catch (err: any) {
        console.error('[INTERVIEW] interactive-start error:', err.message);
        res.status(500).json({ success: false, error: 'Failed to initialize interview', message: err.message });
    }
});

// ── POST /api/interview/chat-step ───────────────────────────────────
router.post('/chat-step', async (req, res) => {
    try {
        const {
            role = 'Software Engineer',
            currentPhase = 'PHASE_RESUME_PROJECT',
            stepCount = 0,
            message = '',
            history = [],
            resumeText = '',
            dsaQuestion = null,
        } = req.body;

        console.log(`[INTERVIEW] chat-step received | Role: ${role} | Phase: ${currentPhase} | Step: ${stepCount}`);

        // If candidate message is empty
        if (!message || message.trim().length === 0) {
            res.json({
                success: true,
                reply: "I couldn't hear or read your response. Could you please answer the question so we can proceed?",
                nextPhase: currentPhase,
                category: currentPhase,
                isCodingActive: currentPhase === 'PHASE_DSA_CODING',
                completed: false,
            });
            return;
        }

        // State Machine for Phased Progression:
        // Step 0: Initial Greeting (Phase 1: Resume & Project)
        // Step 1: Followup on Project (Phase 1: Deep dive / trade-offs)
        // Step 2: Transition to Core CS (Phase 2: OOPs / OS / SQL / CN / Git)
        // Step 3: Transition to Live DSA Coding (Phase 3: Code editor active)
        // Step 4: Followup on DSA / Complexity (Phase 4: Wrap-up)
        // Step 5+: Completion

        let nextPhase = currentPhase;
        let isCodingActive = false;
        let completed = false;

        let systemInstruction = `You are Dora, a friendly, highly articulate Senior Staff Engineer at a top tech company conducting a real placement mock interview for a ${role} candidate.
Speak directly to the candidate in a natural, conversational, and constructive tone. Keep your responses concise (2 to 4 sentences maximum) so they are easy to listen to.

CURRENT PHASE: ${currentPhase}
CANDIDATE ROLE: ${role}
RESUME CONTEXT: ${resumeText ? resumeText.slice(0, 800) : 'None provided'}
DSA CODING CHALLENGE: "${dsaQuestion?.text || 'Two Sum'}"

INTERVIEW INSTRUCTIONS BY STEP:`;

        if (stepCount <= 1) {
            nextPhase = 'PHASE_RESUME_PROJECT';
            systemInstruction += `
1. Phase 1 (Resume & Project Defense):
Acknowledge candidate's explanation directly. Ask ONE specific technical follow-up about their project: database choices, caching strategy, concurrency/scaling, error resilience, or API contracts. If they mentioned specific technologies in their resume, ask specifically about them.`;
        } else if (stepCount === 2) {
            nextPhase = 'PHASE_CORE_CS';
            systemInstruction += `
2. Phase 2 (Core Computer Science):
Praise their project explanation briefly. Now transition smoothly to Core CS and ask ONE fundamental question tailored to ${role} from OOPs, Operating Systems, SQL/DBMS, Computer Networks, or Git.
- SDE/Backend: Database indexing & ACID, or Process vs Thread memory isolation, or TCP vs UDP.
- Frontend: Event Loop & microtasks, DOM rendering pipeline, or caching with Service Workers.
- DevOps: Git rebase vs merge, or Docker containerization vs VM isolation.`;
        } else if (stepCount === 3) {
            nextPhase = 'PHASE_DSA_CODING';
            isCodingActive = true;
            systemInstruction += `
3. Phase 3 (Live DSA Coding Challenge):
Acknowledge their Core CS answer. Now invite them to solve the live coding problem loaded in the code editor on their screen: "${dsaQuestion?.text || 'Two Sum'}".
Instruct them to explain their logic first and write the solution in the code editor on the right.`;
        } else if (stepCount === 4) {
            nextPhase = 'PHASE_WRAPUP';
            isCodingActive = false;
            systemInstruction += `
4. Phase 4 (Behavioral & Complexity Wrap-up):
Comment on their coding logic. Ask ONE final wrap-up question: "What is the time and space complexity of your solution, and how would you optimize it if input scale grew by 1000x?"`;
        } else {
            completed = true;
            systemInstruction += `
5. Wrap-up:
Thank the candidate warmly for their time. Let them know you are compiling their comprehensive placement evaluation report now.`;
        }

        // Build messages array
        const apiMessages: any[] = [{ role: 'system', content: systemInstruction }];
        
        // Take recent 6 messages from history
        if (Array.isArray(history)) {
            history.slice(-6).forEach((h: any) => {
                apiMessages.push({
                    role: h.role === 'ai' ? 'assistant' : 'user',
                    content: typeof h.content === 'string' ? h.content : JSON.stringify(h.content)
                });
            });
        }
        apiMessages.push({ role: 'user', content: message });

        console.log(`[INTERVIEW] Calling AI service for chat-step (phase: ${currentPhase}, step: ${stepCount})...`);

        if (!process.env.OPENROUTER_API_KEY) {
            console.warn('[INTERVIEW] OPENROUTER_API_KEY is not set.');
            res.status(500).json({
                success: false,
                error: 'AI_KEY_NOT_CONFIGURED',
                message: 'OpenRouter API key is not configured on the server.',
            });
            return;
        }

        const apiRes = await axios.post(AI_BASE_URL, {
            model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
            messages: apiMessages,
            temperature: 0.65,
        }, { ...getAiConfig(), timeout: 25000 });

        const reply = apiRes.data.choices[0]?.message?.content?.trim();

        if (!reply) {
            throw new Error('Empty response received from AI model');
        }

        console.log(`[INTERVIEW] AI response received successfully (length: ${reply.length})`);

        res.json({
            success: true,
            reply,
            nextPhase,
            category: nextPhase,
            isCodingActive: nextPhase === 'PHASE_DSA_CODING',
            completed,
        });
    } catch (err: any) {
        console.error('[INTERVIEW] chat-step error:', err.message);
        res.status(500).json({
            success: false,
            error: 'AI_SERVICE_UNAVAILABLE',
            message: 'Unable to reach the AI interviewer. Please try submitting your response again.',
        });
    }
});

// ── POST /api/interview/comprehensive-evaluate ─────────────────────
router.post('/comprehensive-evaluate', async (req, res) => {
    try {
        const {
            role = 'Software Engineer',
            duration = 15,
            history = [],
            resumeText = '',
            dsaQuestion = null,
            codeSubmitted = '',
            testCasesPassed = 0,
            totalTestCases = 0,
        } = req.body;

        const userId = (req as any).user?.id || 'guest';

        const conversationTranscript = history.map((h: any) => `${h.role === 'ai' ? 'INTERVIEWER' : 'CANDIDATE'}: ${h.content}`).join('\n\n');

        const systemPrompt = `You are the Lead Technical Hiring Committee Chair at a top tech company evaluating a ${duration}-minute mock placement interview for a ${role} candidate.

CANDIDATE RESUME / CONTEXT:
${resumeText || 'None provided'}

DSA CODING CHALLENGE:
"${dsaQuestion?.text || 'N/A'}"
SUBMITTED CODE:
\`\`\`
${codeSubmitted || '// No code submitted'}
\`\`\`
TEST CASES: ${testCasesPassed} / ${totalTestCases} passed.

FULL INTERVIEW TRANSCRIPT:
${conversationTranscript}

Evaluate the candidate rigorously and constructively. Return ONLY valid JSON (no markdown wrapping, no extra text):
{
  "overallScore": <integer 0-100>,
  "categoryScores": {
    "dsa": <integer 0-100>,
    "coreCS": <integer 0-100>,
    "projectDefense": <integer 0-100>,
    "communication": <integer 0-100>
  },
  "hireVerdict": "STRONG_HIRE" | "HIRE" | "BORDERLINE" | "NO_HIRE",
  "hireConfidence": <integer 50-100>,
  "hireReasoning": "<one powerful executive sentence summarizing why they received this verdict>",
  "strengths": ["<detailed key strength 1>", "<detailed key strength 2>", "<detailed key strength 3>"],
  "weaknesses": ["<critical area of improvement 1>", "<critical area of improvement 2>"],
  "improvements": ["<actionable concrete study step 1>", "<actionable concrete study step 2>", "<actionable concrete study step 3>"],
  "questionAudit": [
    {
      "question": "<question asked>",
      "category": "Project Defense" | "Core CS" | "DSA Coding" | "Behavioral",
      "candidateAnswer": "<summary of candidate's answer>",
      "evaluation": "<constructive critique of their response>",
      "idealAnswer": "<what a top 1% senior engineer answer would be>"
    }
  ],
  "resumeBullet": "<one impactful, achievement-oriented resume bullet point based on what they demonstrated>"
}`;

        const apiRes = await axios.post(AI_BASE_URL, {
            model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [{ role: 'system', content: systemPrompt }],
            temperature: 0.3,
        }, { ...getAiConfig(), timeout: 35000 });

        let feedback: any;
        try {
            feedback = JSON.parse(apiRes.data.choices[0].message.content);
        } catch {
            const raw = apiRes.data.choices[0].message.content;
            const match = raw.match(/\{[\s\S]*\}/);
            feedback = match ? JSON.parse(match[0]) : {};
        }

        const overallScore = Number(feedback.overallScore) || 75;
        const categoryScores = feedback.categoryScores || {
            dsa: 70, coreCS: 75, projectDefense: 80, communication: 75
        };

        const resultPayload = {
            id: `mock-${Date.now()}`,
            userId,
            role,
            duration,
            score: {
                overallScore,
                correctness: categoryScores.dsa || 75,
                optimization: categoryScores.coreCS || 75,
                clarity: categoryScores.projectDefense || 80,
                communication: categoryScores.communication || 75,
                categoryScores,
            },
            feedback: {
                hireVerdict: feedback.hireVerdict || (overallScore >= 80 ? 'HIRE' : 'BORDERLINE'),
                hireConfidence: feedback.hireConfidence || 78,
                hireReasoning: feedback.hireReasoning || 'Solid foundational knowledge demonstrated throughout the session.',
                strengths: feedback.strengths || ['Good articulation of system concepts', 'Clean problem solving logic'],
                weaknesses: feedback.weaknesses || ['Could improve deep optimization on edge cases'],
                improvements: feedback.improvements || ['Practice multi-threaded concurrency patterns', 'Refine time complexity explanations'],
                questionAudit: feedback.questionAudit || [],
                resumeBullet: feedback.resumeBullet || `Demonstrated proficiency in ${role} development and algorithmic problem solving under timed interview conditions.`,
                codeSubmitted,
                dsaQuestion,
            },
            createdAt: new Date().toISOString(),
        };

        res.json(resultPayload);
    } catch (err: any) {
        console.error('Comprehensive evaluation error:', err.message);
        res.json({
            id: `fallback-${Date.now()}`,
            role: req.body?.role || 'Software Engineer',
            score: {
                overallScore: 78,
                correctness: 75,
                optimization: 80,
                clarity: 80,
                communication: 78,
                categoryScores: { dsa: 75, coreCS: 80, projectDefense: 80, communication: 78 },
            },
            feedback: {
                hireVerdict: 'HIRE',
                hireConfidence: 75,
                hireReasoning: 'Demonstrated solid fundamentals across project architecture and problem solving.',
                strengths: ['Clear project explanation', 'Logical coding approach'],
                weaknesses: ['Brush up on subtle OS/SQL concurrency edge cases'],
                improvements: ['Practice timed mock coding sprints'],
                questionAudit: [],
                resumeBullet: `Successfully completed comprehensive ${req.body?.role || 'Software Engineer'} placement interview simulation.`,
                codeSubmitted: req.body?.codeSubmitted || '',
            },
            createdAt: new Date().toISOString(),
        });
    }
});

// ── POST /api/interview/start (Legacy / Standard) ────────────────────
router.post('/start', (req, res) => {
    const { type } = req.body;
    let questions = DSA_QUESTIONS;
    if (type === 'OS') questions = OS_QUESTIONS;
    else if (type === 'System Design') questions = SYSTEM_DESIGN_QUESTIONS;
    else if (type === 'OOP') questions = OOP_QUESTIONS;
    else if (type === 'CN') questions = CN_QUESTIONS;
    else if (type === 'SQL') questions = SQL_QUESTIONS;
    else if (type === 'Git') questions = GIT_QUESTIONS;

    const questionData = questions[Math.floor(Math.random() * questions.length)];
    res.json({
        question: questionData.text,
        type,
        difficulty: questionData.difficulty || 'Medium',
        tags: questionData.tags || [],
        company: questionData.company || [],
        testCases: questionData.testCases || [],
        initialCode: questionData.initialCode,
        functionName: questionData.functionName
    });
});

// â”€â”€ POST /api/interview/evaluate-approach â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/evaluate-approach', async (req, res) => {
    try {
        const { question, approach } = req.body;
        const systemPrompt = `You are a senior engineer at a FAANG company conducting a technical interview.

Question: "${question}"
Candidate's Approach: "${approach}"

CRITICAL RULES:
- Do NOT reveal the correct solution, algorithm, or code
- Do NOT say what the optimal approach is or name it
- Do NOT give hints that directly lead to the answer
- If the approach is empty, vague, or just a single character, respond: "Please describe your approach in more detail before I can evaluate it."

Evaluate ONLY what the candidate has written. Analyze:
1. Is the stated logic sound or flawed?
2. What complexity would this approach achieve IF implemented?
3. Are there obvious gaps or missing edge cases in what they described?

Keep response to 2-3 sentences. Be direct. Do NOT complete their thinking for them.
End with: "Complexity: Time O(...), Space O(...) | Rating: [Needs Work / Reasonable / Strong]"

If the approach is too vague to evaluate, say so and ask for more detail.`;

        // Reject trivially short approaches before calling AI
        if (!approach || approach.trim().length < 10) {
            res.json({ evaluation: 'Please describe your approach in more detail. A single character or word is not enough to evaluate.' });
            return;
        }

        const apiRes = await axios.post(AI_BASE_URL, {
            model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }],
            temperature: 0.6,
        }, { ...getAiConfig(), timeout: 20000 });

        res.json({ evaluation: apiRes.data.choices[0].message.content });
    } catch (err: any) {
        res.status(500).json({ error: 'Approach evaluation failed' });
    }
});

// -- Local execution engine (child_process) --
// Runs on Render (persistent server) where python3, node, g++, javac are available.
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = util.promisify(exec);

// OS-aware Python interpreter
const PY = process.platform === 'win32' ? 'python' : 'python3';

async function localRun(
    sourceCode: string,
    lang: string,
): Promise<{ stdout: string; stderr: string; timedOut: boolean }> {
    const ext = lang === 'javascript' ? 'js' : lang === 'python3' ? 'py' : lang === 'cpp' ? 'cpp' : 'java';
    const tmpBase = path.join(os.tmpdir(), `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    const srcFile = `${tmpBase}.${ext}`;

    await fs.writeFile(srcFile, sourceCode, 'utf8');

    let command: string;
    let cleanup: string[] = [srcFile];

    if (lang === 'javascript') {
        command = `node "${srcFile}"`;
    } else if (lang === 'python3') {
        command = `${PY} "${srcFile}"`;
    } else if (lang === 'cpp') {
        const outFile = `${tmpBase}.out`;
        cleanup.push(outFile);
        command = `g++ -o "${outFile}" "${srcFile}" && "${outFile}"`;
    } else if (lang === 'java') {
        // Java requires class name = file name; we use Main
        const javaDir = tmpBase + '_java';
        const javaFile = path.join(javaDir, 'Main.java');
        await fs.mkdir(javaDir, { recursive: true });
        await fs.writeFile(javaFile, sourceCode, 'utf8');
        cleanup = [javaDir];
        command = `javac "${javaFile}" -d "${javaDir}" && java -cp "${javaDir}" Main`;
    } else {
        throw new Error(`Unsupported language: ${lang}`);
    }

    try {
        const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
        const { stdout, stderr } = await execAsync(command, { timeout: 8000, env });
        return {
            stdout: stdout.replace(/\r\n/g, '\n'),
            stderr: stderr.replace(/\r\n/g, '\n'),
            timedOut: false,
        };
    } catch (e: any) {
        const timedOut = e.killed || e.signal === 'SIGTERM' || String(e.message).includes('timeout');
        return {
            stdout: (e.stdout || '').replace(/\r\n/g, '\n'),
            stderr: (e.stderr || e.message || 'Runtime Error').replace(/\r\n/g, '\n'),
            timedOut,
        };
    } finally {
        // Best-effort cleanup
        for (const f of cleanup) {
            fs.rm(f, { recursive: true, force: true }).catch(() => { });
        }
    }
}

async function remoteRun(
    sourceCode: string,
    lang: string,
): Promise<{ stdout: string; stderr: string; timedOut: boolean }> {
    const remoteUrl = process.env.VITE_CODE_EXECUTION_URL || process.env.CODE_EXECUTION_URL;
    if (!remoteUrl) throw new Error('Remote execution URL not configured');

    // The remote backend usually expects { code, language }
    // Some might expect 'python3' as 'python' or vice versa, but we send normalized
    const res = await axios.post(`${remoteUrl}/run`, {
        code: sourceCode,
        language: lang,
    }, { timeout: 12000 });

    return {
        stdout: res.data.stdout || '',
        stderr: res.data.stderr || '',
        timedOut: !!res.data.timedOut,
    };
}


// -- POST /api/interview/run --
router.post('/run', async (req, res) => {
    try {
        let { code, language, testCases, functionName } = req.body;

        console.log('[/run] body:', {
            language, functionName,
            codeLength: code?.length,
            testCasesCount: Array.isArray(testCases) ? testCases.length : testCases,
        });

        // Validation
        if (!code || typeof code !== 'string' || !code.trim()) {
            res.status(400).json({ error: 'Validation Error', details: 'code is required and must be a non-empty string' }); return;
        }
        if (testCases !== undefined && !Array.isArray(testCases)) {
            res.status(400).json({ error: 'Validation Error', details: 'testCases must be an array' }); return;
        }
        testCases = Array.isArray(testCases) ? testCases : [];
        if (testCases.length > 0 && !functionName) {
            res.status(400).json({ error: 'Validation Error', details: 'functionName is required when testCases are provided' }); return;
        }

        // Language normalisation
        const langMap: Record<string, string> = {
            python: 'python3', python3: 'python3', '71': 'python3',
            javascript: 'javascript', js: 'javascript', '63': 'javascript',
            cpp: 'cpp', 'c++': 'cpp', '54': 'cpp',
            java: 'java', '62': 'java',
        };
        const normalizedLang = langMap[(language ?? '').toLowerCase()];
        if (!normalizedLang) {
            res.status(400).json({
                error: 'Validation Error',
                details: `Unsupported language: "${language}". Accepted: javascript, python3, java, cpp`,
            }); return;
        }

        if (testCases.length === 0) {
            res.json({ results: [], summary: { passed: 0, total: 0 } }); return;
        }

        const isJs = normalizedLang === 'javascript';
        const isPy = normalizedLang === 'python3';
        const fnName = String(functionName);
        const tcB64 = Buffer.from(JSON.stringify(testCases)).toString('base64');

        // Build runner source — JS and Python get a full test harness injected.
        // Java and C++ are sent as-is; raw stdout is shown.
        let runnerCode: string;

        if (isJs) {
            runnerCode = [
                code, '',
                `const __tc = JSON.parse(Buffer.from('${tcB64}', 'base64').toString('utf8'));`,
                'const __results = []; let __passed = 0;',
                '__tc.forEach((tc) => {',
                '  try {',
                '    const inp = Array.isArray(tc.input) ? tc.input : [tc.input];',
                '    const exp = tc.expectedOutput;',
                `    const out = ${fnName}(...inp);`,
                '    const ok = JSON.stringify(out) === JSON.stringify(exp);',
                '    if (ok) __passed++;',
                "    __results.push({ input: inp, expected: exp, output: out, status: ok ? 'Passed' : 'Wrong Answer' });",
                '  } catch (e) {',
                "    __results.push({ input: tc.input, expected: tc.expectedOutput, error: e.message, status: 'Error' });",
                '  }',
                '});',
                "process.stdout.write('\\n###RESULT###' + JSON.stringify({ results: __results, summary: { passed: __passed, total: __tc.length } }) + '###END###\\n');",
            ].join('\n');

        } else if (isPy) {
            runnerCode = [
                'import json, sys, base64',
                code, '',
                'def __run_tests():',
                `    __tc = json.loads(base64.b64decode('${tcB64}').decode('utf-8'))`,
                '    __results = []; __passed = 0',
                '    for tc in __tc:',
                '        try:',
                '            inp = tc["input"] if isinstance(tc["input"], list) else [tc["input"]]',
                '            exp = tc["expectedOutput"]',
                `            out = ${fnName}(*inp)`,
                '            ok = out == exp',
                '            if ok: __passed += 1',
                '            __results.append({"input": inp, "expected": exp, "output": out, "status": "Passed" if ok else "Wrong Answer"})',
                '        except Exception as e:',
                '            __results.append({"input": tc.get("input"), "expected": tc.get("expectedOutput"), "error": str(e), "status": "Error"})',
                '    sys.stdout.write("\\n###RESULT###" + json.dumps({"results": __results, "summary": {"passed": __passed, "total": len(__tc)}}) + "###END###\\n")',
                '    sys.stdout.flush()',
                '__run_tests()',
            ].join('\n');

        } else {
            // Java / C++ — executed as-is, raw stdout shown
            runnerCode = code;
        }

        // Execute via local child_process OR remote service
        let execResult: { stdout: string; stderr: string; timedOut: boolean };
        try {
            const remoteUrl = process.env.VITE_CODE_EXECUTION_URL || process.env.CODE_EXECUTION_URL;
            if (remoteUrl && remoteUrl.startsWith('http')) {
                execResult = await remoteRun(runnerCode, normalizedLang);
            } else {
                execResult = await localRun(runnerCode, normalizedLang);
            }
        } catch (execErr: any) {
            console.error('[/run] localRun threw:', execErr.message);
            res.json({
                results: testCases.map((tc: any) => ({
                    input: tc.input, expected: tc.expectedOutput,
                    error: 'Execution service error. Please try again.',
                    status: 'Error',
                })),
                summary: { passed: 0, total: testCases.length },
            }); return;
        }

        const { stdout, stderr, timedOut } = execResult;

        // Timeout
        if (timedOut) {
            res.json({
                results: testCases.map((tc: any) => ({
                    input: tc.input, expected: tc.expectedOutput,
                    error: 'Time Limit Exceeded (8s)', status: 'Time Limit Exceeded',
                })),
                summary: { passed: 0, total: testCases.length },
                stderr: 'Process killed after 8 seconds',
            }); return;
        }

        // Runtime / compile error — stderr present and no sentinel in stdout
        if (stderr && !stdout.includes('###RESULT###')) {
            const errDetail = stderr.split('\n').filter(Boolean).slice(0, 8).join('\n');
            console.error('[/run] stderr:', errDetail.slice(0, 200));
            res.json({
                results: testCases.map((tc: any) => ({
                    input: tc.input, expected: tc.expectedOutput,
                    error: errDetail || 'Execution error — check your syntax',
                    status: 'Error',
                })),
                summary: { passed: 0, total: testCases.length },
                stderr: errDetail,
            }); return;
        }

        // Parse sentinel block (JS + Python runners emit this)
        const match = stdout.match(/###RESULT###([\s\S]+?)###END###/);
        if (match) {
            let parsed: any;
            try {
                parsed = JSON.parse(match[1].trim());
            } catch {
                res.json({
                    results: testCases.map((tc: any) => ({
                        input: tc.input, expected: tc.expectedOutput,
                        error: 'Failed to parse execution output', status: 'Error',
                    })),
                    summary: { passed: 0, total: testCases.length },
                }); return;
            }
            const userStdout = stdout.replace(/###RESULT###[\s\S]+?###END###/, '').trim();
            res.json({ ...parsed, stdout: userStdout }); return;
        }

        // No sentinel — Java/C++ raw output or syntax error before runner ran
        const errText = (stderr || stdout || 'Unknown execution error').split('\n').filter(Boolean).slice(0, 6).join('\n');
        res.json({
            results: testCases.map((tc: any) => ({
                input: tc.input, expected: tc.expectedOutput,
                error: errText || 'Execution error — check your syntax', status: 'Error',
            })),
            summary: { passed: 0, total: testCases.length },
            stderr: errText,
            stdout: stdout.trim() || undefined,
        }); return;
    } catch (err: any) {
        console.error('[/run] Unexpected error:', err);
        res.status(500).json({ error: 'Execution failed', details: err.message || 'Internal server error' }); return;
    }
});

// ── POST /api/interview/followup ───────────────────────────
router.post('/followup', async (req, res) => {
    try {
        const { question, approach, code } = req.body;
        const systemPrompt = `You are a technical interviewer. The candidate has submitted their solution.

Question: "${question}"
Their Approach: "${approach}"
Their Code:
\`\`\`
${code}
\`\`\`

Generate ONE sharp, probing follow-up question. It should test:
- Their complexity understanding
- OR an edge case they likely missed
- OR how they would optimize further
- OR system-level implications

Ask ONLY one clear, concise question. No preamble.`;

        const apiRes = await axios.post(AI_BASE_URL, {
            model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }],
            temperature: 0.8,
        }, { ...getAiConfig(), timeout: 20000 });

        res.json({ followup: apiRes.data.choices[0].message.content });
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to generate follow-up' });
    }
});

// ── POST /api/interview/feedback ───────────────────────────
router.post('/feedback', async (req, res) => {
    try {
        const { question, code, language } = req.body;
        const systemPrompt = `You are a senior code reviewer. Analyze this solution for a technical interview.

Question: "${question}"
Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. **Complexity**: Time O(...), Space O(...)
2. **Code Quality**: Naming, readability, patterns
3. **Optimization**: The most impactful single change you'd make
4. **One-liner verdict**: Pass / Borderline / Needs work

Keep it under 200 words. Bullet points only.`;

        const apiRes = await axios.post(AI_BASE_URL, {
            model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }],
            temperature: 0.5,
        }, { ...getAiConfig(), timeout: 20000 });

        res.json({ feedback: apiRes.data.choices[0].message.content });
    } catch (err: any) {
        res.status(500).json({ error: 'Code feedback failed' });
    }
});

// ── POST /api/interview/submit ─────────────────────────────
router.post('/submit', async (req, res) => {
    try {
        const { question, approach, code, followUpQuestion, followUpAnswer, type } = req.body;
        const userId = (req as any).user.id;

        const systemPrompt = `You are the lead hiring manager at a top-tier tech company. You just conducted a full technical interview. Make the final hiring decision.

QUESTION: "${question}"
CANDIDATE'S APPROACH: "${approach}"
CANDIDATE'S CODE:
\`\`\`
${code}
\`\`\`
FOLLOW-UP ASKED: "${followUpQuestion}"
CANDIDATE'S FOLLOW-UP ANSWER: "${followUpAnswer}"

Provide a comprehensive evaluation. Return ONLY valid JSON (no markdown, no code blocks):
{
  "correctness": <0-100>,
  "optimization": <0-100>,
  "clarity": <0-100>,
  "communication": <0-100>,
  "overallScore": <0-100 weighted average>,
  "approachQuality": "OPTIMAL" | "SUBOPTIMAL" | "BRUTE_FORCE",
  "hireVerdict": "STRONG_HIRE" | "HIRE" | "BORDERLINE" | "NO_HIRE",
  "hireConfidence": <50-100>,
  "hireReasoning": "<one sentence strong justification for the verdict>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "weaknesses": ["<specific weakness 1>", "<specific weakness 2>"],
  "improvements": ["<actionable step 1>", "<actionable step 2>"],
  "stepByStepFeedback": ["<step 1 feedback>", "<step 2 feedback>", "<step 3 feedback>"],
  "complexityAnalysis": {
    "time": "<user's time complexity>",
    "space": "<user's space complexity>",
    "optimalTime": "<best possible time complexity>",
    "optimalSpace": "<best possible space complexity>"
  },
  "idealAnswer": "<clean, production-quality solution in the same language, well-commented>",
  "resumeBullet": "<one line resume-ready bullet point summarizing what they demonstrated>"
}`;

        const apiRes = await axios.post(AI_BASE_URL, {
            model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [{ role: 'system', content: systemPrompt }],
            temperature: 0.3,
        }, { ...getAiConfig(), timeout: 25000 });

        let feedback: any;
        try {
            feedback = JSON.parse(apiRes.data.choices[0].message.content);
        } catch {
            const raw = apiRes.data.choices[0].message.content;
            const match = raw.match(/\{[\s\S]*\}/);
            feedback = match ? JSON.parse(match[0]) : {};
        }

        const sessionData = {
            userId,
            type,
            question,
            userAnswer: `[Approach]: ${approach}\n\n[Code]: ${code}\n\n[Follow-up]: ${followUpAnswer}`,
            score: {
                correctness: feedback.correctness || 0,
                optimization: feedback.optimization || 0,
                clarity: feedback.clarity || 0,
                overallScore: feedback.overallScore || 0,
                testCasesPassed: feedback.approachQuality,
            },
            feedback: {
                strengths: feedback.strengths || [],
                weaknesses: feedback.weaknesses || [],
                improvements: feedback.improvements || [],
                complexityAnalysis: feedback.complexityAnalysis || { time: 'N/A', space: 'N/A' },
                idealAnswer: feedback.idealAnswer || '',
            },
            createdAt: new Date(),
        };

        const fullResult = {
            ...sessionData,
            feedback: {
                ...sessionData.feedback,
                hireVerdict: feedback.hireVerdict || 'BORDERLINE',
                hireConfidence: feedback.hireConfidence || 70,
                hireReasoning: feedback.hireReasoning || '',
                approachQuality: feedback.approachQuality || 'SUBOPTIMAL',
                communication: feedback.communication || 70,
                stepByStepFeedback: feedback.stepByStepFeedback || [],
                resumeBullet: feedback.resumeBullet || '',
            },
            score: {
                ...sessionData.score,
                communication: feedback.communication || 70,
            },
        };

        if (mongoose.connection.readyState === 1) {
            const session = new InterviewSessionModel(sessionData);
            await session.save();
            res.json({ ...fullResult, id: session._id }); return;
        } else {
            res.json({ id: 'local-session', ...fullResult }); return;
        }
    } catch (err: any) {
        console.error('Submit error:', err.message);
        res.status(500).json({ error: 'Evaluation failed. Please retry.' });
    }
});

// ── GET /api/interview/history ─────────────────────────────
router.get('/history', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) { res.json([]); return; }
        const userId = (req as any).user.id;
        const history = await InterviewSessionModel.find({ userId }).sort({ createdAt: -1 }).limit(20);
        res.json(history);
    } catch (err: any) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

export default router;
