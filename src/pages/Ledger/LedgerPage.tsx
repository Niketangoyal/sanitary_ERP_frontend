import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import {
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import PrintIcon from "@mui/icons-material/PrintOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { CustomerAutocomplete } from "@/components/CustomerAutocomplete";
import { customerService } from "@/services/customer.service";
import { ledgerService } from "@/services/ledger.service";
import { pdfService } from "@/services/pdf.service";
import { useRememberedFilters } from "@/hooks/useRememberedFilters";
import { formatCurrency, formatDate } from "@/utils/format";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import type { Customer } from "@/types";

const LEDGER_TYPE_LABEL: Record<string, string> = {
  OPENING: "Opening Balance",
  SALE: "Sale",
  RETURN: "Return",
  PAYMENT: "Payment",
  ADJUSTMENT: "Adjustment",
};

export const LedgerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCustomerId = searchParams.get("customerId");

  const [filters, setFilters] = useRememberedFilters("ledger", {
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  });

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: urlCustomer } = useQuery({
    queryKey: ["customers", urlCustomerId],
    queryFn: () => customerService.getById(urlCustomerId as string),
    enabled: !!urlCustomerId && selectedCustomer === null,
  });

  useEffect(() => {
    if (urlCustomer && !selectedCustomer) {
      setSelectedCustomer(urlCustomer.customer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCustomer]);

  const { data: statement, isLoading } = useQuery({
    queryKey: ["ledger", selectedCustomer?.id, filters.from, filters.to],
    queryFn: () =>
      ledgerService.getStatement(selectedCustomer!.id, { from: filters.from, to: filters.to }),
    enabled: !!selectedCustomer,
  });

  const handleCustomerChange = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    if (customer) {
      setSearchParams({ customerId: customer.id });
    } else {
      setSearchParams({});
    }
  };

  return (
    <>
      <PageHeader
        title="Customer Ledger"
        subtitle="Cash & bill account statement with running balances"
        actions={
          statement && (
            <Stack direction="row" spacing={1.5} className="no-print">
              <Button startIcon={<PrintIcon />} onClick={() => window.print()}>
                Print
              </Button>
              <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={() =>
                  pdfService.downloadLedger(
                    statement.customer.id,
                    statement.customer.companyName,
                    filters.from,
                    filters.to,
                  )
                }
              >
                Export PDF
              </Button>
            </Stack>
          )
        }
      />

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 2.5 }} className="no-print">
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomerAutocomplete value={selectedCustomer} onChange={handleCustomerChange} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DatePicker
              label="From"
              value={dayjs(filters.from)}
              onChange={(val: Dayjs | null) => setFilters({ ...filters, from: val?.format("YYYY-MM-DD") ?? filters.from })}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <DatePicker
              label="To"
              value={dayjs(filters.to)}
              onChange={(val: Dayjs | null) => setFilters({ ...filters, to: val?.format("YYYY-MM-DD") ?? filters.to })}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
        </Grid>
      </Paper>

      {!selectedCustomer && (
        <Paper variant="outlined" sx={{ p: 6, borderRadius: 3, textAlign: "center" }}>
          <Typography color="text.secondary">Select a customer to view their ledger.</Typography>
        </Paper>
      )}

      {selectedCustomer && statement && !isLoading && (
        <>
          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard
                label="Cash Account Balance"
                value={formatCurrency(statement.closingCashBalance)}
                icon={AccountBalanceWalletOutlinedIcon}
                color={statement.closingCashBalance > 0 ? "warning" : "success"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard
                label="Bill Account Balance"
                value={formatCurrency(statement.closingBillBalance)}
                icon={ReceiptLongOutlinedIcon}
                color={statement.closingBillBalance > 0 ? "warning" : "success"}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard
                label="Total Outstanding"
                value={formatCurrency(statement.closingTotalBalance)}
                icon={PaidOutlinedIcon}
                color={statement.closingTotalBalance > 0 ? "error" : "success"}
              />
            </Grid>
          </Grid>

          <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">{statement.customer.companyName}</Typography>
              <Chip
                size="small"
                label={`${formatDate(filters.from)} to ${formatDate(filters.to)}`}
              />
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Reference No.</TableCell>
                    <TableCell align="right">Debit</TableCell>
                    <TableCell align="right">Credit</TableCell>
                    <TableCell align="right">Cash Balance</TableCell>
                    <TableCell align="right">Bill Balance</TableCell>
                    <TableCell align="right">Running Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell colSpan={3}>
                      <strong>Opening Balance</strong>
                    </TableCell>
                    <TableCell align="right">-</TableCell>
                    <TableCell align="right">-</TableCell>
                    <TableCell align="right">{formatCurrency(statement.openingCashBalance)}</TableCell>
                    <TableCell align="right">{formatCurrency(statement.openingBillBalance)}</TableCell>
                    <TableCell align="right">
                      <strong>
                        {formatCurrency(statement.openingCashBalance + statement.openingBillBalance)}
                      </strong>
                    </TableCell>
                  </TableRow>
                  {statement.entries.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>{formatDate(entry.entryDate)}</TableCell>
                      <TableCell>
                        {entry.description}
                        <Chip
                          size="small"
                          label={LEDGER_TYPE_LABEL[entry.type]}
                          sx={{ ml: 1 }}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{entry.referenceNumber ?? "-"}</TableCell>
                      <TableCell align="right">
                        {Number(entry.debit) > 0 ? formatCurrency(entry.debit) : "-"}
                      </TableCell>
                      <TableCell align="right">
                        {Number(entry.credit) > 0 ? formatCurrency(entry.credit) : "-"}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(entry.cashBalanceAfter)}</TableCell>
                      <TableCell align="right">{formatCurrency(entry.billBalanceAfter)}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(Number(entry.cashBalanceAfter) + Number(entry.billBalanceAfter))}
                      </TableCell>
                    </TableRow>
                  ))}
                  {statement.entries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No transactions in this date range.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="subtitle1">
                Closing Balance: {formatCurrency(statement.closingTotalBalance)}
              </Typography>
            </Stack>
          </Paper>
        </>
      )}
    </>
  );
};

export default LedgerPage;
