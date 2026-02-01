"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropzone } from "@/components/upload/dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Loader2 } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);

  const handleUploadComplete = (files: File[]) => {
    setUploadedFiles(files);
  };

  const handleParseResume = async () => {
    if (uploadedFiles.length === 0) return;

    setIsParsing(true);
    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: uploadedFiles[0].name }),
      });

      if (!response.ok) throw new Error("Parse failed");

      const data = await response.json();
      setParseResult(data);
    } catch (error) {
      console.error("Parse error:", error);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Your Resume</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your resume to extract your professional information. We support PDF, DOCX, and TXT files.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Drag and drop your resume or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dropzone onUploadComplete={handleUploadComplete} maxFiles={1} />
          </CardContent>
        </Card>

        {uploadedFiles.length > 0 && !parseResult && (
          <Card>
            <CardHeader>
              <CardTitle>Ready to Parse</CardTitle>
              <CardDescription>
                Click below to extract information from your resume using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span>{uploadedFiles[0].name}</span>
                </div>
                <Button onClick={handleParseResume} disabled={isParsing}>
                  {isParsing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      Parse Resume
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {parseResult && (
          <Card className="border-green-500/50">
            <CardHeader>
              <CardTitle className="text-green-600">Resume Parsed Successfully!</CardTitle>
              <CardDescription>
                Your information has been extracted and saved to your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{parseResult.profile?.contact?.name || "Name extracted"}</p>
                  <p className="text-sm text-muted-foreground">
                    {parseResult.profile?.experiences?.length || 0} experiences,{" "}
                    {parseResult.profile?.skills?.length || 0} skills,{" "}
                    {parseResult.profile?.education?.length || 0} education entries
                  </p>
                </div>
                <Button onClick={() => router.push("/profile")}>
                  View & Edit Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
