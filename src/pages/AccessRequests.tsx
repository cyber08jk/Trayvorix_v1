import { useState, useEffect } from 'react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { Table } from '@components/common/Table';
import { TableSkeleton } from '@components/common/Loading';
import { useToast } from '@components/common/Toast';
import { supabase } from '@services/supabase';
import { Modal } from '@components/common/Modal';

interface AccessRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  requested_role: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}


export function AccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      // Always check localStorage first
      const localRequests = JSON.parse(localStorage.getItem('accessRequests') || '[]');

      // Try to fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('access_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Merge database and localStorage requests (database takes priority)
          const mergedRequests = [...data, ...localRequests.filter((lr: AccessRequest) =>
            !data.some(dr => dr.email === lr.email && dr.created_at === lr.created_at)
          )];
          setRequests(mergedRequests);
        } else {
          // Use localStorage if database is empty or has error
          setRequests(localRequests);
        }
      } catch (dbError) {
        console.log('Database not available, using localStorage');
        setRequests(localRequests);
      }
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: AccessRequest) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('access_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (error) {
        // Update in localStorage
        const localRequests = JSON.parse(localStorage.getItem('accessRequests') || '[]');
        const updated = localRequests.map((r: AccessRequest) =>
          r.id === request.id ? { ...r, status: 'approved' } : r
        );
        localStorage.setItem('accessRequests', JSON.stringify(updated));
      }

      showToast(`Access approved for ${request.full_name}`, 'success');
      fetchRequests();
      setShowDetailModal(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to approve request', 'error');
    }
  };

  const handleReject = async (request: AccessRequest) => {
    try {
      // Update in database
      const { error } = await supabase
        .from('access_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id);

      if (error) {
        // Update in localStorage
        const localRequests = JSON.parse(localStorage.getItem('accessRequests') || '[]');
        const updated = localRequests.map((r: AccessRequest) =>
          r.id === request.id ? { ...r, status: 'rejected' } : r
        );
        localStorage.setItem('accessRequests', JSON.stringify(updated));
      }

      showToast(`Access rejected for ${request.full_name}`, 'info');
      fetchRequests();
      setShowDetailModal(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to reject request', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      operator: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      auditor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      vendor: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role as keyof typeof roleColors]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'full_name',
      header: 'Name',
      sortable: true,
      render: (request: AccessRequest) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{request.full_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{request.email}</p>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (request: AccessRequest) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {request.company || 'N/A'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (request: AccessRequest) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {request.phone || 'N/A'}
        </span>
      ),
    },
    {
      key: 'requested_role',
      header: 'Requested Role',
      render: (request: AccessRequest) => getRoleBadge(request.requested_role),
    },
    {
      key: 'status',
      header: 'Status',
      render: (request: AccessRequest) => getStatusBadge(request.status),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (request: AccessRequest) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(request.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (request: AccessRequest) => (
        <div className="flex gap-2">
          <button
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
            onClick={() => {
              setSelectedRequest(request);
              setShowDetailModal(true);
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {request.status === 'pending' && (
            <>
              <button
                className="text-green-600 hover:text-green-700 dark:text-green-400"
                onClick={() => handleApprove(request)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                className="text-red-600 hover:text-red-700 dark:text-red-400"
                onClick={() => handleReject(request)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Access Requests
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Review and manage user access requests
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
              {requests.filter(r => r.status === 'pending').length} Pending
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="pending">Pending Only</option>
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Card>
        {loading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : (
          <Table
            data={filteredRequests}
            columns={columns}
            emptyMessage="No access requests found."
          />
        )}
      </Card>

      {/* Detail Modal */}
      {selectedRequest && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Access Request Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                <p className="text-gray-900 dark:text-white font-medium">{selectedRequest.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                <p className="text-gray-900 dark:text-white">{selectedRequest.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                <p className="text-gray-900 dark:text-white">{selectedRequest.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Company</label>
                <p className="text-gray-900 dark:text-white">{selectedRequest.company || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Requested Role</label>
                <div className="mt-1">{getRoleBadge(selectedRequest.requested_role)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Reason for Access</label>
              <p className="mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                {selectedRequest.reason}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Request Date</label>
              <p className="text-gray-900 dark:text-white">
                {new Date(selectedRequest.created_at).toLocaleString()}
              </p>
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="secondary"
                  onClick={() => handleReject(selectedRequest)}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleApprove(selectedRequest)}
                  className="flex-1"
                >
                  Approve Access
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
