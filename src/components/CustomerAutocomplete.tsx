import { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";
import { useDebounce } from "@/hooks/useDebounce";
import type { Customer } from "@/types";

interface CustomerAutocompleteProps {
  value: Customer | null;
  onChange: (customer: Customer | null) => void;
  error?: boolean;
  helperText?: string;
}

export const CustomerAutocomplete = ({ value, onChange, error, helperText }: CustomerAutocompleteProps) => {
  const [inputValue, setInputValue] = useState("");
  const debounced = useDebounce(inputValue, 300);

  const { data, isFetching } = useQuery({
    queryKey: ["customers", "autocomplete", debounced],
    queryFn: () => customerService.list({ search: debounced || undefined, limit: 20, isActive: "true" }),
  });

  const options = data?.data ?? [];

  return (
    <Autocomplete
      options={options}
      value={value}
      loading={isFetching}
      onChange={(_e, val) => onChange(val)}
      onInputChange={(_e, val) => setInputValue(val)}
      getOptionLabel={(option) => option.companyName}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <div>
            <div>{option.companyName}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{option.mobile}</div>
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Customer"
          required
          error={error}
          helperText={helperText}
          placeholder="Search customer by name or mobile..."
        />
      )}
    />
  );
};
