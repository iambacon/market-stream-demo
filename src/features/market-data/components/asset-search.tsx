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
        className="flex h-9 w-[240px] items-center justify-between rounded-lg border border-input bg-background px-3 text-sm hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 opacity-50" />
          <span className="text-muted-foreground">Add asset...</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search symbols..." />
          <CommandList>
            <CommandEmpty>No asset found.</CommandEmpty>
            <CommandGroup>
              {filteredAssets.map((asset) => (
                <CommandItem
                  key={asset.id}
                  value={asset.id}
                  onSelect={(currentValue) => {
                    onSelect(currentValue);
                    setOpen(false);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-mono font-bold">{asset.symbol}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{asset.name}</span>
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
