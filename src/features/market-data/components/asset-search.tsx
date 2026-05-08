'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/features/shared/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/features/shared/ui/popover';
import { getTopAssets } from '../api/asset-service';
import { Asset } from '../types';

interface AssetSearchProps {
  onSelect: (assetId: string) => void;
  excludeIds?: string[];
}

export function AssetSearch({ onSelect, excludeIds = [] }: AssetSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function loadAssets() {
      setLoading(true);
      const data = await getTopAssets();
      setAssets(data);
      setLoading(false);
    }
    loadAssets();
  }, []);

  const filteredAssets = assets.filter(a => !excludeIds.includes(a.id.toUpperCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex h-9 w-[250px] items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 shrink-0 opacity-50" />
          <span>Add asset...</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search symbols (e.g. bitcoin)" />
          <CommandList>
            <CommandEmpty>No asset found.</CommandEmpty>
            <CommandGroup heading="Available Assets">
              {filteredAssets.map((asset) => (
                <CommandItem
                  key={asset.id}
                  value={asset.id}
                  onSelect={(currentValue) => {
                    onSelect(currentValue);
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-bold">{asset.symbol}</span>
                    <span className="text-xs text-muted-foreground">{asset.name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
