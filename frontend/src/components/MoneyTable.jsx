import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { useState } from 'react';

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default function MoneyTable({
  rows,
  currentUserId,
  isOwner,
  onDelete,
  onEdit,
  emptyLabel,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  if (!rows?.length) {
    return <Paper sx={{ p: 2 }}>{emptyLabel}</Paper>;
  }

  const canMutate = (row) => isOwner || row.createdBy?.id === currentUserId;
  const showActions = rows.some(canMutate);

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditName(row.name);
    setEditAmount(String(row.amount));
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id) => {
    const amount = Number(editAmount);
    if (!editName.trim() || !amount || amount <= 0) return;
    await onEdit(id, { name: editName.trim(), amount });
    setEditingId(null);
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Created by</TableCell>
            {showActions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const allowed = canMutate(row);
            const isEditing = editingId === row.id;

            if (isEditing) {
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <TextField
                      size="small"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                  <TableCell>{row.createdBy?.email}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => saveEdit(row.id)}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={cancelEdit}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            }

            return (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{formatMoney(row.amount)}</TableCell>
                <TableCell>{row.createdBy?.email}</TableCell>
                {showActions && (
                  <TableCell align="right">
                    {allowed && (
                      <>
                        <IconButton
                          size="small"
                          aria-label="edit"
                          onClick={() => startEdit(row)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="delete"
                          onClick={() => onDelete(row.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
