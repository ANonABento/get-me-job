/**
 * Google Docs Operations
 *
 * Create resumes in Docs, interview prep notes
 */

import { google } from "googleapis";
import { createGoogleClient } from "./client";
import { getOrCreateSubfolder } from "./drive";

export interface DocResult {
  docId: string;
  docUrl: string;
}

export interface InterviewQuestion {
  question: string;
  suggestedAnswer?: string;
}

/**
 * Create a new Google Doc
 */
export async function createDoc(
  title: string,
  content?: string,
  folderId?: string
): Promise<DocResult | null> {
  try {
    const auth = await createGoogleClient();
    const drive = google.drive({ version: "v3", auth });
    const docs = google.docs({ version: "v1", auth });

    // Create empty doc in Drive
    const file = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: "application/vnd.google-apps.document",
        parents: folderId ? [folderId] : undefined,
      },
      fields: "id, webViewLink",
    });

    const docId = file.data.id!;
    const docUrl = file.data.webViewLink!;

    // Add content if provided
    if (content) {
      await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: content,
              },
            },
          ],
        },
      });
    }

    return { docId, docUrl };
  } catch (error) {
    console.error("Failed to create doc:", error);
    return null;
  }
}

/**
 * Get document content
 */
export async function getDocContent(docId: string): Promise<string | null> {
  try {
    const auth = await createGoogleClient();
    const docs = google.docs({ version: "v1", auth });

    const response = await docs.documents.get({
      documentId: docId,
    });

    // Extract text content from document
    const content = response.data.body?.content || [];
    let text = "";

    for (const element of content) {
      if (element.paragraph?.elements) {
        for (const elem of element.paragraph.elements) {
          if (elem.textRun?.content) {
            text += elem.textRun.content;
          }
        }
      }
    }

    return text;
  } catch (error) {
    console.error("Failed to get doc content:", error);
    return null;
  }
}

/**
 * Append content to a document
 */
export async function appendToDoc(
  docId: string,
  content: string
): Promise<boolean> {
  try {
    const auth = await createGoogleClient();
    const docs = google.docs({ version: "v1", auth });

    // Get document to find end index
    const doc = await docs.documents.get({ documentId: docId });
    const endIndex = doc.data.body?.content?.slice(-1)[0]?.endIndex || 1;

    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: endIndex - 1 },
              text: content,
            },
          },
        ],
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to append to doc:", error);
    return false;
  }
}

/**
 * Create interview prep notes document
 */
export async function createInterviewPrepDoc(
  jobTitle: string,
  company: string,
  questions: InterviewQuestion[]
): Promise<DocResult | null> {
  const folderId = await getOrCreateSubfolder("Company Research");

  const questionsSection = questions
    .map(
      (q, i) => `
${i + 1}. ${q.question}

   Suggested approach:
   ${q.suggestedAnswer || "[Your notes]"}

   Your answer:
   [Write your answer here]

`
    )
    .join("\n");

  const content = `Interview Prep: ${jobTitle} at ${company}
${"=".repeat(50)}

ABOUT THE COMPANY
-----------------
[Research notes about ${company}]


QUESTIONS TO PREPARE
--------------------
${questionsSection}

QUESTIONS TO ASK
----------------
1. [Your question]
2. [Your question]
3. [Your question]


POST-INTERVIEW NOTES
--------------------
Date:
Interviewer(s):
Overall impression:
Follow-up items:
`;

  return createDoc(
    `Interview Prep - ${company} - ${jobTitle}`,
    content,
    folderId
  );
}

/**
 * Export resume content to a Google Doc
 */
export async function exportResumeToDoc(
  title: string,
  resumeContent: string
): Promise<DocResult | null> {
  const folderId = await getOrCreateSubfolder("Resumes");
  return createDoc(title, resumeContent, folderId);
}

/**
 * Export cover letter to a Google Doc
 */
export async function exportCoverLetterToDoc(
  company: string,
  role: string,
  coverLetterContent: string
): Promise<DocResult | null> {
  const folderId = await getOrCreateSubfolder("Cover Letters");
  return createDoc(
    `Cover Letter - ${company} - ${role}`,
    coverLetterContent,
    folderId
  );
}

/**
 * Create company research document
 */
export async function createCompanyResearchDoc(
  company: string,
  content: {
    overview?: string;
    culture?: string;
    products?: string;
    competitors?: string;
    news?: string;
    interviewTips?: string;
  }
): Promise<DocResult | null> {
  const folderId = await getOrCreateSubfolder("Company Research");

  const docContent = `Company Research: ${company}
${"=".repeat(50)}

COMPANY OVERVIEW
----------------
${content.overview || "[Add company overview]"}


CULTURE & VALUES
----------------
${content.culture || "[Add culture notes]"}


PRODUCTS & SERVICES
-------------------
${content.products || "[Add products/services]"}


COMPETITORS
-----------
${content.competitors || "[Add competitor analysis]"}


RECENT NEWS
-----------
${content.news || "[Add recent news]"}


INTERVIEW TIPS
--------------
${content.interviewTips || "[Add interview tips]"}
`;

  return createDoc(`Research - ${company}`, docContent, folderId);
}
