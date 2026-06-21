import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import { formatDate } from '../utils/helpers';
import {
  Search,
  Eye,
  Trash2,
  AlertCircle,
  X,
  Mail,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Phone
} from 'lucide-react';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

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

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contact');
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load contact messages');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Update Message Status
  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingStatusId(id);
    try {
      const response = await api.put(`/contact/${id}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Message marked as ${newStatus}`);
        setMessages((prev) =>
          prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m))
        );
        if (selectedMessage && selectedMessage._id === id) {
          setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete message handlers
  const openDeleteModal = (msg) => {
    setMessageToDelete(msg);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setMessageToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    try {
      const response = await api.delete(`/contact/${messageToDelete._id}`);
      if (response.data.success) {
        toast.success('Message deleted successfully');
        setMessages((prev) => prev.filter((m) => m._id !== messageToDelete._id));
        if (selectedMessage?._id === messageToDelete._id) {
          setDetailModalOpen(false);
        }
      }
    } catch (error) {
      toast.error('Failed to delete message');
      console.error(error);
    } finally {
      closeDeleteModal();
    }
  };

  // Open details
  const openDetailModal = (msg) => {
    setSelectedMessage(msg);
    setDetailModalOpen(true);
    // Auto mark as Read if status is New
    if (msg.status === 'New') {
      handleStatusUpdate(msg._id, 'Read');
    }
  };

  // Filter messages client-side
  const filteredMessages = messages.filter((m) => {
    if (statusFilter === 'All') return true;
    return m.status === statusFilter;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Contact Messages</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-darkbg-700 text-slate-600 dark:text-slate-300">
              {filteredMessages.length} messages
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review feedback and customer inquiries submitted from contact forms.</p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex bg-slate-100 dark:bg-darkbg-900 p-1.5 rounded-2xl border border-slate-200/40 dark:border-darkbg-750 select-none w-full sm:w-auto overflow-x-auto shrink-0 scrollbar-none self-start">
        {['All', 'New', 'Read', 'Replied'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
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

      {/* Table Content */}
      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <div className="bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-darkbg-900/30 border-b border-slate-100 dark:border-darkbg-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">From</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={tableContainerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-100 dark:divide-darkbg-700/50 text-sm"
              >
                {filteredMessages.map((msg) => (
                  <motion.tr 
                    key={msg._id} 
                    variants={tableRowVariants}
                    className="hover:bg-slate-50/50 dark:hover:bg-darkbg-900/10"
                  >
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                      {formatDate(msg.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{msg.name}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">{msg.email}</div>
                      {msg.phone && <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{msg.phone}</div>}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-350 font-semibold truncate max-w-[250px]" title={msg.subject}>
                      {msg.subject}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                            msg.status === 'New'
                              ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                              : msg.status === 'Read'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                              : 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                          }`}
                        >
                          {msg.status}
                        </span>

                        {/* Status Quick Update */}
                        <select
                          disabled={updatingStatusId === msg._id}
                          value={msg.status}
                          onChange={(e) => handleStatusUpdate(msg._id, e.target.value)}
                          className="text-xs bg-slate-50 dark:bg-darkbg-900 border border-slate-200 dark:border-darkbg-700 text-slate-500 rounded-md p-1 outline-none hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                        >
                          <option value="New">New</option>
                          <option value="Read">Read</option>
                          <option value="Replied">Replied</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Call Button */}
                        {msg.phone && (
                          <motion.a
                            href={`tel:${msg.phone}`}
                            whileHover={{ scale: 1.02 }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-darkbg-700 text-slate-500 hover:text-green-600 hover:border-green-250 dark:hover:border-green-950 hover:bg-green-50 dark:hover:bg-darkbg-900 transition cursor-pointer"
                            title={`Call ${msg.phone}`}
                          >
                            <Phone className="w-4 h-4" />
                          </motion.a>
                        )}
                        {/* View Button */}
                        <motion.button
                          onClick={() => openDetailModal(msg)}
                          whileHover={{ scale: 1.02 }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-darkbg-700 text-slate-500 hover:text-primary-500 hover:border-primary-250 dark:hover:border-primary-950 hover:bg-slate-50 dark:hover:bg-darkbg-900 transition cursor-pointer"
                          title="View Message"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </motion.button>
                        {/* Delete Button */}
                        <motion.button
                          onClick={() => openDeleteModal(msg)}
                          whileHover={{ scale: 1.02 }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-darkbg-700 text-slate-500 hover:text-red-500 hover:border-red-250 dark:hover:border-red-950 hover:bg-red-50 dark:hover:bg-darkbg-900 transition cursor-pointer"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredMessages.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                        <AlertCircle className="w-8 h-8" />
                        <span>No contact messages found.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      <AnimatePresence>
        {detailModalOpen && selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-xl bg-white dark:bg-darkbg-800 border border-slate-100 dark:border-darkbg-700 rounded-3xl shadow-xl z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-darkbg-700 px-6 py-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary-500" />
                  Message Content
                </h3>
                <motion.button
                  onClick={() => setDetailModalOpen(false)}
                  whileHover={{ scale: 1.02 }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-darkbg-900 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {/* Sender Info */}
                <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-darkbg-750 bg-slate-50/50 dark:bg-darkbg-900/10">
                  <div className="flex items-start gap-3 min-w-0">
                    <User className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">From Sender</span>
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{selectedMessage.name}</p>
                      <p className="text-xs text-slate-400 font-mono truncate">{selectedMessage.email}</p>
                    </div>
                  </div>
                  <motion.a
                    href={`mailto:${selectedMessage.email}`}
                    whileHover={{ scale: 1.02 }}
                    className="px-3.5 py-1.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer"
                  >
                    Reply Email
                  </motion.a>
                </div>

                {/* Phone Number */}
                {selectedMessage.phone && (
                  <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-darkbg-750 bg-slate-50/50 dark:bg-darkbg-900/10">
                    <div className="flex items-start gap-3 min-w-0">
                      <Phone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Phone Number</span>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{selectedMessage.phone}</p>
                      </div>
                    </div>
                    <motion.a
                      href={`tel:${selectedMessage.phone}`}
                      whileHover={{ scale: 1.02 }}
                      className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition shrink-0 cursor-pointer"
                    >
                      Call Number
                    </motion.a>
                  </div>
                )}

                {/* Subject and Date */}
                <div className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 dark:border-darkbg-750 bg-slate-50/50 dark:bg-darkbg-900/10">
                  <Tag className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Subject Line</span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{selectedMessage.subject}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 dark:border-darkbg-750 bg-slate-50/50 dark:bg-darkbg-900/10">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Submission Date</span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5 p-4 rounded-2xl border border-slate-100 dark:border-darkbg-750 bg-slate-50/30 dark:bg-darkbg-900/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Message Body</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-darkbg-900 px-6 py-4 border-t border-slate-100 dark:border-darkbg-700">
              <motion.button
                onClick={() => openDeleteModal(selectedMessage)}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition cursor-pointer"
              >
                <Trash2 className="w-4.5 h-4.5" />
                Delete Message
              </motion.button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 dark:text-slate-500 mr-2">Update status:</span>
                <select
                  value={selectedMessage.status}
                  onChange={(e) => handleStatusUpdate(selectedMessage._id, e.target.value)}
                  className="text-xs bg-white dark:bg-darkbg-800 border border-slate-200 dark:border-darkbg-700 text-slate-500 rounded-md p-1 outline-none hover:text-slate-705 dark:hover:text-slate-350 cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Read">Read</option>
                  <option value="Replied">Replied</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Message"
        message="Are you sure you want to permanently delete this contact feedback message? This action is permanent."
        confirmText="Confirm Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
      />
    </div>
  );
};

export default ContactMessages;
