import * as XLSX from 'xlsx';
import type { Test, Question } from '@/types';

// ==========================================
// Types
// ==========================================

export interface ParsedTestData {
  test: {
    title: string;
    subject: string;
    chapter?: string;
    description?: string;
    timeLimit: number;
    coinFee: number;
    isPublic: boolean;
  };
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];
}

export interface ValidationError {
  row?: number;
  message: string;
}

// ==========================================
// Parse
// ==========================================

const METADATA_KEYS: Record<string, keyof ParsedTestData['test']> = {
  'test title': 'title',
  'subject': 'subject',
  'chapter': 'chapter',
  'description': 'description',
  'time limit': 'timeLimit',
  'coin fee': 'coinFee',
  'visibility': 'isPublic',
};

const LETTER_TO_INDEX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

function cellValue(cell: unknown): string {
  if (cell === undefined || cell === null) return '';
  return String(cell).trim();
}

export async function parseXLSX(file: File): Promise<ParsedTestData> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('No sheets found in the file');

  const sheet = workbook.Sheets[sheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  const errors: string[] = [];

  // Parse metadata rows (key-value pairs at the top)
  const meta: Record<string, string> = {};
  let questionHeaderRow = -1;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const first = cellValue(row[0]).toLowerCase();

    // Check if this row is the question header
    if (first === '#' || first === 'question' || (first === '' && cellValue(row[1]).toLowerCase() === 'question')) {
      questionHeaderRow = i;
      break;
    }

    // Parse metadata key-value
    const key = cellValue(row[0]).toLowerCase();
    const val = cellValue(row[1]);
    if (key && METADATA_KEYS[key]) {
      meta[METADATA_KEYS[key]] = val;
    }
  }

  // Validate metadata
  if (!meta.title) errors.push('Test Title is required in the metadata section');
  if (!meta.subject) errors.push('Subject is required in the metadata section');

  const timeLimit = Number(meta.timeLimit) || 30;
  if (!Number.isInteger(timeLimit) || timeLimit < 1 || timeLimit > 60) {
    errors.push('Time Limit must be an integer between 1 and 60');
  }

  const coinFee = Number(meta.coinFee) || 0;
  const isPublic = (meta.isPublic || '').toLowerCase() !== 'private';

  if (questionHeaderRow === -1) {
    errors.push('Could not find question header row (expected row starting with "#" or "Question")');
    throw new Error(errors.join('\n'));
  }

  // Parse questions starting after header row
  const questions: ParsedTestData['questions'] = [];

  for (let i = questionHeaderRow + 1; i < rows.length; i++) {
    const row = rows[i];
    // Skip empty rows
    const questionText = cellValue(row[1]) || cellValue(row[0]);
    if (!questionText) continue;

    // Determine column layout based on header
    const headerRow = rows[questionHeaderRow];
    const hasNumberCol = cellValue(headerRow[0]).toLowerCase() === '#';
    const offset = hasNumberCol ? 1 : 0;

    const qText = cellValue(row[offset]);
    const optA = cellValue(row[offset + 1]);
    const optB = cellValue(row[offset + 2]);
    const optC = cellValue(row[offset + 3]);
    const optD = cellValue(row[offset + 4]);
    const optE = cellValue(row[offset + 5]);
    const correctLetter = cellValue(row[offset + 6]).toUpperCase();
    const explanation = cellValue(row[offset + 7]);

    if (!qText) continue;

    // Build options (only non-empty)
    const options: string[] = [optA, optB, optC, optD, optE].filter(o => o !== '');

    const qNum = questions.length + 1;

    if (options.length < 2) {
      errors.push(`Q${qNum}: Must have at least 2 options`);
      continue;
    }
    if (options.length > 5) {
      errors.push(`Q${qNum}: Cannot have more than 5 options`);
      continue;
    }

    const correctIndex = LETTER_TO_INDEX[correctLetter];
    if (correctIndex === undefined) {
      errors.push(`Q${qNum}: Correct Answer must be a letter (A-E), got "${correctLetter}"`);
      continue;
    }
    if (correctIndex >= options.length) {
      errors.push(`Q${qNum}: Correct Answer "${correctLetter}" is out of range (only ${options.length} options)`);
      continue;
    }

    questions.push({
      question: qText,
      options,
      correctAnswer: correctIndex,
      explanation: explanation || undefined,
    });
  }

  if (questions.length === 0) {
    errors.push('No valid questions found in the file');
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return {
    test: {
      title: meta.title!,
      subject: meta.subject!,
      chapter: meta.chapter || undefined,
      description: meta.description || undefined,
      timeLimit,
      coinFee,
      isPublic,
    },
    questions,
  };
}

