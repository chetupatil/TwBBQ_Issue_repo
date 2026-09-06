import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '@/lib/apiClient'; // ASSUMPTION — see lib/api-client-assumption.md

interface Issue {
  issueId: string;
  issueDesc: string;
  issuePhotoLink: string | null;
  issuePriority: string;
  status: string;
  dueDate: string;
  assignedUserId: string;
  venueId: string;
  issueComments: string | null;
}

// GET /issues/:id — if this issue belongs to another venue and the caller
// is VENUE-role, the backend's VenueScopeGuard returns a 404 before this
// page's fetch ever sees the record. That 404 is rendered as-is; this page
// does not try to re-check venue ownership itself.
export default function IssueDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [issue, setIssue] = useState<Issue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    apiClient
      .get<Issue>(`/issues/${id}`)
      .then((res) => setIssue(res.data))
      .catch((err) =>
        setError(
          err?.response?.status === 404
            ? 'Issue not found'
            : err?.response?.data?.message ?? 'Failed to load issue',
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!issue) return null;

  return (
    <div>
      <h1>{issue.issueDesc}</h1>
      <p>Priority: {issue.issuePriority}</p>
      <p>Status: {issue.status}</p>
      <p>Due: {new Date(issue.dueDate).toLocaleDateString()}</p>
      {issue.issuePhotoLink && (
        <img src={issue.issuePhotoLink} alt="Issue photo" style={{ maxWidth: 400 }} />
      )}
      {issue.issueComments && <p>Comments: {issue.issueComments}</p>}
    </div>
  );
}
