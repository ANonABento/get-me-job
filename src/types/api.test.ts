import { describe, it, expect, expectTypeOf } from "vitest";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiValidationErrorResponse,
  ApiResponse,
  ProfileResponse,
  ProfileUpdateResponse,
  ProfileDeleteResponse,
  JobsResponse,
  JobResponse,
  JobDeleteResponse,
  BankEntriesResponse,
  BankEntryUpdateResponse,
  BankDocumentDeleteResponse,
  UploadResponse,
  ParseResponse,
  InterviewStartResponse,
  InterviewAnswerResponse,
  InterviewFollowupResponse,
  InterviewSessionAnswerResponse,
  CoverLetterGenerateResponse,
  CoverLetterSaveResponse,
  SettingsResponse,
  SettingsUpdateResponse,
  MessageResponse,
  DeleteResponse,
  EmailGenerateResponse,
  CalendarFeedUrlResponse,
  ExtensionAuthResponse,
  ExtensionAuthVerifyResponse,
  NegotiationScript,
  SalaryOffersResponse,
  GoogleAuthStatusResponse,
  GoogleDocsCreateResponse,
  GoogleGmailSendResponse,
  NotificationsResponse,
  ResumeStatsResponse,
  ResumeCompareResponse,
  ImportJobsBulkResponse,
  LearningPathsResponse,
  CompanyResearchResponse,
  TemplateAnalyzeResponse,
} from "./api";