// ==========================================
// Generate (single test)
// ==========================================

function buildSheetData(test: Test, questions: Question[]): unknown[][] {
  const rows: unknown[][] = [];

  // Metadata
  rows.push(['Test Title', test.title]);
  rows.push(['Subject', test.subject]);
  rows.push(['Chapter', test.chapter || '']);
  rows.push(['Description', test.description || '']);
  rows.push(['Time Limit', test.timeLimit]);
  rows.push(['Coin Fee', test.coinFee]);
  rows.push(['Visibility', test.isPublic ? 'Public' : 'Private']);
  rows.push([]); // blank row

  // Question header
  rows.push(['#', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Option E', 'Correct Answer', 'Explanation']);

  // Questions
  questions.forEach((q, i) => {
    const opts = q.options || [];
    const correctLetter = String.fromCharCode(65 + q.correctAnswer);
    rows.push([
      i + 1,
      q.question,
      opts[0] || '',
      opts[1] || '',
      opts[2] || '',
      opts[3] || '',
      opts[4] || '',
      correctLetter,
      q.explanation || '',
    ]);
  });

  return rows;
}

function sanitizeSheetName(name: string): string {
  // Excel sheet names: max 31 chars, no special chars: \ / ? * [ ]
  return name.replace(/[\\/?*[\]]/g, '').substring(0, 31) || 'Test';
}

export function generateTestXLSX(test: Test, questions: Question[]): void {
  const wb = XLSX.utils.book_new();
  const data = buildSheetData(test, questions);
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 4 },  // #
    { wch: 50 }, // Question
    { wch: 25 }, // Option A
    { wch: 25 }, // Option B
    { wch: 25 }, // Option C
    { wch: 25 }, // Option D
    { wch: 25 }, // Option E
    { wch: 15 }, // Correct Answer
    { wch: 40 }, // Explanation
  ];

  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(test.title));
  XLSX.writeFile(wb, `${test.title.replace(/[^a-zA-Z0-9 ]/g, '')}.xlsx`);
}

// ==========================================
// Generate (bulk)
// ==========================================

export function generateBulkTestXLSX(testsWithQuestions: { test: Test; questions: Question[] }[]): void {
  const wb = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  testsWithQuestions.forEach(({ test, questions }) => {
    const data = buildSheetData(test, questions);
    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
      { wch: 4 },
      { wch: 50 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 40 },
    ];

    let name = sanitizeSheetName(test.title);
    // Ensure unique sheet names
    let counter = 2;
    const baseName = name;
    while (usedNames.has(name)) {
      name = `${baseName.substring(0, 28)}_${counter}`;
      counter++;
    }
    usedNames.add(name);

    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  XLSX.writeFile(wb, 'tests-export.xlsx');
}

// ==========================================
// Template
// ==========================================

export function generateTemplateXLSX(): void {
  const wb = XLSX.utils.book_new();
  const rows: unknown[][] = [
    ['Test Title', 'My Test Name'],
    ['Subject', 'Physics'],
    ['Chapter', ''],
    ['Description', ''],
    ['Time Limit', 30],
    ['Coin Fee', 0],
    ['Visibility', 'Public'],
    [],
    ['#', 'Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Option E', 'Correct Answer', 'Explanation'],
    [1, 'Sample question?', 'Option 1', 'Option 2', 'Option 3', 'Option 4', '', 'A', 'Explanation here'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 50 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 25 },
    { wch: 15 },
    { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, 'test-import-template.xlsx');
}
