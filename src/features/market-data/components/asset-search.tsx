'use client';

import * as React from 'react';
import { ChevronsUpDown, Plus, Search } from 'lucide-react';
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

  React.useEffect(() => {
    async function loadAssets() {
      const data = await getTopAssets();
      setAssets(data);
    }
    loadAssets();
  }, []);

  const filteredAssets = assets.filter(a => !excludeIds.includes(a.id.toUpperCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="flex h-9 w-[250px] items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 shrink-0 opacity-50" />
          <span className="text-muted-foreground">Add asset...</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search symbols (e.g. bitcoin)" className="text-sm" />
          <CommandList>
            <CommandEmpty className="text-xs py-6 text-center text-muted-foreground">No asset found.</CommandEmpty>
            <CommandGroup heading="Available Assets">
              {filteredAssets.map((asset) => (
                <CommandItem
                  key={asset.id}
                  value={asset.id}
                  onSelect={(currentValue) => {
                    onSelect(currentValue);
                    setOpen(false);
                  }}
                  className="aria-selected:bg-muted/60"
                >
                  <Plus className="mr-2 h-3 w-3 text-muted-foreground" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono font-bold leading-none">{asset.symbol}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80">{asset.name}</span>
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
