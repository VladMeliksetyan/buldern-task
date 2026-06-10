import { useMutation, useQuery } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import * as yup from 'yup';
import ErrorAlert from '../components/ErrorAlert';
import { CREATE_PROJECT, PROJECTS } from '../graphql/operations';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  location: yup.string().required('Location is required'),
});

export default function ProjectsPage() {
  const { data, loading, error, refetch } = useQuery(PROJECTS);
  const [createProject, { loading: creating, error: createError }] = useMutation(CREATE_PROJECT, {
    onCompleted: () => {
      reset();
      refetch();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', location: '' },
  });

  const onSubmit = async (values) => {
    await createProject({ variables: { input: values } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Projects</Typography>
      <ErrorAlert error={error || createError} />

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          New project
        </Typography>
        <Stack
          component="form"
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            label="Name"
            fullWidth
            {...register('name')}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
          />
          <TextField
            label="Location"
            fullWidth
            {...register('location')}
            error={Boolean(errors.location)}
            helperText={errors.location?.message}
          />
          <Button type="submit" variant="contained" disabled={creating} sx={{ minWidth: 120 }}>
            Create
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {data?.projects?.map((project) => (
          <Grid key={project.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardActionArea component={RouterLink} to={`/projects/${project.id}`}>
                <CardContent>
                  <Typography variant="h6">{project.name}</Typography>
                  <Typography color="text.secondary">{project.location}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Owner: {project.owner.email}
                  </Typography>
                  <Typography variant="body2">
                    Members: {project.members.length}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {!data?.projects?.length && (
        <Typography color="text.secondary">No projects yet. Create your first one above.</Typography>
      )}
    </Stack>
  );
}
