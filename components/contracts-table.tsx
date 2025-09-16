"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface Contract {
  id: string
  contract_name: string
  parties: string
  expiry_date: string
  status: "Active" | "Expired" | "Renewal Due"
  risk_score: "Low" | "Medium" | "High"
  filename: string
  uploaded_on: string
}

export function ContractsTable() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [riskFilter, setRiskFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from("documents").select("*").order("uploaded_on", { ascending: false })

      if (error) {
        throw error
      }

      setContracts(data || [])
      setFilteredContracts(data || [])
    } catch (error) {
      console.error("Failed to fetch contracts:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch contracts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = contracts

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (contract) =>
          contract.contract_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.parties?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.filename.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((contract) => contract.status === statusFilter)
    }

    // Apply risk filter
    if (riskFilter !== "all") {
      filtered = filtered.filter((contract) => contract.risk_score === riskFilter)
    }

    setFilteredContracts(filtered)
    setCurrentPage(1)
  }, [contracts, searchTerm, statusFilter, riskFilter])

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedContracts = filteredContracts.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Expired":
        return "destructive"
      case "Renewal Due":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "Low":
        return "outline"
      case "Medium":
        return "secondary"
      case "High":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-gray-300">Loading contracts...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-8">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-2">Error loading contracts</p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <Button
              onClick={fetchContracts}
              variant="outline"
              className="border-white/10 text-gray-300 hover:bg-white/5 bg-transparent"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Contracts</CardTitle>
          <Button
            onClick={() => router.push("/upload")}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Contract
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search contracts, parties, or filenames..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Renewal Due">Renewal Due</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Risk" />
              </SelectTrigger>
              <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                <SelectItem value="all">All Risk</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-gray-400 text-lg mb-2">No contracts found</p>
            <p className="text-gray-500 text-sm mb-4">
              {contracts.length === 0
                ? "Upload your first contract to get started"
                : "Try adjusting your search or filters"}
            </p>
            {contracts.length === 0 && (
              <Button
                onClick={() => router.push("/upload")}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Contract
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-gray-300">Contract Name</TableHead>
                    <TableHead className="text-gray-300">Parties</TableHead>
                    <TableHead className="text-gray-300">Expiry Date</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Risk Score</TableHead>
                    <TableHead className="text-gray-300">Uploaded</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContracts.map((contract) => (
                    <TableRow key={contract.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{contract.contract_name}</TableCell>
                      <TableCell className="text-gray-300">{contract.parties || "N/A"}</TableCell>
                      <TableCell className="text-gray-300">{formatDate(contract.expiry_date)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(contract.status)}>{contract.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRiskBadgeVariant(contract.risk_score)}>{contract.risk_score}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{formatDate(contract.uploaded_on)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/contract/${contract.id}`)}
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredContracts.length)} of{" "}
                  {filteredContracts.length} contracts
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-white/10 text-gray-300 hover:bg-white/5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-white/10 text-gray-300 hover:bg-white/5"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
