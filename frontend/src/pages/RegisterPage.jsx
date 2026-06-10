import { useMutation } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import * as yup from 'yup';
import ErrorAlert from '../components/ErrorAlert';
import { REGISTER } from '../graphql/operations';

const schema = yup.object({
  name: yup.string(),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'Min 8 characters').required('Password is required'),
});

export default function RegisterPage() {
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [registerMutation, { loading, error }] = useMutation(REGISTER);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values) => {
    await registerMutation({ variables: { input: values } });
    setRegisteredEmail(values.email);
  };

  if (registeredEmail) {
    return (
      <Box maxWidth={420} mx="auto" mt={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Check your email
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            A verification link has been sent to <strong>{registeredEmail}</strong>.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Click the link in the email to activate your account, then you can log in.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Already verified?{' '}
            <Link component={RouterLink} to="/login">
              Login
            </Link>
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box maxWidth={420} mx="auto" mt={6}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Register
        </Typography>
        <ErrorAlert error={error} />
        <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Name"
            {...register('name')}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
          <TextField
            label="Email"
            {...register('email')}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
          />
          <TextField
            label="Password"
            type="password"
            {...register('password')}
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </Stack>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
