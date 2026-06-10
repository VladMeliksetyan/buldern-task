import { useMutation } from '@apollo/client';
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VERIFY_EMAIL } from '../graphql/operations';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { login } = useAuth();
  const called = useRef(false);

  const [verifyEmail, { loading, error, data }] = useMutation(VERIFY_EMAIL);

  useEffect(() => {
    if (!token || called.current) return;
    called.current = true;
    verifyEmail({ variables: { token } })
      .then(({ data }) => {
        if (data?.verifyEmail) {
          login(data.verifyEmail);
          setTimeout(() => navigate('/'), 1500);
        }
      })
      .catch(() => {});
  }, [token]);

  return (
    <Box maxWidth={420} mx="auto" mt={6}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Email Verification
        </Typography>

        {!token && (
          <Alert severity="error">No verification token found in the URL.</Alert>
        )}

        {token && loading && (
          <>
            <CircularProgress sx={{ my: 2 }} />
            <Typography color="text.secondary">Verifying your email…</Typography>
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ textAlign: 'left' }}>
            {error.graphQLErrors?.[0]?.message || 'Verification failed. The link may have already been used or is invalid.'}
          </Alert>
        )}

        {data?.verifyEmail && (
          <Alert severity="success">
            Email verified! Redirecting you to the app…
          </Alert>
        )}

        {error && (
          <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/register')}>
            Back to Register
          </Button>
        )}
      </Paper>
    </Box>
  );
}
