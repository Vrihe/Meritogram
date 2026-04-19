import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { api } from '../services/api';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface ProfileChangeRequest {
  id: string;
  user_id: string;
  requested_by_id: string;
  requested_by_email: string;
  requested_by_name: string;
  student_email: string;
  student_name: string;
  changes: Record<string, any>;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  review_comment?: string;
}

export function AdminPanel() {
  const [requests, setRequests] = useState<ProfileChangeRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProfileChangeRequest | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/profile-change-requests', {
        params: { status_filter: statusFilter === 'all' ? 'pending' : statusFilter }
      });
      setRequests(response.requests || []);
    } catch (error) {
      console.error('Failed to load profile change requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setIsSubmittingReview(true);
    try {
      await api.post(`/admin/profile-change-requests/${requestId}/approve`, {
        status: 'approved',
        comment: reviewComment,
      });
      await loadRequests();
      setSelectedRequest(null);
      setReviewComment('');
    } catch (error) {
      console.error('Failed to approve request:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReject = async (requestId: string) => {
    setIsSubmittingReview(true);
    try {
      await api.post(`/admin/profile-change-requests/${requestId}/reject`, {
        status: 'rejected',
        comment: reviewComment,
      });
      await loadRequests();
      setSelectedRequest(null);
      setReviewComment('');
    } catch (error) {
      console.error('Failed to reject request:', error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-300';
      case 'approved':
        return 'bg-green-50 border-green-300';
      case 'rejected':
        return 'bg-red-50 border-red-300';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No profile change requests</div>
        ) : (
          requests.map((request) => (
            <Card
              key={request.id}
              className={`p-4 border cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(request.status)}`}
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(request.status)}
                    <span className="font-semibold capitalize">{request.status}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Professor:</strong> {request.requested_by_name} ({request.requested_by_email})
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Student:</strong> {request.student_name} ({request.student_email})
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Reason:</strong> {request.reason}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <AlertCircle className="w-5 h-5 text-blue-500" />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Profile Change Request Details</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <p className="text-sm">
                  <strong>Status:</strong>{' '}
                  <span className={`capitalize font-semibold ${
                    selectedRequest.status === 'pending' ? 'text-yellow-600' :
                    selectedRequest.status === 'approved' ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </p>
                <p className="text-sm">
                  <strong>Professor:</strong> {selectedRequest.requested_by_name}
                </p>
                <p className="text-sm">
                  <strong>Student:</strong> {selectedRequest.student_name}
                </p>
                <p className="text-sm">
                  <strong>Reason:</strong> {selectedRequest.reason}
                </p>
                <div className="text-sm">
                  <strong>Changes Requested:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto">
                    {JSON.stringify(selectedRequest.changes, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="space-y-3">
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Add a comment (optional)..."
                    className="w-full p-2 border rounded text-sm resize-none h-20"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={isSubmittingReview}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmittingReview ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={isSubmittingReview}
                      variant="destructive"
                    >
                      {isSubmittingReview ? 'Processing...' : 'Reject'}
                    </Button>
                    <Button
                      onClick={() => setSelectedRequest(null)}
                      variant="outline"
                      disabled={isSubmittingReview}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {selectedRequest.status !== 'pending' && (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Review Comment:</strong> {selectedRequest.review_comment || 'N/A'}
                  </p>
                  <Button
                    onClick={() => setSelectedRequest(null)}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
