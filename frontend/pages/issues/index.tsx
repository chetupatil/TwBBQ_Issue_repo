import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient'; // ASSUMPTION — see lib/api-client-assumption.md

interface Issue {
  issueId: string;
  issueDesc: string;
  issuePriority: string;
  status: string;
  dueDate: string;
  venueId: string;
}

// No client-side venue filtering here on purpose. GET /issues returns
// whatever the backend's VenueScopeGuard + IssueService.findAll() decide
// this JWT is allowed to see — a VENUE user's own venue only,
// HEAD_OFFICE_ADMIN sees everything (or an optional ?venueId= they choose).
// This page never sends a venueId to narrow *its own* results down; that
// would imply the client is doing the authorization, which it isn't.
export default function IssuesListPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Issue[]>('/issues')
      .then((res) => setIssues(res.data))
      .catch((err) => setError(err?.response?.data?.message ?? 'Failed to load issues'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading issues…</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Issues</h1>
        <Link href="/issues/create">+ New Issue</Link>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.issueId}>
              <td>
                <Link href={`/issues/${issue.issueId}`}>{issue.issueDesc}</Link>
              </td>
              <td>{issue.issuePriority}</td>
              <td>{issue.status}</td>
              <td>{new Date(issue.dueDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
