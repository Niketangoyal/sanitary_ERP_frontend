import { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { useDebounce } from "@/hooks/useDebounce";
import type { Product } from "@/types";

interface ProductAutocompleteProps {
  value: Product | null;
  onChange: (product: Product | null) => void;
}

export const ProductAutocomplete = ({ value, onChange }: ProductAutocompleteProps) => {
  const [inputValue, setInputValue] = useState("");
  const debounced = useDebounce(inputValue, 300);

  const { data, isFetching } = useQuery({
    queryKey: ["products", "autocomplete", debounced],
    queryFn: () => productService.list({ search: debounced || undefined, limit: 20, status: "ACTIVE" }),
  });

  const options = data?.data ?? [];

  return (
    <Autocomplete
      size="small"
      options={options}
      value={value}
      loading={isFetching}
      onChange={(_e, val) => onChange(val)}
      onInputChange={(_e, val) => setInputValue(val)}
      getOptionLabel={(option) => option.itemName}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <div>
            <div>{option.itemName}</div>
            <div style={{ fontSize: 12, color: "#888" }}>
              {[option.brand, option.category].filter(Boolean).join(" · ")}
            </div>
          </div>
        </li>
      )}
      renderInput={(params) => <TextField {...params} placeholder="Search product..." />}
      sx={{ minWidth: 220 }}
    />
  );
};
