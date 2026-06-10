import { useMutation, useQuery } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import ErrorAlert from '../components/ErrorAlert';
import MoneyTable from '../components/MoneyTable';
import { useAuth } from '../context/AuthContext';
import {
  BUDGET_REPORT,
  CREATE_EXPENSE,
  CREATE_INCOME,
  DELETE_EXPENSE,
  DELETE_INCOME,
  DELETE_PROJECT,
  INVITE_USER,
  PROJECT,
  UPDATE_EXPENSE,
  UPDATE_INCOME,
  UPDATE_PROJECT,
} from '../graphql/operations';

const moneySchema = yup.object({
  name: yup.string().required('Name is required'),
  amount: yup.number().positive('Must be positive').required('Amount is required'),
});

const inviteSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState(0);

  const { data, loading, error, refetch } = useQuery(PROJECT, { variables: { id } });
  const { data: budgetData, refetch: refetchBudget } = useQuery(BUDGET_REPORT, {
    variables: { projectId: id },
    skip: tab !== 3,
  });

  const [updateProject, { loading: updating }] = useMutation(UPDATE_PROJECT, {
    onCompleted: () => refetch(),
  });
  const [deleteProject, { loading: deleting }] = useMutation(DELETE_PROJECT, {
    onCompleted: () => navigate('/'),
  });
  const [inviteUser, { loading: inviting, error: inviteError }] = useMutation(INVITE_USER);
  const [createExpense, { loading: creatingExpense, error: expenseError }] = useMutation(
    CREATE_EXPENSE,
    { onCompleted: () => { refetch(); refetchBudget(); expenseForm.reset(); } },
  );
  const [createIncome, { loading: creatingIncome, error: incomeError }] = useMutation(
    CREATE_INCOME,
    { onCompleted: () => { refetch(); refetchBudget(); incomeForm.reset(); } },
  );
  const [updateExpense] = useMutation(UPDATE_EXPENSE, {
    onCompleted: () => { refetch(); refetchBudget(); },
  });
  const [deleteExpense] = useMutation(DELETE_EXPENSE, {
    onCompleted: () => { refetch(); refetchBudget(); },
  });
  const [updateIncome] = useMutation(UPDATE_INCOME, {
    onCompleted: () => { refetch(); refetchBudget(); },
  });
  const [deleteIncome] = useMutation(DELETE_INCOME, {
    onCompleted: () => { refetch(); refetchBudget(); },
  });

  const expenseForm = useForm({
    resolver: yupResolver(moneySchema),
    defaultValues: { name: '', amount: '' },
  });
  const incomeForm = useForm({
    resolver: yupResolver(moneySchema),
    defaultValues: { name: '', amount: '' },
  });
  const inviteForm = useForm({
    resolver: yupResolver(inviteSchema),
    defaultValues: { email: '' },
  });
  const editForm = useForm({
    values: {
      name: data?.project?.name ?? '',
      location: data?.project?.location ?? '',
    },
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  const project = data?.project;
  if (!project) {
    return <Typography>Project not found.</Typography>;
  }

  const isOwner = project.owner.id === user?.id;

  const handleUpdate = async (values) => {
    await updateProject({ variables: { id, input: values } });
  };

  const handleInvite = async (values) => {
    await inviteUser({ variables: { input: { projectId: id, email: values.email } } });
    inviteForm.reset();
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">{project.name}</Typography>
        <Typography color="text.secondary">{project.location}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Owner: {project.owner.email}
        </Typography>
      </Box>

      <ErrorAlert error={error || inviteError || expenseError || incomeError} />

      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab label="Overview" />
        <Tab label="Expenses" />
        <Tab label="Incomes" />
        <Tab label="Budget" />
        {isOwner && <Tab label="Invite" />}
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Members</Typography>
            {project.members.length === 0 ? (
              <Typography color="text.secondary">No members yet.</Typography>
            ) : (
              project.members.map((member) => (
                <Typography key={member.id}>{member.user.email}</Typography>
              ))
            )}
          </Paper>

          {isOwner && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Edit project</Typography>
              <Stack component="form" spacing={2} onSubmit={editForm.handleSubmit(handleUpdate)}>
                <TextField label="Name" {...editForm.register('name')} />
                <TextField label="Location" {...editForm.register('location')} />
                <Stack direction="row" spacing={2}>
                  <Button type="submit" variant="contained" disabled={updating}>
                    Save
                  </Button>
                  <Button
                    color="error"
                    variant="outlined"
                    disabled={deleting}
                    onClick={() => deleteProject({ variables: { id } })}
                  >
                    Delete project
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          )}
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Add expense</Typography>
            <Stack
              component="form"
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              onSubmit={expenseForm.handleSubmit((values) =>
                createExpense({
                  variables: {
                    input: {
                      projectId: id,
                      name: values.name,
                      amount: Number(values.amount),
                    },
                  },
                }),
              )}
            >
              <TextField label="Name" fullWidth {...expenseForm.register('name')} />
              <TextField
                label="Amount"
                type="number"
                fullWidth
                {...expenseForm.register('amount')}
              />
              <Button type="submit" variant="contained" disabled={creatingExpense}>
                Add
              </Button>
            </Stack>
          </Paper>
          <MoneyTable
            rows={project.expenses}
            currentUserId={user?.id}
            isOwner={isOwner}
            onEdit={(expenseId, input) =>
              updateExpense({ variables: { id: expenseId, input } })
            }
            onDelete={(expenseId) => deleteExpense({ variables: { id: expenseId } })}
            emptyLabel="No expenses yet."
          />
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Add income</Typography>
            <Stack
              component="form"
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              onSubmit={incomeForm.handleSubmit((values) =>
                createIncome({
                  variables: {
                    input: {
                      projectId: id,
                      name: values.name,
                      amount: Number(values.amount),
                    },
                  },
                }),
              )}
            >
              <TextField label="Name" fullWidth {...incomeForm.register('name')} />
              <TextField
                label="Amount"
                type="number"
                fullWidth
                {...incomeForm.register('amount')}
              />
              <Button type="submit" variant="contained" disabled={creatingIncome}>
                Add
              </Button>
            </Stack>
          </Paper>
          <MoneyTable
            rows={project.incomes}
            currentUserId={user?.id}
            isOwner={isOwner}
            onEdit={(incomeId, input) =>
              updateIncome({ variables: { id: incomeId, input } })
            }
            onDelete={(incomeId) => deleteIncome({ variables: { id: incomeId } })}
            emptyLabel="No incomes yet."
          />
        </Stack>
      )}

      {tab === 3 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Summary</Typography>
            <Typography>Total expenses: {formatMoney(budgetData?.budgetReport?.summary?.totalExpenses ?? 0)}</Typography>
            <Typography>Total incomes: {formatMoney(budgetData?.budgetReport?.summary?.totalIncomes ?? 0)}</Typography>
            <Typography>
              Difference: {formatMoney(budgetData?.budgetReport?.summary?.difference ?? 0)}
            </Typography>
          </Paper>
          <Divider />
          {(budgetData?.budgetReport?.items ?? []).map((item) => (
            <Paper key={item.name} sx={{ p: 2 }}>
              <Typography variant="subtitle1">{item.name}</Typography>
              <Typography variant="body2">Expenses: {formatMoney(item.totalExpenses)}</Typography>
              <Typography variant="body2">Incomes: {formatMoney(item.totalIncomes)}</Typography>
              <Typography variant="body2">Difference: {formatMoney(item.difference)}</Typography>
            </Paper>
          ))}
          {!budgetData?.budgetReport?.items?.length && (
            <Typography color="text.secondary">No financial data yet.</Typography>
          )}
        </Stack>
      )}

      {tab === 4 && isOwner && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Invite by email</Typography>
          <Stack
            component="form"
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            onSubmit={inviteForm.handleSubmit(handleInvite)}
          >
            <TextField label="Email" fullWidth {...inviteForm.register('email')} />
            <Button type="submit" variant="contained" disabled={inviting}>
              Send invite
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
