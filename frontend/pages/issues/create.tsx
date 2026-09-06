import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '@/lib/apiClient'; // ASSUMPTION — see lib/api-client-assumption.md

// No venue_id field on this form. If the logged-in user is VENUE-role, the
// backend derives venue_id from their JWT (VenueScopeGuard) and ignores
// anything this form could send anyway. A HEAD_OFFICE_ADMIN flow would need
// its own venue picker, omitted here since the spec's create flow is the
// venue-user path.
export default function CreateIssuePage() {
  const router = useRouter();
  const [issueDesc, setIssueDesc] = useState('');
  const [issuePriority, setIssuePriority] = useState('MEDIUM');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('issueDesc', issueDesc);
    formData.append('issuePriority', issuePriority);
    formData.append('assignedUserId', assignedUserId);
    formData.append('dueDate', dueDate);
    if (photo) formData.append('photo', photo);

    try {
      const res = await apiClient.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push(`/issues/${res.data.issueId}`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Report an Issue</h1>
      {error && <p role="alert">{error}</p>}

      <label>
        Description
        <textarea
          value={issueDesc}
          onChange={(e) => setIssueDesc(e.target.value)}
          required
        />
      </label>

      <label>
        Priority
        <select value={issuePriority} onChange={(e) => setIssuePriority(e.target.value)}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </label>

      <label>
        Assign to (user ID)
        <input
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
          required
        />
      </label>

      <label>
        Due date
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </label>

      <label>
        Photo (optional, jpeg/png/webp, max 5MB — enforced server-side too)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
      </label>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Issue'}
      </button>
    </form>
  );
}
