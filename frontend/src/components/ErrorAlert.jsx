import { Alert } from '@mui/material';

export default function ErrorAlert({ error }) {
  if (!error) return null;

  const message =
    error.graphQLErrors?.[0]?.message ||
    error.networkError?.message ||
    error.message ||
    'Something went wrong';

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      {message}
    </Alert>
  );
}
