"use client"

import { useState } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { uploadFile } from "@/lib/api/services"

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; fileId?: number | null } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadResult(null)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setUploadResult({ success: false, message: "Please select a file to upload" })
      return
    }

    setIsUploading(true)
    try {
      const result = await uploadFile(file)
      setUploadResult({ 
        success: true, 
        message: "File uploaded successfully!", 
        fileId: result.id
      })
      setFile(null)
    } catch (error) {
      console.error("Failed to upload file:", error)
      setUploadResult({ success: false, message: "Failed to upload file" })
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <AppLayout roleLabel="Admin" title="File Upload">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">File Upload</h1>
          <p className="text-muted-foreground mt-1">
            Upload files to the media server
          </p>
        </div>

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="size-5 text-primary" />
              Upload New File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              {/* File Input */}
              <div className="space-y-2">
                <Label htmlFor="file">Select File *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <FileText className="size-4" />
                    <span>{file.name}</span>
                    <span>({formatFileSize(file.size)})</span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <Button type="submit" disabled={!file || isUploading} className="gap-2">
                <Upload className="size-4" />
                {isUploading ? "Uploading..." : "Upload File"}
              </Button>
            </form>

            {/* Upload Result */}
            {uploadResult && (
              <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                uploadResult.success 
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700" 
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}>
                {uploadResult.success ? (
                  <CheckCircle className="size-5" />
                ) : (
                  <AlertCircle className="size-5" />
                )}
                <div>
                  <p className="font-medium">
                    {uploadResult.success ? "Success" : "Error"}
                  </p>
                  <p className="text-sm">{uploadResult.message}</p>
                  {uploadResult.fileId && (
                    <p className="text-sm mt-1">File ID: {uploadResult.fileId}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Types Info */}
        <Card>
          <CardHeader>
            <CardTitle>Supported File Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span>Images: JPG, PNG, GIF, WebP</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span>Documents: PDF, DOC, DOCX</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span>Maximum file size: 10MB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
