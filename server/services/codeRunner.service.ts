/**
 * server/services/codeRunner.service.ts
 * Isolated Code Runner Service for Assessments and Interviews
 */

import vm from 'vm';
import axios from 'axios';

const REMOTE_CODE_EXEC_BASE = process.env.CODE_EXECUTION_URL || process.env.VITE_CODE_EXECUTION_URL || 'https://code-execution-backend-qq01.onrender.com';

export interface TestCaseResult {
    index?: number;
    input: any;
    expected: any;
    output?: any;
    error?: string;
    passed: boolean;
    status: 'Passed' | 'Failed' | 'Error';
}

export interface LocalExecutionResult {
    stdout: string;
    stderr: string;
    results: TestCaseResult[];
    passedCount: number;
    totalCount: number;
    runtimeMs: number;
}

/**
 * Execute JavaScript safely in an isolated Node VM context
 */
export function runJavaScriptLocally(
    code: string,
    testCases: any[],
    functionName: string = 'solution'
): LocalExecutionResult {
    const startTime = Date.now();
    const stdoutLogs: string[] = [];
    const stderrLogs: string[] = [];
    const results: TestCaseResult[] = [];

    const sandbox = {
        console: {
            log: (...args: any[]) => stdoutLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            error: (...args: any[]) => stderrLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            warn: (...args: any[]) => stderrLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        },
        Math,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Date,
        RegExp,
        JSON,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        Map,
        Set,
        WeakMap,
        WeakSet,
        Buffer,
    };

    const context = vm.createContext(sandbox);

    try {
        // Run user code in sandbox
        vm.runInContext(code, context, { timeout: 2000 });

        // Find candidate function
        let candidateFn: any = (sandbox as any)[functionName];
        if (typeof candidateFn !== 'function') {
            // Check if function was defined as const or function declaration
            const keys = Object.keys(sandbox).filter(k => typeof (sandbox as any)[k] === 'function');
            const userFnKey = keys.find(k => !['log', 'error', 'warn', 'parseInt', 'parseFloat', 'isNaN', 'isFinite'].includes(k));
            if (userFnKey) {
                candidateFn = (sandbox as any)[userFnKey];
            }
        }

        if (typeof candidateFn !== 'function') {
            throw new Error(`Function "${functionName}" is not defined.`);
        }

        // Run each testcase
        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const inp = Array.isArray(tc.input) ? tc.input : [tc.input];
            const expected = tc.expectedOutput !== undefined ? tc.expectedOutput : tc.expected;

            try {
                // Clone inputs to avoid mutation between test runs
                const clonedInp = JSON.parse(JSON.stringify(inp));
                const out = candidateFn(...clonedInp);

                const passed = JSON.stringify(out) === JSON.stringify(expected);
                results.push({
                    index: i + 1,
                    input: inp,
                    expected,
                    output: out,
                    passed,
                    status: passed ? 'Passed' : 'Failed'
                });
            } catch (err: any) {
                results.push({
                    index: i + 1,
                    input: inp,
                    expected,
                    error: err.message || 'Runtime Exception',
                    passed: false,
                    status: 'Error'
                });
            }
        }
    } catch (scriptErr: any) {
        stderrLogs.push(scriptErr.message || 'Syntax / Script Execution Error');
        for (let i = 0; i < testCases.length; i++) {
            results.push({
                index: i + 1,
                input: testCases[i]?.input,
                expected: testCases[i]?.expectedOutput ?? testCases[i]?.expected,
                error: scriptErr.message,
                passed: false,
                status: 'Error'
            });
        }
    }

    const passedCount = results.filter(r => r.passed).length;
    const runtimeMs = Date.now() - startTime;

    return {
        stdout: stdoutLogs.join('\n'),
        stderr: stderrLogs.join('\n'),
        results,
        passedCount,
        totalCount: testCases.length,
        runtimeMs
    };
}

/**
 * Execute any language code via local VM or remote execution backend
 */
export async function executeCodeSolution(
    code: string,
    language: string,
    functionName: string,
    testCases: any[]
): Promise<LocalExecutionResult> {
    const langNorm = (language || 'javascript').toLowerCase();

    // 1. Fast local JS VM execution
    if (langNorm === 'javascript' || langNorm === 'js') {
        return runJavaScriptLocally(code, testCases, functionName);
    }

    // 2. Remote execution engine for Python, Java, C++
    const startTime = Date.now();
    try {
        const langParam = langNorm === 'python' ? 'python3' : langNorm;
        const res = await axios.post(`${REMOTE_CODE_EXEC_BASE}/run`, {
            code,
            language: langParam,
            testCases,
            functionName: functionName || 'solution'
        }, { timeout: 15000 });

        const data = res.data;
        const runtimeMs = Date.now() - startTime;

        if (data && Array.isArray(data.results)) {
            const results: TestCaseResult[] = data.results.map((r: any, idx: number) => ({
                index: idx + 1,
                input: r.input || testCases[idx]?.input,
                expected: r.expected || testCases[idx]?.expectedOutput,
                output: r.output,
                error: r.error,
                passed: r.status === 'Passed' || !!r.passed,
                status: (r.status === 'Passed' || !!r.passed) ? 'Passed' : 'Failed'
            }));

            const passedCount = results.filter(r => r.passed).length;

            return {
                stdout: data.stdout || '',
                stderr: data.stderr || '',
                results,
                passedCount,
                totalCount: testCases.length,
                runtimeMs
            };
        }

        return {
            stdout: data?.stdout || '',
            stderr: data?.stderr || 'Execution failed',
            results: testCases.map((tc, idx) => ({
                index: idx + 1,
                input: tc.input,
                expected: tc.expectedOutput,
                error: data?.stderr || 'Execution failed',
                passed: false,
                status: 'Error'
            })),
            passedCount: 0,
            totalCount: testCases.length,
            runtimeMs
        };
    } catch (err: any) {
        return {
            stdout: '',
            stderr: 'Execution service timed out or offline.',
            results: testCases.map((tc, idx) => ({
                index: idx + 1,
                input: tc.input,
                expected: tc.expectedOutput,
                error: 'Execution service offline',
                passed: false,
                status: 'Error'
            })),
            passedCount: 0,
            totalCount: testCases.length,
            runtimeMs: 0
        };
    }
}
