"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight, FileSpreadsheet, FileText } from "lucide-react"
import { useDataset } from "./hooks/useDataset"

export function PreviewTable() {
  const { preview, columns, filename } = useDataset()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRows, setFilteredRows] = useState<any[]>([])
  const rowsPerPage = 10

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredRows(preview)
    } else {
      const filtered = preview.filter((row) =>
        Object.values(row).some((value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredRows(filtered)
      setCurrentPage(1)
    }
  }, [searchTerm, preview])

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const visibleRows = filteredRows.slice(startIndex, startIndex + rowsPerPage)

  const getFileIcon = () => {
    const fileType = filename?.split(".").pop()?.toLowerCase()
    if (fileType === "xlsx" || fileType === "xls") {
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />
    }
    return <FileText className="h-5 w-5 text-blue-600" />
  }

  const getFileTypeLabel = () => {
    const fileType = filename?.split(".").pop()?.toLowerCase()
    if (fileType === "xlsx" || fileType === "xls") {
      return "Excel"
    }
    return "CSV"
  }

  if (!preview.length || !columns.length) return null

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          {getFileIcon()}
          <CardTitle>Dataset Preview: {filename || "Datos"}</CardTitle>
          <Badge variant="secondary">{getFileTypeLabel()}</Badge>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search data..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((header, index) => (
                  <TableHead key={index} className="font-medium">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.length > 0 ? (
                visibleRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((header, cellIndex) => (
                      <TableCell key={cellIndex}>{row[header] || "-"}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-4">
                    {searchTerm ? "No matching data found" : "No data available"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + rowsPerPage, filteredRows.length)} of {filteredRows.length}{" "}
            rows
            {searchTerm && ` (filtered from ${preview.length} total)`}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">
            <strong>Dataset Info:</strong> {columns.length} columns, {preview.length} rows
            {searchTerm && ` • ${filteredRows.length} rows match "${searchTerm}"`}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Also export as default for backward compatibility
export default PreviewTable
