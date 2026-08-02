import { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";
import { useDebounce } from "@/hooks/useDebounce";
import type { Employee } from "@/types";

interface EmployeeAutocompleteProps {
  value: Employee | null;
  onChange: (employee: Employee | null) => void;
  label?: string;
}

export const EmployeeAutocomplete = ({ value, onChange, label = "Employee" }: EmployeeAutocompleteProps) => {
  const [inputValue, setInputValue] = useState("");
  const debounced = useDebounce(inputValue, 300);

  const { data, isFetching } = useQuery({
    queryKey: ["employees", "autocomplete", debounced],
    queryFn: () => employeeService.list({ search: debounced || undefined, limit: 20 }),
  });

  const options = data?.data ?? [];

  return (
    <Autocomplete
      options={options}
      value={value}
      loading={isFetching}
      onChange={(_e, val) => onChange(val)}
      onInputChange={(_e, val) => setInputValue(val)}
      getOptionLabel={(option) => option.fullName}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <div>
            <div>{option.fullName}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{option.employeeCode}</div>
          </div>
        </li>
      )}
      renderInput={(params) => <TextField {...params} label={label} placeholder="All employees" />}
    />
  );
};
