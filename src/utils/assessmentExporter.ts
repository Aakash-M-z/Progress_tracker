/**
 * src/utils/assessmentExporter.ts
 * Export utilities for AlgoAscent Assessments (CSV, Excel, and Printable PDF)
 */

export interface ExportParticipant {
    name: string;
    email: string;
    status: string;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    accuracy: number;
    attemptedCount: number;
    correctCount: number;
    totalQuestions: number;
    timeTakenSeconds: number;
    tabSwitchCount: number;
    fullscreenExitCount: number;
    integrityScore: number;
    startedAt: string;
    submittedAt?: string;
}

export const assessmentExporter = {
    /**
     * Export participant results to CSV file
     */
    exportCSV(assessmentTitle: string, participants: ExportParticipant[]) {
        const headers = [
            'Candidate Name',
            'Email',
            'Status',
            'Score',
            'Max Score',
            'Percentage (%)',
            'Result',
            'Accuracy (%)',
            'Attempted Questions',
            'Correct Questions',
            'Total Questions',
            'Time Taken (Minutes)',
            'Tab Switches',
            'Fullscreen Exits',
            'Integrity Score (/100)',
            'Started At',
            'Submitted At'
        ];

        const rows = participants.map(p => [
            `"${(p.name || 'Candidate').replace(/"/g, '""')}"`,
            `"${(p.email || '').replace(/"/g, '""')}"`,
            p.status,
            p.score,
            p.maxScore,
            `${p.percentage}%`,
            p.passed ? 'PASSED' : 'FAILED',
            `${p.accuracy}%`,
            p.attemptedCount,
            p.correctCount,
            p.totalQuestions,
            (p.timeTakenSeconds / 60).toFixed(1),
            p.tabSwitchCount || 0,
            p.fullscreenExitCount || 0,
            p.integrityScore || 100,
            p.startedAt ? new Date(p.startedAt).toLocaleString() : '',
            p.submittedAt ? new Date(p.submittedAt).toLocaleString() : ''
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const sanitizedTitle = (assessmentTitle || 'Assessment').replace(/[^a-zA-Z0-9_-]/g, '_');
        link.setAttribute('href', url);
        link.setAttribute('download', `${sanitizedTitle}_Results_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Export to formatted Excel-compatible CSV spreadsheet
     */
    exportExcel(assessmentTitle: string, participants: ExportParticipant[]) {
        // Formatted with tab separators for native Excel multi-column rendering
        const headers = [
            'Candidate Name\tEmail\tStatus\tScore\tMax Score\tPercentage\tResult\tAccuracy\tAttempted\tCorrect\tTotal Questions\tTime Taken (Mins)\tTab Switches\tFullscreen Exits\tIntegrity Score\tStarted At\tSubmitted At'
        ];

        const rows = participants.map(p =>
            `${p.name || 'Candidate'}\t${p.email || ''}\t${p.status}\t${p.score}\t${p.maxScore}\t${p.percentage}%\t${p.passed ? 'PASSED' : 'FAILED'}\t${p.accuracy}%\t${p.attemptedCount}\t${p.correctCount}\t${p.totalQuestions}\t${(p.timeTakenSeconds / 60).toFixed(1)}\t${p.tabSwitchCount || 0}\t${p.fullscreenExitCount || 0}\t${p.integrityScore || 100}\t${p.startedAt ? new Date(p.startedAt).toLocaleString() : ''}\t${p.submittedAt ? new Date(p.submittedAt).toLocaleString() : ''}`
        );

        const content = '\uFEFF' + [headers[0], ...rows].join('\r\n');
        const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const sanitizedTitle = (assessmentTitle || 'Assessment').replace(/[^a-zA-Z0-9_-]/g, '_');
        link.setAttribute('href', url);
        link.setAttribute('download', `${sanitizedTitle}_Results_${new Date().toISOString().slice(0, 10)}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Generate and open printable assessment summary PDF report
     */
    printAssessmentSummaryPDF(assessment: any, summary: any, participants: ExportParticipant[], categoryPerf: any[]) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>AlgoAscent Assessment Report — ${assessment.title || 'Assessment'}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 30px; color: #111; line-height: 1.4; }
        .header { border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
        .logo { font-size: 24px; font-weight: 900; color: #D4AF37; }
        .title { font-size: 20px; font-weight: 800; margin: 0; color: #222; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
        .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; text-align: center; }
        .kpi-val { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 5px; }
        .kpi-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
        th { background: #0f172a; color: #fff; text-align: left; padding: 10px 12px; font-weight: 700; font-size: 11px; text-transform: uppercase; }
        td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .badge-pass { background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 999px; font-weight: 700; font-size: 10px; display: inline-block; }
        .badge-fail { background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 999px; font-weight: 700; font-size: 10px; display: inline-block; }
        .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        @media print {
            body { margin: 15px; }
            .kpi-card { border: 1px solid #cbd5e1; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo">◈ ALGOASCENT</div>
            <h1 class="title">${assessment.title || 'Assessment Report'}</h1>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">
                Duration: ${assessment.duration || 60} mins | Passing Score: ${assessment.passingScore || 60}% | Generated: ${new Date().toLocaleDateString()}
            </p>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
            Official Performance Audit
        </div>
    </div>

    <div class="kpi-grid">
        <div class="kpi-card">
            <div class="kpi-label">Total Participants</div>
            <div class="kpi-val">${summary.completed || 0} / ${summary.started || 0}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Average Score</div>
            <div class="kpi-val">${summary.averageScore || 0}%</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Highest Score</div>
            <div class="kpi-val" style="color: #16a34a;">${summary.highestScore || 0}%</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Completion Rate</div>
            <div class="kpi-val">${summary.completionRate || 0}%</div>
        </div>
    </div>

    ${categoryPerf && categoryPerf.length > 0 ? `
    <h3 style="font-size: 14px; margin: 20px 0 8px 0; color: #334155;">Category Performance Overview</h3>
    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        ${categoryPerf.map(c => `
            <div style="background: #f1f5f9; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;">
                <span style="color: #475569;">${c.category}:</span> <strong style="color: #0f172a;">${c.averagePercentage}%</strong>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <h3 style="font-size: 14px; margin: 20px 0 8px 0; color: #334155;">Candidate Results (${participants.length})</h3>
    <table>
        <thead>
            <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Result</th>
                <th>Accuracy</th>
                <th>Time (Mins)</th>
                <th>Integrity</th>
            </tr>
        </thead>
        <tbody>
            ${participants.map(p => `
                <tr>
                    <td><strong>${p.name || 'Candidate'}</strong></td>
                    <td>${p.email || '—'}</td>
                    <td>${p.score} / ${p.maxScore}</td>
                    <td><strong>${p.percentage}%</strong></td>
                    <td>
                        <span class="${p.passed ? 'badge-pass' : 'badge-fail'}">
                            ${p.passed ? 'PASSED' : 'FAILED'}
                        </span>
                    </td>
                    <td>${p.accuracy}%</td>
                    <td>${(p.timeTakenSeconds / 60).toFixed(1)}m</td>
                    <td>${p.integrityScore}/100</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        Generated by AlgoAscent Enterprise Assessment System • © ${new Date().getFullYear()} AlgoAscent. All rights reserved.
    </div>

    <script>
        window.onload = function() { window.print(); }
    </script>
</body>
</html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    },

    /**
     * Generate and print individual candidate scorecard PDF
     */
    printCandidateReportPDF(assessment: any, attempt: any, userProfile: any) {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const candidateName = userProfile?.name || attempt.userName || 'Candidate';
        const candidateEmail = userProfile?.email || attempt.userEmail || '';

        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Candidate Scorecard — ${candidateName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 35px; color: #111; line-height: 1.4; }
        .header { border-bottom: 2px solid #D4AF37; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
        .logo { font-size: 22px; font-weight: 900; color: #D4AF37; }
        .hero-banner { background: #0f172a; color: white; border-radius: 12px; padding: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
        .score-circle { width: 80px; height: 80px; border-radius: 50%; background: #D4AF37; color: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 900; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
        th { background: #1e293b; color: #fff; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
        .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        @media print { body { margin: 15px; } }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="logo">◈ ALGOASCENT</div>
            <h2 style="margin: 4px 0 0 0; font-size: 18px; color: #1e293b;">Candidate Assessment Scorecard</h2>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748b;">
            Assessment: <strong>${assessment.title || 'Technical Assessment'}</strong><br/>
            Date: ${new Date(attempt.submittedAt || attempt.startedAt).toLocaleDateString()}
        </div>
    </div>

    <div class="hero-banner">
        <div>
            <h3 style="margin: 0 0 6px 0; font-size: 18px; color: #fff;">${candidateName}</h3>
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">${candidateEmail}</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: ${attempt.passed ? '#4ade80' : '#f87171'}; font-weight: 700;">
                STATUS: ${attempt.passed ? 'PASSED (Meets Benchmark)' : 'NEEDS IMPROVEMENT'}
            </p>
        </div>
        <div class="score-circle">
            <div style="font-size: 22px; line-height: 1;">${attempt.percentage}%</div>
            <div style="font-size: 10px; text-transform: uppercase;">Score</div>
        </div>
    </div>

    <div class="grid-2">
        <div class="box">
            <h4 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #475569;">Performance Summary</h4>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Score Earned:</strong> ${attempt.score} / ${attempt.maxScore || assessment.totalPoints} points</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Accuracy:</strong> ${attempt.accuracy}%</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Questions Solved:</strong> ${attempt.correctCount} / ${attempt.totalQuestions}</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Time Taken:</strong> ${(attempt.timeTakenSeconds / 60).toFixed(1)} minutes</p>
        </div>
        <div class="box">
            <h4 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; color: #475569;">Integrity Audit</h4>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Integrity Score:</strong> ${attempt.integrityScore || 100} / 100</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Tab Switches:</strong> ${attempt.tabSwitchCount || 0}</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Fullscreen Exits:</strong> ${attempt.fullscreenExitCount || 0}</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Assessment Window:</strong> Authoritative Server Verified</p>
        </div>
    </div>

    <div class="footer">
        Verified AlgoAscent Assessment Scorecard • Confidential Evaluation Document
    </div>

    <script>
        window.onload = function() { window.print(); }
    </script>
</body>
</html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    }
};
