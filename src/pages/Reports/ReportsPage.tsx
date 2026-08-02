import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Tab, Tabs } from "@mui/material";
import { PageHeader } from "@/components/PageHeader";
import { OutstandingReportTab } from "./OutstandingReportTab";
import { SalesReportTab } from "./SalesReportTab";
import { ReturnsReportTab } from "./ReturnsReportTab";
import { PaymentsReportTab } from "./PaymentsReportTab";
import { ItemWiseSalesReportTab } from "./ItemWiseSalesReportTab";
import { MonthlySalesReportTab } from "./MonthlySalesReportTab";
import { DateWiseSalesReportTab } from "./DateWiseSalesReportTab";
import { ProfitReportTab } from "./ProfitReportTab";
import { LeaveReportTab } from "./LeaveReportTab";
import { AdvanceReportTab } from "./AdvanceReportTab";

const TABS = [
  { key: "profit", label: "Profit" },
  { key: "outstanding", label: "Outstanding" },
  { key: "sales", label: "Sales" },
  { key: "returns", label: "Returns" },
  { key: "payments", label: "Payments" },
  { key: "item-wise", label: "Item Wise Sales" },
  { key: "monthly", label: "Monthly Sales" },
  { key: "date-wise", label: "Date Wise Sales" },
  { key: "leave", label: "Leave" },
  { key: "advances", label: "Advances" },
  { key: "ledger", label: "Customer Ledger" },
] as const;

export const ReportsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("profit");

  const handleChange = (_e: SyntheticEvent, value: (typeof TABS)[number]["key"]) => {
    if (value === "ledger") {
      navigate("/ledger");
      return;
    }
    setTab(value);
  };

  return (
    <>
      <PageHeader title="Reports" subtitle="Business insights and printable statements" />

      <Tabs
        value={tab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2.5, borderBottom: 1, borderColor: "divider" }}
        className="no-print"
      >
        {TABS.map((t) => (
          <Tab key={t.key} value={t.key} label={t.label} />
        ))}
      </Tabs>

      {tab === "profit" && <ProfitReportTab />}
      {tab === "outstanding" && <OutstandingReportTab />}
      {tab === "sales" && <SalesReportTab />}
      {tab === "returns" && <ReturnsReportTab />}
      {tab === "payments" && <PaymentsReportTab />}
      {tab === "item-wise" && <ItemWiseSalesReportTab />}
      {tab === "monthly" && <MonthlySalesReportTab />}
      {tab === "date-wise" && <DateWiseSalesReportTab />}
      {tab === "leave" && <LeaveReportTab />}
      {tab === "advances" && <AdvanceReportTab />}
    </>
  );
};

export default ReportsPage;
