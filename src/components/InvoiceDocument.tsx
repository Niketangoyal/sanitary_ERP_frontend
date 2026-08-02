import { Box, Divider, Grid2 as Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { formatCurrency, formatDate } from "@/utils/format";
import { PAYMENT_MODE_LABELS, SALE_TYPE_LABELS } from "@/utils/constants";
import { PaymentStatusChip } from "@/components/StatusChip";
import type { Sale, Settings } from "@/types";

interface InvoiceDocumentProps {
  sale: Sale;
  settings: Settings;
}

export const InvoiceDocument = ({ sale, settings }: InvoiceDocumentProps) => {
  const customer = sale.customer;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        p: { xs: 2.5, sm: 4 },
        borderRadius: 3,
        "@media print": { p: 0, boxShadow: "none" },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {settings.businessName}
          </Typography>
          {settings.address && (
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
              {settings.address}
            </Typography>
          )}
          {settings.gstNumber && (
            <Typography variant="body2" color="text.secondary">
              GSTIN: {settings.gstNumber}
            </Typography>
          )}
          {settings.phone && (
            <Typography variant="body2" color="text.secondary">
              Phone: {settings.phone}
            </Typography>
          )}
        </Box>
        <Box textAlign="right">
          <Typography variant="h5" color="primary.main" fontWeight={700}>
            TAX INVOICE
          </Typography>
          <Typography variant="body2">
            <strong>Invoice No:</strong> {sale.invoiceNumber}
          </Typography>
          <Typography variant="body2">
            <strong>Date:</strong> {formatDate(sale.invoiceDate)}
          </Typography>
          <Typography variant="body2">
            <strong>Sale Type:</strong> {SALE_TYPE_LABELS[sale.saleType]}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      <Stack direction="row" justifyContent="space-between">
        <Box>
          <Typography variant="caption" color="text.secondary">
            BILL TO
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {customer?.companyName}
          </Typography>
          {customer?.contactPerson && <Typography variant="body2">{customer.contactPerson}</Typography>}
          {customer?.address && <Typography variant="body2">{customer.address}</Typography>}
          <Typography variant="body2">Mobile: {customer?.mobile}</Typography>
          {customer?.gstNumber && <Typography variant="body2">GSTIN: {customer.gstNumber}</Typography>}
        </Box>
      </Stack>

      <Grid container spacing={2} sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Typography variant="caption" color="text.secondary">
            PAYMENT STATUS
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <PaymentStatusChip status={sale.paymentStatus} />
          </Box>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Typography variant="caption" color="text.secondary">
            PAYMENT METHOD
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {sale.paymentMethod ? PAYMENT_MODE_LABELS[sale.paymentMethod] : "-"}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Typography variant="caption" color="text.secondary">
            AMOUNT PAID
          </Typography>
          <Typography variant="body2" fontWeight={600} color="success.main">
            {formatCurrency(sale.amountPaid)}
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Typography variant="caption" color="text.secondary">
            BALANCE DUE
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            color={Number(sale.balanceDue) > 0 ? "warning.main" : "success.main"}
          >
            {formatCurrency(sale.balanceDue)}
          </Typography>
        </Grid>
      </Grid>

      <Table size="small" sx={{ mt: 3 }}>
        <TableHead>
          <TableRow sx={{ "& th": { fontWeight: 700, borderBottom: "2px solid", borderColor: "divider" } }}>
            <TableCell>#</TableCell>
            <TableCell>Item</TableCell>
            <TableCell align="right">Qty</TableCell>
            <TableCell align="right">Rate</TableCell>
            <TableCell align="right">Disc %</TableCell>
            <TableCell align="right">GST %</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sale.items?.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.itemName}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">{formatCurrency(item.rate)}</TableCell>
              <TableCell align="right">{Number(item.discountPercent)}%</TableCell>
              <TableCell align="right">{Number(item.gstPercent)}%</TableCell>
              <TableCell align="right">{formatCurrency(item.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Stack alignItems="flex-end" sx={{ mt: 2 }}>
        <Box sx={{ minWidth: 260 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography>{formatCurrency(sale.subtotal)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
            <Typography color="text.secondary">Discount</Typography>
            <Typography>- {formatCurrency(sale.discountTotal)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
            <Typography color="text.secondary">GST</Typography>
            <Typography>+ {formatCurrency(sale.gstTotal)}</Typography>
          </Stack>
          <Divider sx={{ my: 0.5 }} />
          <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Grand Total
            </Typography>
            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
              {formatCurrency(sale.grandTotal)}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
            <Typography color="text.secondary">Amount Paid</Typography>
            <Typography color="success.main">{formatCurrency(sale.amountPaid)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
            <Typography variant="subtitle2">Balance Due</Typography>
            <Typography
              variant="subtitle2"
              color={Number(sale.balanceDue) > 0 ? "warning.main" : "success.main"}
            >
              {formatCurrency(sale.balanceDue)}
            </Typography>
          </Stack>
        </Box>
      </Stack>

      {sale.notes && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            NOTES
          </Typography>
          <Typography variant="body2">{sale.notes}</Typography>
        </Box>
      )}

      {settings.invoiceFooter && (
        <>
          <Divider sx={{ my: 2.5 }} />
          <Typography variant="caption" color="text.secondary">
            {settings.invoiceFooter}
          </Typography>
        </>
      )}
    </Box>
  );
};
