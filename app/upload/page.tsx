"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface UploadedFile {
  file: File
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  error?: string
  documentId?: string
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user) {
          router.push("/auth/login")
          return
        }

        setUser(user)
      } catch (error) {
        console.error("Error checking user:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router, supabase.auth])

  const processFile = async (file: File, index: number) => {
    try {
      // Update status to processing
      setUploadedFiles((prev) => prev.map((f, i) => (i === index ? { ...f, status: "processing", progress: 30 } : f)))

      // Extract contract name from filename
      const contractName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")

      // Generate mock contract data based on filename
      const mockContractData = {
        contract_name: contractName,
        filename: file.name,
        parties: `${contractName} Agreement Parties`,
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 year from now
        status: "Active" as const,
        risk_score: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)] as "Low" | "Medium" | "High",
        file_size: file.size,
        file_type: file.type,
        user_id: user.id,
      }

      // Insert document into database
      const { data: document, error: docError } = await supabase
        .from("documents")
        .insert(mockContractData)
        .select()
        .single()

      if (docError) {
        throw new Error(`Database error: ${docError.message}`)
      }

      // Update progress
      setUploadedFiles((prev) => prev.map((f, i) => (i === index ? { ...f, progress: 60 } : f)))

      // Insert mock document chunks
      const mockChunks = [
        {
          document_id: document.id,
          chunk_text: "Termination clause: Either party may terminate this agreement with 90 days written notice.",
          chunk_index: 1,
          page_number: 2,
          clause_type: "termination",
          metadata: { page: 2, contract_name: contractName, clause_type: "termination" },
        },
        {
          document_id: document.id,
          chunk_text:
            "Liability limitation: Total liability under this agreement shall not exceed the total fees paid in the preceding 12 months.",
          chunk_index: 2,
          page_number: 5,
          clause_type: "liability",
          metadata: { page: 5, contract_name: contractName, clause_type: "liability" },
        },
        {
          document_id: document.id,
          chunk_text:
            "Confidentiality obligations: All confidential information shall be protected for a period of 5 years after termination.",
          chunk_index: 3,
          page_number: 3,
          clause_type: "confidentiality",
          metadata: { page: 3, contract_name: contractName, clause_type: "confidentiality" },
        },
      ]

      const { error: chunksError } = await supabase.from("document_chunks").insert(mockChunks)

      if (chunksError) {
        console.warn("Error inserting chunks:", chunksError.message)
      }

      // Update progress
      setUploadedFiles((prev) => prev.map((f, i) => (i === index ? { ...f, progress: 80 } : f)))

      // Insert mock contract insights
      const mockInsights = [
        {
          document_id: document.id,
          insight_type: "risk",
          title: "Liability Cap Analysis",
          summary:
            "Liability cap may be insufficient for contracts with high potential damages. Consider increasing the limitation amount.",
          confidence: 0.88,
          risk_level: "Medium" as const,
          evidence_text:
            "Total liability under this agreement shall not exceed the total fees paid in the preceding 12 months.",
          source_section: "Section 12.3 - Limitation of Liability",
        },
        {
          document_id: document.id,
          insight_type: "clause",
          title: "Termination Clause",
          summary:
            "Standard termination provisions with reasonable notice period. Either party may terminate with 90 days notice.",
          confidence: 0.95,
          risk_level: "Low" as const,
          evidence_text: "Either party may terminate this agreement with 90 days written notice.",
          source_section: "Section 8.1 - Termination",
        },
      ]

      const { error: insightsError } = await supabase.from("contract_insights").insert(mockInsights)

      if (insightsError) {
        console.warn("Error inserting insights:", insightsError.message)
      }

      // Update status to completed
      setUploadedFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "completed",
                progress: 100,
                documentId: document.id,
              }
            : f,
        ),
      )
    } catch (error) {
      console.error("Error processing file:", error)
      setUploadedFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "error",
                progress: 0,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f,
        ),
      )
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user) {
        router.push("/auth/login")
        return
      }

      const validFiles = acceptedFiles.filter((file) => {
        const validTypes = [
          "application/pdf",
          "text/plain",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]
        return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB limit
      })

      if (validFiles.length !== acceptedFiles.length) {
        alert("Some files were rejected. Only PDF, TXT, and DOCX files under 10MB are allowed.")
      }

      const newFiles: UploadedFile[] = validFiles.map((file) => ({
        file,
        status: "uploading",
        progress: 0,
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])
      setIsUploading(true)

      // Process each file
      for (let i = 0; i < newFiles.length; i++) {
        const fileIndex = uploadedFiles.length + i
        await processFile(newFiles[i].file, fileIndex)
      }

      setIsUploading(false)
    },
    [uploadedFiles.length, user, router, supabase],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <FileText className="h-5 w-5 text-purple-400" />
    }
  }

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return "Uploading..."
      case "processing":
        return "Processing..."
      case "completed":
        return "Completed"
      case "error":
        return "Error"
      default:
        return "Unknown"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#121212] via-[#1A1A1A] to-[#0F0F0F] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white text-balance">Upload Contracts</h1>
          <p className="text-gray-400 mt-2">Upload your contract documents to start analyzing them with AI</p>
        </div>

        {/* Upload Area */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Document Upload</CardTitle>
            <CardDescription className="text-gray-400">
              Drag and drop your contract files here, or click to browse. Supports PDF, TXT, and DOCX files up to 10MB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-purple-400 bg-purple-500/10"
                  : "border-white/20 hover:border-white/30 hover:bg-white/5"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-purple-400">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-300 mb-2">Drag and drop contract files here, or click to select files</p>
                  <p className="text-sm text-gray-500">PDF, TXT, DOCX up to 10MB each</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {uploadedFiles.length > 0 && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Upload Progress</CardTitle>
              <CardDescription className="text-gray-400">
                Track the progress of your document uploads and processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((uploadedFile, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-white/5 border border-white/10 rounded-lg"
                  >
                    {getStatusIcon(uploadedFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{uploadedFile.file.name}</p>
                      <p className="text-sm text-gray-400">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB • {getStatusText(uploadedFile.status)}
                      </p>
                      {uploadedFile.error && <p className="text-sm text-red-400 mt-1">{uploadedFile.error}</p>}
                    </div>
                    <div className="w-32">
                      <Progress value={uploadedFile.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>

              {uploadedFiles.some((f) => f.status === "completed") && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <Button
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    View Contracts Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">1. Upload</h3>
                <p className="text-sm text-gray-400">Upload your contract documents in PDF, TXT, or DOCX format</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">2. Process</h3>
                <p className="text-sm text-gray-400">AI automatically extracts and analyzes key contract clauses</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">3. Analyze</h3>
                <p className="text-sm text-gray-400">
                  Query your contracts and get AI-powered insights and recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