describe("API Types", () => {
  describe("ApiSuccessResponse", () => {
    it("should accept a generic data type", () => {
      const response: ApiSuccessResponse<{ name: string }> = {
        success: true,
        data: { name: "test" },
      };
      expect(response.success).toBe(true);
      expect(response.data.name).toBe("test");
    });

    it("should work with array data", () => {
      const response: ApiSuccessResponse<string[]> = {
        success: true,
        data: ["a", "b"],
      };
      expect(response.data).toHaveLength(2);
    });
  });

  describe("ApiErrorResponse", () => {
    it("should require error field", () => {
      const response: ApiErrorResponse = { error: "Something went wrong" };
      expect(response.error).toBe("Something went wrong");
    });

    it("should allow optional details", () => {
      const response: ApiErrorResponse = {
        error: "Bad request",
        details: { field: "name" },
      };
      expect(response.details).toEqual({ field: "name" });
    });
  });

  describe("ApiValidationErrorResponse", () => {
    it("should have error and errors array", () => {
      const response: ApiValidationErrorResponse = {
        error: "Validation failed",
        errors: [{ field: "email", message: "Required" }],
      };
      expect(response.errors).toHaveLength(1);
      expect(response.errors[0].field).toBe("email");
    });
  });

  describe("ApiResponse union", () => {
    it("should accept success response", () => {
      const response: ApiResponse<string> = {
        success: true,
        data: "hello",
      };
      expect(response).toBeDefined();
    });

    it("should accept error response", () => {
      const response: ApiResponse<string> = { error: "fail" };
      expect(response).toBeDefined();
    });

    it("should accept validation error response", () => {
      const response: ApiResponse<string> = {
        error: "Validation failed",
        errors: [{ field: "name", message: "too short" }],
      };
      expect(response).toBeDefined();
    });
  });

  describe("Profile types", () => {
    it("ProfileResponse should have nullable profile", () => {
      const response: ProfileResponse = { profile: null };
      expect(response.profile).toBeNull();
    });

    it("ProfileUpdateResponse should have success and profile", () => {
      const response: ProfileUpdateResponse = {
        success: true,
        profile: {
          id: "1",
          contact: { name: "Test" },
          experiences: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      };
      expect(response.success).toBe(true);
      expect(response.profile.id).toBe("1");
    });

    it("ProfileDeleteResponse should have success", () => {
      const response: ProfileDeleteResponse = { success: true };
      expect(response.success).toBe(true);
    });
  });

  describe("Job types", () => {
    it("JobsResponse should have jobs array", () => {
      const response: JobsResponse = { jobs: [] };
      expect(response.jobs).toEqual([]);
    });

    it("JobDeleteResponse should have success", () => {
      const response: JobDeleteResponse = { success: true };
      expect(response.success).toBe(true);
    });
  });

  describe("Bank types", () => {
    it("BankEntriesResponse should have entries array", () => {
      const response: BankEntriesResponse = { entries: [] };
      expect(response.entries).toEqual([]);
    });

    it("BankEntryUpdateResponse should have success", () => {
      const response: BankEntryUpdateResponse = { success: true };
      expect(response.success).toBe(true);
    });

    it("BankDocumentDeleteResponse should have chunksDeleted", () => {
      const response: BankDocumentDeleteResponse = {
        success: true,
        chunksDeleted: 5,
      };
      expect(response.chunksDeleted).toBe(5);
    });
  });

  describe("Upload types", () => {
    it("UploadResponse should have document info", () => {
      const response: UploadResponse = {
        success: true,
        document: {
          id: "abc",
          filename: "resume.pdf",
          type: "resume",
          size: 1024,
          extractedText: "text...",
        },
      };
      expect(response.document.id).toBe("abc");
    });

    it("UploadResponse should allow optional parsing info", () => {
      const response: UploadResponse = {
        success: true,
        document: {
          id: "abc",
          filename: "resume.pdf",
          type: "resume",
          size: 1024,
          extractedText: null,
        },
        parsing: {
          confidence: 0.95,
          sectionsDetected: ["experience", "education"],
          llmUsed: false,
          llmSectionsCount: 0,
          warnings: [],
        },
      };
      expect(response.parsing?.confidence).toBe(0.95);
    });
  });

  describe("Interview types", () => {
    it("InterviewStartResponse should have questions and difficulty", () => {
      const response: InterviewStartResponse = {
        questions: [
          { id: "q1", question: "Tell me about yourself", category: "behavioral", difficulty: "medium" },
        ],
        difficulty: "medium",
      };
      expect(response.questions).toHaveLength(1);
    });

    it("InterviewAnswerResponse should have feedback with score", () => {
      const response: InterviewAnswerResponse = {
        feedback: {
          score: 8,
          strengths: ["Clear structure"],
          improvements: ["Add more detail"],
        },
      };
      expect(response.feedback.score).toBe(8);
    });

    it("InterviewFollowupResponse should have followUpQuestion", () => {
      const response: InterviewFollowupResponse = {
        success: true,
        followUpQuestion: "Can you elaborate?",
        reason: "Vague answer",
        suggestedFocus: "specifics",
      };
      expect(response.followUpQuestion).toBeTruthy();
    });

    it("InterviewSessionAnswerResponse should have isComplete flag", () => {
      const response: InterviewSessionAnswerResponse = {
        answer: "My answer",
        feedback: { score: 7, strengths: [], improvements: [] },
        isComplete: false,
      };
      expect(response.isComplete).toBe(false);
    });
  });

  describe("Cover letter types", () => {
    it("CoverLetterGenerateResponse should have content and metadata", () => {
      const response: CoverLetterGenerateResponse = {
        success: true,
        coverLetter: "Dear Hiring Manager...",
        highlights: ["5 years experience", "React expert"],
        usedLLM: true,
      };
      expect(response.highlights).toHaveLength(2);
    });

    it("CoverLetterSaveResponse should have version info", () => {
      const response: CoverLetterSaveResponse = {
        success: true,
        coverLetter: {
          id: "cl1",
          jobId: "j1",
          content: "Dear...",
          createdAt: "2024-01-01",
        },
      };
      expect(response.coverLetter.id).toBe("cl1");
    });
  });

  describe("Settings types", () => {
    it("SettingsResponse should have llm config", () => {
      const response: SettingsResponse = {
        llm: { provider: "openai", model: "gpt-4" },
      };
      expect(response.llm.provider).toBe("openai");
    });

    it("SettingsUpdateResponse should have success and message", () => {
      const response: SettingsUpdateResponse = {
        success: true,
        message: "Settings updated",
      };
      expect(response.message).toBeTruthy();
    });
  });

  describe("Email types", () => {
    it("EmailGenerateResponse should have email and usedLLM flag", () => {
      const response: EmailGenerateResponse = {
        success: true,
        email: {
          type: "follow_up",
          subject: "Following up",
          body: "Hi...",
          placeholders: [],
        },
        usedLLM: true,
      };
      expect(response.email.type).toBe("follow_up");
    });
  });

  describe("Calendar types", () => {
    it("CalendarFeedUrlResponse should have URLs", () => {
      const response: CalendarFeedUrlResponse = {
        feedUrl: "https://example.com/feed",
        webcalUrl: "webcal://example.com/feed",
        type: "ics",
      };
      expect(response.feedUrl).toContain("http");
    });
  });

  describe("Extension types", () => {
    it("ExtensionAuthResponse should have token and expiry", () => {
      const response: ExtensionAuthResponse = {
        token: "abc123",
        expiresAt: "2024-12-31",
      };
      expect(response.token).toBeTruthy();
    });

    it("ExtensionAuthVerifyResponse should have validity info", () => {
      const response: ExtensionAuthVerifyResponse = {
        valid: true,
        userId: "user1",
        expiresAt: "2024-12-31",
      };
      expect(response.valid).toBe(true);
    });
  });

  describe("Salary types", () => {
    it("NegotiationScript should have structured script", () => {
      const response: NegotiationScript = {
        script: {
          opening: "Thank you for the offer...",
          valuePoints: ["Led team of 10"],
          theAsk: "I would like $150k",
          pushbackResponses: { budget: "I understand budgets..." },
          close: "I look forward to...",
        },
        source: "llm",
      };
      expect(response.script.valuePoints).toHaveLength(1);
    });

    it("SalaryOffersResponse should have offers and stats", () => {
      const response: SalaryOffersResponse = { offers: [], stats: {} };
      expect(response.offers).toEqual([]);
    });
  });

  describe("Google integration types", () => {
    it("GoogleAuthStatusResponse should have connected flag", () => {
      const response: GoogleAuthStatusResponse = {
        connected: true,
        status: "active",
      };
      expect(response.connected).toBe(true);
    });

    it("GoogleDocsCreateResponse should have doc URL", () => {
      const response: GoogleDocsCreateResponse = {
        success: true,
        docId: "doc1",
        docUrl: "https://docs.google.com/...",
      };
      expect(response.docUrl).toContain("google");
    });

    it("GoogleGmailSendResponse should have message ID", () => {
      const response: GoogleGmailSendResponse = {
        success: true,
        messageId: "msg1",
      };
      expect(response.messageId).toBe("msg1");
    });
  });

  describe("Notification types", () => {
    it("NotificationsResponse should have notifications and unread count", () => {
      const response: NotificationsResponse = {
        notifications: [],
        unreadCount: 0,
      };
      expect(response.unreadCount).toBe(0);
    });
  });

  describe("Resume types", () => {
    it("ResumeStatsResponse should have stats and total", () => {
      const response: ResumeStatsResponse = {
        stats: [],
        totalTracked: 10,
      };
      expect(response.totalTracked).toBe(10);
    });

    it("ResumeCompareResponse should have comparison data", () => {
      const response: ResumeCompareResponse = {
        comparison: { added: ["skills"], removed: [], modified: ["summary"] },
        sectionScores: { skills: 0.8 },
        before: {},
        after: {},
      };
      expect(response.comparison.added).toContain("skills");
    });
  });

  describe("Import types", () => {
    it("ImportJobsBulkResponse should have import stats", () => {
      const response: ImportJobsBulkResponse = {
        success: true,
        imported: 5,
        skipped: 1,
        errors: ["Row 3: missing title"],
      };
      expect(response.imported).toBe(5);
      expect(response.errors).toHaveLength(1);
    });
  });

  describe("Learning types", () => {
    it("LearningPathsResponse should have paths and insights", () => {
      const response: LearningPathsResponse = {
        paths: [
          {
            skill: "TypeScript",
            resources: [
              { title: "TS Handbook", type: "docs", estimatedWeeks: 2 },
            ],
          },
        ],
        totalEstimatedWeeks: 2,
        quickWins: ["TypeScript"],
        strategicSkills: ["System Design"],
        insights: {},
      };
      expect(response.paths).toHaveLength(1);
      expect(response.quickWins).toContain("TypeScript");
    });
  });

  describe("Research types", () => {
    it("CompanyResearchResponse should have company info", () => {
      const response: CompanyResearchResponse = {
        companyName: "Acme Corp",
        overview: "Tech company",
        fromCache: false,
      };
      expect(response.companyName).toBe("Acme Corp");
      expect(response.fromCache).toBe(false);
    });
  });

  describe("Template types", () => {
    it("TemplateAnalyzeResponse should have analysis and LLM flag", () => {
      const response: TemplateAnalyzeResponse = {
        analyzed: { colors: ["blue"], fonts: ["Arial"] },
        usedLLM: true,
      };
      expect(response.usedLLM).toBe(true);
    });
  });

  describe("Utility types", () => {
    it("MessageResponse should have success and message", () => {
      const response: MessageResponse = {
        success: true,
        message: "Done",
      };
      expect(response.message).toBe("Done");
    });

    it("DeleteResponse should have success", () => {
      const response: DeleteResponse = { success: true };
      expect(response.success).toBe(true);
    });
  });
});
