import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import QuotationModal from '../components/QuotationModal';
import { formatDate } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Phone,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Building2,
  Mail,
  User,
  Calendar,
  Hash,
  Printer,
  FileText,
  CheckCircle,
  Package,
  ClipboardList
} from 'lucide-react';

const MultiEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // URL status tab parameter
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'All';

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Bulk actions states
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  const tableContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.2 } 
    }
  };

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/multi-enquiries');
      if (response.data.success) {
        setEnquiries(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load multi-product enquiries');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // Update Status
  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingStatusId(id);
    try {
      const response = await api.put(`/multi-enquiries/${id}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Enquiry marked as ${newStatus}`);
        setEnquiries((prev) =>
          prev.map((e) => (e._id === id ? { ...e, status: newStatus } : e))
        );
        if (selectedEnquiry && selectedEnquiry._id === id) {
          setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete handlers
  const openDeleteModal = (enq) => {
    setEnquiryToDelete(enq);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setEnquiryToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!enquiryToDelete) return;
    try {
      const response = await api.delete(`/multi-enquiries/${enquiryToDelete._id}`);
      if (response.data.success) {
        toast.success('Enquiry deleted successfully');
        setEnquiries((prev) => prev.filter((e) => e._id !== enquiryToDelete._id));
        setSelectedIds((prev) => prev.filter((id) => id !== enquiryToDelete._id));
      }
    } catch (error) {
      toast.error('Failed to delete enquiry');
      console.error(error);
    } finally {
      closeDeleteModal();
    }
  };

  const handleBulkApply = () => {
    if (!bulkAction) return;
    if (bulkAction === 'delete') {
      setBulkDeleteModalOpen(true);
    } else {
      executeBulkStatusUpdate();
    }
  };

  const executeBulkStatusUpdate = async () => {
    const statusMap = {
      mark_contacted: 'Contacted',
      mark_closed: 'Closed'
    };
    const newStatus = statusMap[bulkAction];
    if (!newStatus) return;

    const toastId = toast.loading(`Updating ${selectedIds.length} enquiries...`);
    try {
      await Promise.all(
        selectedIds.map(id => api.put(`/multi-enquiries/${id}/status`, { status: newStatus }))
      );
      toast.success('Enquiries updated successfully!', { id: toastId });
      
      setEnquiries(prev =>
        prev.map(e => selectedIds.includes(e._id) ? { ...e, status: newStatus } : e)
      );
      setSelectedIds([]);
      setBulkAction('');
    } catch (error) {
      toast.error('Failed to update some enquiries', { id: toastId });
      console.error(error);
    }
  };

  const executeBulkDelete = async () => {
    const toastId = toast.loading(`Deleting ${selectedIds.length} enquiries...`);
    try {
      await Promise.all(
        selectedIds.map(id => api.delete(`/multi-enquiries/${id}`))
      );
      toast.success('Enquiries deleted successfully!', { id: toastId });
      
      setEnquiries(prev => prev.filter(e => !selectedIds.includes(e._id)));
      setSelectedIds([]);
      setBulkAction('');
      setBulkDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete some enquiries', { id: toastId });
      console.error(error);
      setBulkDeleteModalOpen(false);
    }
  };

  // View details/Quotation builder
  const openQuotationModal = (enq) => {
    setSelectedEnquiry(enq);
    setQuotationModalOpen(true);
  };

  // Handle Tab filter changes
  const handleTabChange = (status) => {
    if (status === 'All') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery]);

  // Client-side search and filters
  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.phone.includes(searchQuery) ||
      (e.companyName && e.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.products.some(p => p.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination indices
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEnquiries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage);
  return (
    <div className="p-6 space-y-6">
      {/* Printable Report Header */}
      <div className="hidden print:block print-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ganga Maxx Marketplace</h1>
            <p className="text-xs text-slate-500">Official Product Catalog Admin System</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-bold text-primary-600">Multi-Product Enquiries Report</p>
            <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
            <p>Filter Status: {statusFilter}</p>
          </div>
        </div>
      </div>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Multi-Product Enquiries</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-darkbg-700 text-slate-600 dark:text-slate-300">
              {filteredEnquiries.length} leads
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review multi-item cart enquiries, construct quotations, and track dispatch communication.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <motion.button
            onClick={() => window.print()}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-darkbg-700 bg-white dark:bg-darkbg-800 rounded-xl hover:bg-slate-50 dark:hover:bg-darkbg-700 text-slate-700 dark:text-slate-200 font-bold text-sm transition shadow-xs cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4" />
            Export PDF
          </motion.button>
        </div>
      </div>

      {/* Tabs & Search Row */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between print:hidden">
        {/* Status Tabs */}
        <div className="flex bg-slate-100 dark:bg-darkbg-900 p-1.5 rounded-2xl border border-slate-200/40 dark:border-darkbg-750 select-none w-full xl:w-auto overflow-x-auto shrink-0 scrollbar-none">
          {['All', 'New', 'Quoted', 'Contacted', 'Closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white dark:bg-darkbg-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full xl:max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center w-5 h-5 text-slate-400 my-auto pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search enquiries by name, company, or products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-darkbg-800 border border-slate-200 dark:border-darkbg-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-slate-900 dark:text-white rounded-xl outline-none text-sm transition shadow-xs"
          />
        </div>
      </div>

      {/* Table Content */}
      {loading ? (
        <TableSkeleton rows={10} cols={8} />
      ) : (
        <div className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-darkbg-900/30 border-b border-slate-100 dark:border-darkbg-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 w-12 text-center select-none print:hidden">
                    <input
                      type="checkbox"
                      checked={currentItems.length > 0 && currentItems.every(item => selectedIds.includes(item._id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newSelections = [...selectedIds];
                          currentItems.forEach(item => {
                            if (!newSelections.includes(item._id)) {
                              newSelections.push(item._id);
                            }
                          });
                          setSelectedIds(newSelections);
                        } else {
                          const itemIds = currentItems.map(item => item._id);
                          setSelectedIds(prev => prev.filter(id => !itemIds.includes(id)));
                        }
                      }}
                      className="rounded border-slate-350 text-primary-500 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Company</th>
                  <th className="p-4 text-center">Items</th>
                  <th className="p-4 text-right">Est. Amount (₹)</th>
                  <th className="p-4">Status & Channels</th>
                  <th className="p-4 text-center print:hidden">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={tableContainerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-100 dark:divide-darkbg-700/50 text-sm"
              >
                {currentItems.map((enq) => (
                  <motion.tr 
                    key={enq._id} 
                    variants={tableRowVariants}
                    className="hover:bg-slate-50/50 dark:hover:bg-darkbg-900/10"
                  >
                    <td className="p-4 text-center select-none print:hidden">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(enq._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, enq._id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== enq._id));
                          }
                        }}
                        className="rounded border-slate-350 text-primary-500 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs shrink-0">
                      {formatDate(enq.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{enq.fullName}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">{enq.phone}</div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                      {enq.companyName}
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {enq.products.reduce((acc, p) => acc + p.quantity, 0)}
                      <span className="text-[10px] text-slate-400 block font-normal">({enq.products.length} unique)</span>
                    </td>
                    <td className="p-4 text-right font-extrabold text-slate-800 dark:text-slate-200">
                      ₹{(enq.finalQuotation?.grandTotal || enq.totalEstimatedAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          {/* Status Badge */}
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                              enq.status === 'New'
                                ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                                : enq.status === 'Quoted'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                                : enq.status === 'Contacted'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                                : 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                            }`}
                          >
                            {enq.status}
                          </span>

                          {/* Quick Status Select */}
                          <select
                            disabled={updatingStatusId === enq._id}
                            value={enq.status}
                            onChange={(e) => handleStatusUpdate(enq._id, e.target.value)}
                            className="text-xs bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 text-slate-500 rounded-md p-1 outline-none hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                          >
                            <option value="New">New</option>
                            <option value="Quoted">Quoted</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                        
                        {/* Channel icons */}
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className={`w-4 h-4 ${enq.emailSent ? 'text-primary-500 fill-primary-100/10' : 'text-slate-300 dark:text-slate-600'}`} title={enq.emailSent ? 'Email: Sent' : 'Email: Not Sent'} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center print:hidden">
                      <div className="flex items-center justify-center gap-2">
                        {/* Phone action */}
                        <motion.a
                          href={`tel:${enq.phone}`}
                          whileHover={{ scale: 1.02 }}
                          className="p-1.5 rounded-lg border border-slate-250 dark:border-darkbg-700 text-slate-500 hover:text-blue-500 hover:border-blue-200 dark:hover:border-blue-950 hover:bg-blue-50 dark:hover:bg-darkbg-900 transition cursor-pointer"
                          title="Call Client"
                        >
                          <Phone className="w-4.5 h-4.5" />
                        </motion.a>

                        {/* Quotation Builder Button */}
                        <motion.button
                          onClick={() => openQuotationModal(enq)}
                          whileHover={{ scale: 1.02 }}
                          className="p-1.5 rounded-lg border border-slate-250 dark:border-darkbg-700 text-slate-500 hover:text-primary-500 hover:border-primary-250 dark:hover:border-primary-950 hover:bg-slate-50 dark:hover:bg-darkbg-900 transition cursor-pointer flex items-center gap-1 font-bold text-xs"
                          title="Build Quote"
                        >
                          <FileText className="w-4.5 h-4.5" />
                          Quote
                        </motion.button>

                        {/* Delete Button */}
                        <motion.button
                          onClick={() => openDeleteModal(enq)}
                          whileHover={{ scale: 1.02 }}
                          className="p-1.5 rounded-lg border border-slate-250 dark:border-darkbg-700 text-slate-500 hover:text-red-500 hover:border-red-250 dark:hover:border-red-950 hover:bg-red-50 dark:hover:bg-darkbg-900 transition cursor-pointer"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredEnquiries.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <AlertCircle className="w-8 h-8" />
                        <span>No multi-product enquiries found.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-darkbg-700 p-4 shrink-0 bg-slate-50/50 dark:bg-darkbg-900/10 print:hidden">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-700 dark:text-white">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-semibold text-slate-700 dark:text-white">
                  {Math.min(indexOfLastItem, filteredEnquiries.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-700 dark:text-white">{filteredEnquiries.length}</span> entries
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-darkbg-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-darkbg-900 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`w-7.5 h-7.5 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      currentPage === index + 1
                        ? 'bg-primary-500 text-white font-semibold'
                        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-darkbg-900 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200/30 dark:border-darkbg-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-darkbg-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-darkbg-900 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quotation Builder Modal */}
      <QuotationModal
        isOpen={quotationModalOpen}
        onClose={() => {
          setQuotationModalOpen(false);
          setSelectedEnquiry(null);
        }}
        enquiry={selectedEnquiry}
        type="multi"
        onQuoted={(updatedEnq) => {
          setEnquiries(prev => prev.map(e => e._id === updatedEnq._id ? updatedEnq : e));
          setSelectedEnquiry(updatedEnq);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Enquiry"
        message="Are you sure you want to permanently delete this multi-product lead? This cannot be undone."
        confirmText="Confirm Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />

      {/* Bulk actions floating bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 100, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-1/2 z-40 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-6 border border-slate-800 select-none print:hidden"
          >
            <span className="text-xs font-semibold whitespace-nowrap">
              {selectedIds.length} leads selected
            </span>
            <div className="flex items-center gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="bg-slate-850 text-xs font-bold text-slate-200 border border-slate-700 rounded-lg p-2 outline-none cursor-pointer"
              >
                <option value="">Select Action</option>
                <option value="mark_contacted">Mark as Contacted</option>
                <option value="mark_closed">Mark as Closed</option>
                <option value="delete">Delete Selected</option>
              </select>

              <button
                onClick={handleBulkApply}
                disabled={!bulkAction}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Apply
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-400 hover:text-white transition font-semibold"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteModalOpen}
        title="Delete Multiple Leads"
        message={`Are you sure you want to permanently delete these ${selectedIds.length} leads? This cannot be undone.`}
        confirmText="Yes, Delete All"
        cancelText="Cancel"
        onConfirm={executeBulkDelete}
        onCancel={() => setBulkDeleteModalOpen(false)}
      />
    </div>
  );
};

export default MultiEnquiries;
