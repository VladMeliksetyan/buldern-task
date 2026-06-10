import { useMutation, useQuery } from '@apollo/client';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';
import {
  ACCEPT_INVITATION,
  MY_INVITATIONS,
  PROJECTS,
  REJECT_INVITATION,
} from '../graphql/operations';

export default function InvitationsPage() {
  const navigate = useNavigate();
  const [acceptedId, setAcceptedId] = useState(null);

  const { data, loading, error, refetch } = useQuery(MY_INVITATIONS, {
    fetchPolicy: 'network-only',
  });

  const [acceptInvitation, { loading: accepting, error: acceptError }] = useMutation(
    ACCEPT_INVITATION,
    {
      refetchQueries: [{ query: PROJECTS }],
      onCompleted: (result) => {
        setAcceptedId(result.acceptInvitation.id);
        setTimeout(() => navigate('/'), 1500);
      },
    },
  );

  const [rejectInvitation, { loading: rejecting, error: rejectError }] = useMutation(
    REJECT_INVITATION,
    {
      onCompleted: () => refetch(),
    },
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  const invitations = data?.myInvitations ?? [];

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Invitations</Typography>

      <ErrorAlert error={error || acceptError || rejectError} />

      {acceptedId && (
        <Alert severity="success">
          Invitation accepted! Redirecting to your projects…
        </Alert>
      )}

      {!invitations.length && !acceptedId ? (
        <Paper sx={{ p: 2 }}>No pending invitations.</Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>From</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>{invitation.project.name}</TableCell>
                  <TableCell>{invitation.project.location}</TableCell>
                  <TableCell>{invitation.inviter.email}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ mr: 1 }}
                      disabled={accepting || rejecting}
                      onClick={() =>
                        acceptInvitation({ variables: { id: invitation.id } })
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      color="inherit"
                      disabled={accepting || rejecting}
                      onClick={() =>
                        rejectInvitation({ variables: { id: invitation.id } })
                      }
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
