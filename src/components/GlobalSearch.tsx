import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, Box, InputAdornment, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PeopleIcon from "@mui/icons-material/PeopleAltOutlined";
import Inventory2Icon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLongOutlined";
import { useQuery } from "@tanstack/react-query";
import { searchService } from "@/services/search.service";
import type { SearchResultItem } from "@/services/search.service";
import { useDebounce } from "@/hooks/useDebounce";

const TYPE_ICON: Record<SearchResultItem["type"], typeof PeopleIcon> = {
  customer: PeopleIcon,
  product: Inventory2Icon,
  invoice: ReceiptLongIcon,
};

export const GlobalSearch = () => {
  const [inputValue, setInputValue] = useState("");
  const debounced = useDebounce(inputValue, 350);
  const navigate = useNavigate();

  const { data: options = [], isFetching } = useQuery({
    queryKey: ["global-search", debounced],
    queryFn: () => searchService.search(debounced),
    enabled: debounced.trim().length >= 2,
  });

  const groupedOptions = useMemo(() => options, [options]);

  return (
    <Autocomplete<SearchResultItem>
      size="small"
      sx={{ maxWidth: 480 }}
      options={groupedOptions}
      loading={isFetching}
      filterOptions={(x) => x}
      groupBy={(option) => option.type}
      getOptionLabel={(option) => option.title}
      noOptionsText={debounced.length < 2 ? "Type to search..." : "No results"}
      onInputChange={(_e, value) => setInputValue(value)}
      onChange={(_e, value) => {
        if (value) navigate(value.link);
      }}
      renderOption={(props, option) => {
        const Icon = TYPE_ICON[option.type];
        return (
          <Box component="li" {...props} key={`${option.type}-${option.id}`}>
            <Icon fontSize="small" sx={{ mr: 1.5, color: "text.secondary" }} />
            <Box>
              <Typography variant="body2">{option.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {option.subtitle}
              </Typography>
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search customers, products, invoices..."
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    />
  );
};
